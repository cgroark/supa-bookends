import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { HttpClient } from '@angular/common/http';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest } from 'rxjs';
import { BookFormComponent } from '../book-form/book-form.component';

@Component({
  selector: 'app-bestsellers',
  standalone: true,
  imports: [BookFormComponent, CommonModule, NgbAccordionModule],
  templateUrl: './bestsellers.component.html',
  styleUrl: './bestsellers.component.scss',
  providers: [DatePipe],
})
export class BestsellersComponent implements OnInit {
  @Output() updateBooks = new EventEmitter<void>();
  protected addingTitle: string | null = null;
  protected isLoading = true;
  protected isAdding = false;
  protected lastUpdated: string | null = null;
  protected fictionBooks: any[] = [];
  protected nonFictionBooks: any[] = [];
  protected identifiedBook = false;
  protected selectedBook: any;
  protected bookToAdd: any;
  private currentModal: any;

  constructor(private http: HttpClient, private modalService: NgbModal, private datePipe: DatePipe) {}

  ngOnInit(): void {
    if(!this.fictionBooks.length) {
      const fictionCall$ = this.http
      .get('https://api.nytimes.com/svc/books/v3/lists/hardcover-fiction.json?api-key=BAGqFvDh9IJi1JWLxfJ9SIh2rctbgwiE');
      const nonFictionCall$ = this.http
      .get('https://api.nytimes.com/svc/books/v3/lists/hardcover-nonfiction.json?api-key=BAGqFvDh9IJi1JWLxfJ9SIh2rctbgwiE');

      combineLatest([fictionCall$, nonFictionCall$]).subscribe({
        next: ([fictionResponse, nonFictionResponse]: any) => {
          this.fictionBooks = fictionResponse.results.books;
          this.nonFictionBooks = nonFictionResponse.results.books;
          this.lastUpdated = this.datePipe.transform(fictionResponse?.last_modified);
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error fetching books:', err);
          this.isLoading = false;
          // Optionally, handle error state here, e.g., show an error message to the user
        },
      });
    } else {
      this.isLoading = false;
    }
  }

  onOpenBook(contentBook: any, book: any):void {

    if (this.currentModal) {
      this.currentModal.close();
    }

    this.currentModal = this.modalService.open(contentBook, {
      size: 'md',
      backdrop: 'static',
    });
    this.selectedBook = book;
  }

  onOpenForm(contentForm: any): void {
    if (this.currentModal) {
      this.currentModal.close();
    }

    this.currentModal = this.modalService.open(contentForm, {
      size: 'md',
      backdrop: 'static',
    });
  }

  updateBook(): void {
    this.updateBooks.emit();
  }

  addBestSeller(contentForm: any, book: any): void {
    this.addingTitle = book.title;
    this.isAdding = true;
    const isbns = [
      book.isbns[1]?.isbn10,
      book.isbns[1]?.isbn13,
      book.isbns[0]?.isbn10,
      book.isbns[0]?.isbn13,
    ].filter((isbn) => isbn); // Filter out undefined or null ISBNs
    const searchBookByISBN = (index: number): void => {
      if (index >= isbns.length) {
        this.identifiedBook = false;
        this.bookToAdd = {
          title: book.title ? book.title : 'Unknown title',
          author: book.author ? book.author : 'Unknown author',
        };
        this.isAdding = false;
        this.onOpenForm(contentForm);
        return;
      }

      const isbn = isbns[index];
      this.http
        .get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&langRestrict=en`)
        .subscribe({
          next: (response: any) => {
            if (response?.items?.length > 0) {
              this.bookToAdd = response.items[0];
              this.identifiedBook = true;
              this.onOpenForm(contentForm);
              // this.isAdding = false;
            } else {
              searchBookByISBN(index + 1);
            }
          },
          error: (err) => {
            console.error(`Error searching for ISBN: ${isbn}`, err);
            searchBookByISBN(index + 1);
            this.isAdding = false;
          },
        });
    };
    searchBookByISBN(0);
  }

}
