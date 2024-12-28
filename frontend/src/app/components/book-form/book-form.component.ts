import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import {NgOptionHighlightModule} from '@ng-select/ng-option-highlight';

import { Book} from 'src/app/models/book.model';
import  {Observable, of, ReplaySubject} from 'rxjs'
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-book-form',
  standalone: true,
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.scss'],
  imports: [NgSelectModule, NgbDatepickerModule, NgOptionHighlightModule, ReactiveFormsModule, FormsModule, CommonModule]
})
export class BookFormComponent implements OnInit {

  protected books$: Observable<any[]>;
  protected bookInput$ = new ReplaySubject<string>(1);

  protected form: FormGroup = new FormGroup({
    title: new FormControl<string>(''),
    author: new FormControl<string>(''),
    overview: new FormControl<string>(''),
    format: new FormControl<number | null>(null),
    status: new FormControl<number | null>(null),
    rating: new FormControl<number | null>(null),
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
    comments: new FormControl<string>(''),
  })
  protected formatTypes = [
    {
      label: 'Text',
      value: 1,
    },
    {
      label: 'Audio',
      value: 2,
    }
  ];
  protected isLoading = false;
  protected isManuallyAdding = false;
  protected ratingOptions = [
    {
      label: '⭐️',
      value: 1,
    },
    {
      label: '⭐️ ⭐️' ,
      value: 2,
    },
    {
      label: '⭐️ ⭐️ ⭐️',
      value: 3,
    },
    {
      label: '⭐️ ⭐️ ⭐️ ⭐️',
      value: 4,
    },
    {
      label: '⭐️ ⭐️ ⭐️ ⭐️ ⭐️',
      value: 5,
    }
  ];
  protected selectedBook: any;
  protected statusOptions = [
    {
      label: 'Add to reading list',
      value: 1,
    },
    {
      label: 'Reading',
      value: 2,
    },
    {
      label: 'Set aside',
      value: 3,
    },
    {
      label: 'Finished',
      value: 4,
    }
  ];

  constructor(private http: HttpClient) {
    this.books$ = this.bookInput$.pipe(
      tap(() => (this.isLoading = true)),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((term) => {
        if (!term) {
          this.isLoading = false;
          return of([]);
        }
        const searchTerm = of(term);
        return this.http.get<any>(`https://www.googleapis.com/books/v1/volumes?q=${term}&langRestrict=en`).pipe(
          map((response) =>
            response.items.map((item: any) => ({
              title: item.volumeInfo?.title || 'Unknown Title',
              authors: item.volumeInfo?.authors || ['Unknown Author'],
              imageUrl: item.volumeInfo?.imageLinks.smallThumbnail,
              overview: item.volumeInfo?.description
            })) || []
          ),
          tap(() => (this.isLoading = false)),
        );
      }),
    );
   }

  ngOnInit(): void {
    console.warn(this.formatTypes)
  }

  onBookChange(selected: any): void {
    console.log('Selected Book:', selected);
    this.selectedBook = selected;
    if(this.selectedBook ) {
      this.form.patchValue({
        title: this.selectedBook.title ? this.selectedBook.title : 'Unknown',
        author: this.selectedBook.authors ? this.selectedBook.authors[0] : 'Unknown',
        overview: this.selectedBook.overview ? this.selectedBook.overview : 'Unknown',
      });
      this.isManuallyAdding = false;
    } else {
      this.form.patchValue({
        title: '',
        author: '',
        overview: '',
      })
    }
  }

  toggleManualAdd(): void {
    this.isManuallyAdding = !this.isManuallyAdding;
  }

  formatDate(date: { year: number, month: number, day: number }): string {
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    return `${date.year}-${month}-${day}`;
  }

  onSubmit(): void{
    if (this.form.valid) {
      const {title, author, overview, format, status, rating, start, end, comments} = this.form.controls;
      console.warn(start)

      const newBook = {
        title: title.value,
        author: author.value,
        overview: overview.value,
        format: format.value,
        status: status.value,
        rating: rating.value,
        start_date: this.formatDate(start.value),
        end_date: this.formatDate(end.value),
        comments: comments.value,
        image_url: null,
      }

      console.warn(newBook)

      this.http
      .post('http://127.0.0.1:8000/books/', newBook) // Notice the URL change
      .subscribe({
        next: (response) => {
          console.log('Item added:', response);
        },
        error: (error) => {
          console.error('Error adding item:', error);
        }
      });
    }
  }
};
