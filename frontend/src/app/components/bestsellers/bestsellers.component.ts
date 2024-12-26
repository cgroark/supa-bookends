import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-bestsellers',
  standalone: true,
  imports: [],
  templateUrl: './bestsellers.component.html',
  styleUrl: './bestsellers.component.scss'
})
export class BestsellersComponent implements OnInit {

  protected fictionBooks: any[] = [];
  protected nonFictionBooks: any[] = [];

  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.http
    .get('https://api.nytimes.com/svc/books/v3/lists/hardcover-fiction.json?api-key=BAGqFvDh9IJi1JWLxfJ9SIh2rctbgwiE')
    .subscribe((response: any) => {
      this.fictionBooks = response.results.books;
      console.warn('best', this.fictionBooks)
    });

    this.http
    .get('https://api.nytimes.com/svc/books/v3/lists/hardcover-nonfiction.json?api-key=BAGqFvDh9IJi1JWLxfJ9SIh2rctbgwiE')
    .subscribe((response: any) => {
      this.nonFictionBooks = response.results.books;
      console.warn('best', this.nonFictionBooks)
    })



  }
}
