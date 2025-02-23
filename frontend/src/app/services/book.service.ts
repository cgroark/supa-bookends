import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root',
})

export class BookService {
  constructor(private http: HttpClient) {}
  getAllUserBooks(userId: string): Observable<Book[]> {
    // const token = localStorage.getItem('auth_token_bookends');
    const url = `${environment.supabaseUrl}/rest/v1/books?user_id=eq.${userId}`;
    const headers = new HttpHeaders({
      'apikey': environment.supabaseKey,
      // 'Authorization': `Bearer ${token}`, // Required for authenticated requests
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    });

    return this.http.get<Book[]>(url, { headers }).pipe(
      map((responses) => responses.map((response) => Book.fromApiResponse(response)))
    );
  }

  deleteBook(bookId: number): Observable<any> {
    const url = `${environment.supabaseUrl}/rest/v1/books?id=eq.${bookId}`;

    const headers = new HttpHeaders({
      'apikey': environment.supabaseKey, // Supabase API key
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