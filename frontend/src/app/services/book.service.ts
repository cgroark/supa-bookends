import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root',
})

export class BookService {
  constructor(private http: HttpClient) {}
  private get headers(): HttpHeaders {
    return new HttpHeaders({ apikey: environment.supabaseKey, Prefer: 'count=exact' });
  }

  private queryParams(query: BookQuery): HttpParams {
    let params = new HttpParams().set('user_id', `eq.${query.userId}`);
    if (query.status !== undefined) params = params.set('status', `eq.${query.status}`);
    if (query.from) params = params.append('end_date', `gte.${query.from}`);
    if (query.to) params = params.append('end_date', `lt.${query.to}`);
    if (query.undated) params = params.set('end_date', 'is.null');
    if (query.search?.trim()) {
      const literal = query.search.trim().replace(/[\\%_]/g, '\\$&').replace(/"/g, '\\"');
      const pattern = `"%${literal}%"`;
      params = params.set('or', `(title.ilike.${pattern},author.ilike.${pattern})`);
    }
    return params;
  }

  private responseCount(range: string | null): number {
    const total = range?.match(/\/(\d+)$/)?.[1];
    if (total === undefined) throw new Error('The book API did not return its total count.');
    return Number(total);
  }

  getBookPage(query: BookQuery, offset = 0, limit = 6): Observable<BookPage> {
    const order = query.status === 4 ? 'end_date.desc.nullslast,id.desc' : 'title.asc,id.asc';
    const params = this.queryParams(query).set('select', '*').set('order', order)
      .set('offset', Math.max(0, offset)).set('limit', Math.min(50, Math.max(1, limit)));
    return this.http.get<Book[]>(`${environment.supabaseUrl}/rest/v1/books`, {
      params, headers: this.headers, observe: 'response'
    }).pipe(map(response => ({
      books: (response.body ?? []).map(book => Book.fromApiResponse(book)),
      total: this.responseCount(response.headers.get('Content-Range'))
    })), catchError(error => {
      // Another client may delete books between pages, putting this offset past the end.
      if (error.status === 416) {
        const total = error.headers?.get('Content-Range')?.match(/\/(\d+)$/)?.[1];
        return of({ books: [], total: total === undefined ? offset : Number(total) });
      }
      return throwError(() => error);
    }));
  }

  getBookCount(query: BookQuery): Observable<number> {
    return this.http.head(`${environment.supabaseUrl}/rest/v1/books`, {
      params: this.queryParams(query).set('select', 'id'), headers: this.headers, observe: 'response'
    }).pipe(map(response => this.responseCount(response.headers.get('Content-Range'))));
  }

  // Check only titles currently in the search results, never download a whole library.
  findExistingBooks(userId: string, titles: string[]): Observable<Book[]> {
    if (!titles.length) return of([]);
    const values = [...new Set(titles)].map(title => `"${title.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',');
    const params = new HttpParams().set('user_id', `eq.${userId}`)
      .set('title', `in.(${values})`).set('select', 'title,author');
    return this.http.get<Book[]>(`${environment.supabaseUrl}/rest/v1/books`, { params, headers: this.headers });
  }

  deleteBook(bookId: number): Observable<any> {
    const url = `${environment.supabaseUrl}/rest/v1/books?id=eq.${bookId}`;

    const headers = new HttpHeaders({
      'apikey': environment.supabaseKey,
      'Content-Type': 'application/json'
    });

    return this.http.delete(url, { headers });
  }

  createBook(book: any): Observable<Book> {
    const url = `${environment.supabaseUrl}/rest/v1/books`;
    const headers = new HttpHeaders({
      'apikey': environment.supabaseKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    });

    return this.http.post<Book>(url, book, { headers });
  }

  updateBook(bookId: number, book: any): Observable<Book> {
    const url = `${environment.supabaseUrl}/rest/v1/books?id=eq.${bookId}`;
    const headers = new HttpHeaders({
      'apikey': environment.supabaseKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    });

    return this.http.patch<Book>(url, book, { headers });
  }
}
export interface BookQuery {
  userId: string;
  status?: number;
  from?: string;
  to?: string;
  undated?: boolean;
  search?: string;
}
export interface BookPage { books: Book[]; total: number; }
