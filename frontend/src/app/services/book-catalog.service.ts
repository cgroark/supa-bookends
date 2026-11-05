import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CatalogBook {
  title: string;
  authors: string[];
  image_url: string | null;
  overview: string | null;
  openLibraryWorkKey?: string;
}

@Injectable({ providedIn: 'root' })
export class BookCatalogService {
  constructor(private http: HttpClient) {}

  search(query: string): Observable<CatalogBook[]> {
    const params = new HttpParams().set('q', query)
      .set('fields', 'key,title,author_name,cover_i').set('limit', 20);
    return this.http.get<{ docs?: any[] }>('https://openlibrary.org/search.json', { params }).pipe(
      map(response => (response.docs || []).map(item => ({
        title: item.title || 'Unknown Title',
        authors: item.author_name?.length ? item.author_name : ['Unknown Author'],
        image_url: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg?default=false` : null,
        overview: null,
        openLibraryWorkKey: item.key,
      }))),
    );
  }
}
