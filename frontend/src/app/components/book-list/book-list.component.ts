import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book} from 'src/app/models/book.model';

import { HttpClientModule, HttpClient
} from '@angular/common/http';

@Component({
  selector: 'app-book-list',
  standalone: true,
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss'],
  imports: [CommonModule, HttpClientModule]
})
export class BookListComponent implements OnInit {

  // protected bookItems: Book[] = [];
  protected bookItems: any;


  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http
    .get('http://127.0.0.1:8000/books/')
    .subscribe((response) => {
      console.warn('items array', response);
      this.bookItems = response;
    })
  }

}
