import { Component, EventEmitter, OnInit, Input, Output, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemMessageService } from '../../services/system-message.service';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { jwtDecode}  from 'jwt-decode';
import { Book} from 'src/app/models/book.model';
import  {Observable, of, ReplaySubject} from 'rxjs'
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-book-form',
  standalone: true,
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.scss'],
  imports: [NgSelectModule, NgbDatepickerModule, NgOptionHighlightModule, ReactiveFormsModule, FormsModule, CommonModule]
})
export class BookFormComponent implements OnInit {
  @Input() noModal = false;
  @Input() editingBook: any;
  @Input() addingBestSeller: any;
  @Input() identifiedBook = true;
  @Output() bookUpdated = new EventEmitter<void>();

  protected books$: Observable<any[]>;
  protected bookInput$ = new ReplaySubject<string>(1);

  protected form: FormGroup = new FormGroup({
    title: new FormControl<string>('',{
        validators: [Validators.required]}),
    author: new FormControl<string>('',{
      validators: [Validators.required]}),
    format: new FormControl<number | null>(null,{
      validators: [Validators.required]}),
    status: new FormControl<number | null>(null,{
      validators: [Validators.required]}),
    rating: new FormControl<number | null>(null),
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
  protected isEditing = false;
  protected isLoading = false;
  protected isSubmitting = false;
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

  constructor(private ngZone: NgZone, private http: HttpClient, private systemMessageService: SystemMessageService, private modalService: NgbModal) {
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
              image_url: item.volumeInfo?.imageLinks?.thumbnail,
              overview: item.volumeInfo?.description
            })) || []
          ),
          tap(() => (this.isLoading = false)),
        );
      }),
    );
   }

  ngOnInit(): void {
    console.warn('adding', this.addingBestSeller)
    if(this.editingBook) {
      console.warn('check editing', this.editingBook);
      this.isEditing = true;
      this.selectedBook = this.editingBook;
      this.form.patchValue(
        {
          title: this.selectedBook.title ?? null,
          author: this.selectedBook.author ?? null,
          format: this.selectedBook.format ?? null,
          status: this.selectedBook.status ?? null,
          rating: this.selectedBook.rating ?? null,
          end: this.selectedBook.end ?? null,
          comments: this.selectedBook.comments ?? null,
        }
      )
    } else if(this.addingBestSeller && this.identifiedBook) {
      console.warn('form check', this.addingBestSeller)
      this.selectedBook = {
        title: this.addingBestSeller.volumeInfo?.title || 'Unknown Title',
        authors: this.addingBestSeller.volumeInfo?.authors || ['Unknown Author'],
        image_url: this.addingBestSeller.volumeInfo?.imageLinks.thumbnail,
        overview: this.addingBestSeller.volumeInfo?.description
      }
      this.form.patchValue(
        {
          title: this.selectedBook.title ? this.selectedBook.title : 'Unknown',
          author: this.selectedBook.authors ? this.selectedBook.authors[0] : 'Unknown',
        }
      )
    } else if(this.addingBestSeller && !this.identifiedBook) {
      console.warn('no book', this.addingBestSeller);
      this.selectedBook = {
        title: this.addingBestSeller.title || 'Unknown Title',
        authors: this.addingBestSeller.author || 'Unknown Author',
      }
      const searchTerm = `${this.addingBestSeller.title || ''} ${this.addingBestSeller.author || ''}`.trim();
      this.bookInput$.next(searchTerm); // Push the term into the ReplaySubject
      console.warn('Search term pushed:', searchTerm);
      console.warn('se', this.selectedBook)
    }
  }

  onBookChange(selected: any): void {
    console.log('Selected Book:', selected);
    this.selectedBook = selected;
    if(this.selectedBook ) {
      this.form.patchValue({
        title: this.selectedBook.title ? this.selectedBook.title : 'Unknown',
        author: this.selectedBook.authors ? this.selectedBook.authors[0] : 'Unknown',
      });
      this.isManuallyAdding = false;
    } else {
      this.form.patchValue({
        title: '',
        author: '',
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

  protected updateBook(): void {
    console.warn('update in book form');
    this.bookUpdated.emit();
  }



  onSubmit(): void{
    console.warn('form', this.form.controls)
    this.isSubmitting = true;
    // Retrieve the token from localStorage
    const token = localStorage.getItem('auth_token_bookends');
    const decodedToken: any = token ? jwtDecode(token) : null;
    if (this.form.valid && decodedToken) {
      const userId = decodedToken.sub;

      const {title, author, format, status, rating, end, comments} = this.form.controls;

      const newBook = {
        title: title.value,
        author: author.value,
        overview:  this.selectedBook ? this.selectedBook.overview : null,
        format: format.value,
        status: status.value,
        rating: rating.value,
        end_date: end.value ? this.formatDate(end.value) : null,
        comments: comments.value,
        image_url: this.selectedBook?.image_url ?? null,
        user_id: userId,
      }
      console.warn('book to send', newBook)

      if (this.isEditing) {
        this.http
        .patch(`http://127.0.0.1:8000/books/${this.selectedBook.id}/`, newBook)
        .subscribe({
          next: (response) => {
            console.log('Book updated:', response);
            this.isSubmitting = false;
            this.modalService.dismissAll();
            // this.selectedBook = null;
            this.isManuallyAdding = false;
            console.warn('EMIT')
            // // this.bookUpdated.emit();
            // this.ngZone.run(() => {
            //   this.bookUpdated.emit(); // Ensure Angular detects this
            // });
            this.bookUpdated.emit();
            this.form.reset();
            // this.isEditing = false;
            this.systemMessageService.showMessage(`Your changes to ${newBook.title} have been saved!`);
          },
          error: (error) => {
            console.error('Error updating book:', error);
            this.isSubmitting = false;
            this.isEditing = false;
          },
        });
      } else {
        this.http
        .post('http://127.0.0.1:8000/books/', newBook)
        .subscribe({
          next: (response) => {
            console.log('Item added:', response);
            this.isSubmitting = false;
            this.modalService.dismissAll();
            this.selectedBook = null;
            this.isManuallyAdding = false;
            this.bookUpdated.emit();
            this.form.reset();
            this.systemMessageService.showMessage(`${newBook.title} has been added!`);
          },
          error: (error) => {
            console.error('Error adding item:', error);
            this.isSubmitting = false;
          }
        });
      }
    }
  }
};
