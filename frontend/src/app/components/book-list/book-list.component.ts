import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book} from 'src/app/models/book.model';

import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-book-list',
  standalone: true,
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss'],
  imports: [CommonModule]
})
export class BookListComponent implements OnInit {

  // protected bookItems: Book[] = [];
  protected bookItems: any;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
     // Retrieve the token from localStorage
     const token = localStorage.getItem('auth_token_bookends');

     // Set the Authorization header
     const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
    .get('http://127.0.0.1:8000/books/', { headers })
    .subscribe((response: any) => {
      console.warn('items array', response);
      this.bookItems = response;
    })
  }

}
