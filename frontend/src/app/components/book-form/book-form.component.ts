import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

import { Book} from 'src/app/models/book.model';

import { ReactiveFormsModule, FormsModule, FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-book-form',
  standalone: true,
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.scss'],
  imports: [NgSelectModule, NgbDatepickerModule, ReactiveFormsModule, FormsModule, CommonModule]
})
export class BookFormComponent implements OnInit {

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

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    console.warn(this.formatTypes)
  }

  formatDate(date: { year: number, month: number, day: number }): string {
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    return `${date.year}-${month}-${day}`;
  }

  onSubmit() {
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
