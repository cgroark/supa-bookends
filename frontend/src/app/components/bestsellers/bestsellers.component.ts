import { SkeletonComponent } from '../skeleton/skeleton.component';
import { BookCoverComponent } from '../book-cover/book-cover.component';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { HttpClient } from '@angular/common/http';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { BookCatalogService, CatalogBook } from '../../services/book-catalog.service';
import { BookFormComponent } from '../book-form/book-form.component';

@Component({
  selector: 'app-bestsellers',
  standalone: true,
  imports: [SkeletonComponent, BookCoverComponent, BookFormComponent, CommonModule, NgbAccordionModule],
  templateUrl: './bestsellers.component.html',
  styleUrl: './bestsellers.component.scss',
  providers: [DatePipe],
})
export class BestsellersComponent implements OnInit {
  @Output() updateBooks = new EventEmitter<void>();
  @Output() noBestsellers = new EventEmitter<void>();
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

  constructor(private http: HttpClient, private modalService: NgbModal, private catalog: BookCatalogService, private datePipe: DatePipe) {}

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
          this.noBestsellers.emit();
        },
      });
    } else {
      this.isLoading = false;
    }
  }

  protected closeAddingModal(): void {
    this.isAdding = false;
    this.currentModal.close();
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
    if (this.isAdding) return;
    this.addingTitle = book.title;
    this.isAdding = true;
    const fallback: CatalogBook = {
      title: book.title || 'Unknown Title',
      authors: [book.author || 'Unknown Author'],
      image_url: book.book_image || null,
      overview: book.description || null,
    };
    const isbns = [...new Set<string>([
      book.primary_isbn13,
      book.primary_isbn10,
      ...(book.isbns || []).flatMap((entry: any) => [entry.isbn13, entry.isbn10]),
    ].filter((isbn): isbn is string => typeof isbn === 'string' && /^(?:[0-9]{13}|[0-9]{9}[0-9Xx])$/.test(isbn)))];
    const query = isbns.length
      ? isbns.map(isbn => `isbn:${isbn}`).join(' OR ')
      : `${fallback.title} ${fallback.authors.join(' ')}`;

    this.catalog.search(query).pipe(
      catchError(() => of([])),
      finalize(() => { this.isAdding = false; this.addingTitle = null; }),
    ).subscribe(results => {
      const normalize = (title: string) => title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
      const title = normalize(fallback.title);
      const match = results.find(result => {
        const candidate = normalize(result.title);
        return candidate === title || candidate.startsWith(`${title} `) || title.startsWith(`${candidate} `);
      });
      this.bookToAdd = match ? {
        ...match,
        image_url: match.image_url || fallback.image_url,
        overview: fallback.overview,
      } : fallback;
      this.identifiedBook = true;
      this.onOpenForm(contentForm);
    });
  }
}
