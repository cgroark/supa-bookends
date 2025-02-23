import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemMessageService } from '../../services/system-message.service';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { jwtDecode}  from 'jwt-decode';
import { Book} from 'src/app/models/book.model';
import { BookService } from 'src/app/services/book.service';
import  {Observable, of, ReplaySubject, Subject} from 'rxjs'
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  takeUntil,
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
  @Input() scrubBook = false;
  @Input() allUserBooks: Book[] = []
  @Output() bookUpdated = new EventEmitter<void>();

  protected books$: Observable<any[]>;
  protected bookInput$ = new ReplaySubject<string>(1);
  protected isExpanded = false;

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
      label: `<i class="bi bi-star-fill me-1"></i>`,
      value: 1,
    },
    {
      label: `<i class="bi bi-star-fill me-1"></i><i class="bi bi-star-fill me-1"></i>` ,
      value: 2,
    },
    {
      label: `<i class="bi bi-star-fill me-1"></i><i class="bi bi-star-fill me-1"></i><i class="bi bi-star-fill me-1"></i>` ,
      value: 3,
    },
    {
      label: `<i class="bi bi-star-fill me-1"></i><i class="bi bi-star-fill me-1"></i><i class="bi bi-star-fill me-1"></i><i class="bi bi-star-fill me-1"></i>` ,
      value: 4,
    },
    {
      label: `<i class="bi bi-star-fill me-1"></i><i class="bi bi-star-fill me-1"></i><i class="bi bi-star-fill me-1"></i><i class="bi bi-star-fill me-1"></i><i class="bi bi-star-fill me-1"></i>` ,
      value: 5,
    }
  ];
  protected selectedBook: any;
  protected statusOptions = [
    {
      label: 'Want to read',
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
  private destroyed$ = new Subject<void>();
  private currentModal: any;

  constructor(private bookService: BookService, private http: HttpClient, private systemMessageService: SystemMessageService, private modalService: NgbModal) {

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
              overview: item.volumeInfo?.description,
              disabled: this.alreadyAdded(item.volumeInfo?.title, item.volumeInfo?.authors),
            })) || []
          ),
          tap(() => (this.isLoading = false)),
        );
      }),
    );


    this.form.controls['status'].valueChanges
      .pipe(
        takeUntil(this.destroyed$),
      )
      .subscribe((status) => {
        if (status === 4) {
          const today = new Date();
          const formattedDate = {
            year: today.getFullYear(),
            month: today.getMonth() + 1,
            day: today.getDate(),
          };
          this.form.controls['rating'].setValidators(Validators.required);
          this.form.controls['end'].setValidators(Validators.required);
          this.form.patchValue({
            end:formattedDate,
          })
        } else {
          this.form.patchValue({
            end: null,
            rating: null,
          })
          this.form.controls['end'].clearValidators();
          this.form.controls['end'].updateValueAndValidity();
          this.form.controls['rating'].clearValidators();
          this.form.controls['rating'].updateValueAndValidity();

        }
      });
   }

  private convertToNgbDate(dateString: string): { year: number; month: number; day: number } {
    const date = new Date(dateString);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1, // Months are 0-based in JS
      day: date.getDate(),
    };
  }

  ngOnInit(): void {
    if(this.editingBook) {
      this.isEditing = !this.scrubBook;
      this.selectedBook = this.editingBook;
      this.form.patchValue(
        {
          title: this.selectedBook.title ?? null,
          author: this.selectedBook.author ?? null,
          format: (this.selectedBook.format && !this.scrubBook) ? this.selectedBook.format : null,
          status: (this.selectedBook.status && !this.scrubBook) ? this.selectedBook.status : null,
          rating: (this.selectedBook.rating && !this.scrubBook) ? this.selectedBook.rating : null,
          end: (this.selectedBook.end_date && !this.scrubBook) ? this.convertToNgbDate(this.selectedBook.end_date) : null,
          comments: (this.selectedBook.comments && !this.scrubBook) ? this.selectedBook.comments : null,
        }
      )
    } else if(this.addingBestSeller && this.identifiedBook) {
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
      this.selectedBook = {
        title: this.addingBestSeller.title || 'Unknown Title',
        authors: this.addingBestSeller.author || 'Unknown Author',
      }
      const searchTerm = `${this.addingBestSeller.title || ''} ${this.addingBestSeller.author || ''}`.trim();
      this.bookInput$.next(searchTerm); // Push the term into the ReplaySubject
    }
  }

  protected alreadyAdded(title: string, authors: any): boolean {
    return this.allUserBooks.some(each => each.title === title && each.author === authors[0] );
  }

  protected onBookChange(selected: any): void {
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

  protected toggleManualAdd(): void {
    this.isManuallyAdding = !this.isManuallyAdding;
  }

  protected formatDate(date: { year: number, month: number, day: number }): string {
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    return `${date.year}-${month}-${day}`;
  }

  protected toggleView() {
    this.isExpanded = !this.isExpanded;
  }

  protected onSubmit(): void {
    const token = localStorage.getItem('auth_token_bookends');
    const decodedToken: any = token ? jwtDecode(token) : null;

    if (this.form.valid && decodedToken) {
      this.isSubmitting = true;
      const userId = decodedToken.sub;
      const { title, author, format, status, rating, end, comments } = this.form.controls;

      const newBook = {
        title: title.value,
        author: author.value,
        overview: this.selectedBook ? this.selectedBook.overview : null,
        format: format.value,
        status: status.value,
        rating: rating.value,
        end_date: end.value ? this.formatDate(end.value) : null,
        comments: comments.value,
        image_url: this.selectedBook?.image_url ?? null,
        user_id: userId,
      };

      if (this.isEditing && this.selectedBook) {
        this.bookService.updateBook(this.selectedBook.id, newBook).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.modalService.dismissAll();
            this.selectedBook = null;
            this.isManuallyAdding = false;
            this.bookUpdated.emit();
            this.form.reset();
            this.isEditing = false;
            this.systemMessageService.showMessage(`Your changes to ${newBook.title} have been saved!`);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.isEditing = false;
            console.error('Update failed', error);
          },
        });
      } else {
        this.bookService.createBook(newBook).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.modalService.dismissAll();
            this.selectedBook = null;
            this.isManuallyAdding = false;
            this.bookUpdated.emit();
            this.form.reset();
            this.systemMessageService.showMessage(`${newBook.title} has been added!`);
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('Creation failed', error);
          },
        });
      }
    }
  }

};
