import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root',
})

export class BookService {
  private apiUrl = 'http://127.0.0.1:8000/books'

  constructor(private http: HttpClient) {}

  getAllUserBooks(userId: string): Observable<Book[]> {
    const params: any = {};
    params.user_id = userId;
    console.warn('get all in user service');
    const token = localStorage.getItem('auth_token_bookends');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Book[]>(
      this.apiUrl,
      {params, headers}
    ).pipe(
      map((responses) => responses.map((response) => Book.fromApiResponse(response)))
    )
  }

  deleteBook(bookId: number): Observable<any> {
    console.warn('DELETE')
    const token = localStorage.getItem('auth_token_bookends');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${this.apiUrl}/${bookId}`;
    return this.http.delete(url, { headers });
  }
}