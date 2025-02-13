import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { RouterModule } from '@angular/router';
import { Book } from 'src/app/models/book.model';
import { BookItemComponent } from '../book-item/book-item.component';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-each-connection',
  standalone: true,
  imports: [BookItemComponent, RouterModule],
  templateUrl: './each-connection.component.html',
  styleUrl: './each-connection.component.scss'
})
export class EachConnectionComponent implements OnInit {
  @Input() connection: any;
  @Input() connectionsCount: number = 0;
  @Input() allowRemoval = true;
  @Input() minimize = false;
  @Output() unfollow = new EventEmitter<void>();
  @Output() bookUpdated = new EventEmitter<void>();


  protected isLoading = true;
  protected currentBooks: Book[] = [];
  protected recentBooks: Book[] = [];
  protected noBooks = false;
  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    console.warn('connection id', this.connection.id)
    this.bookService.getAllUserBooks(this.connection.id).subscribe({
      next: (response: Book[]) => {
        console.warn('response', response)
        this.currentBooks = response.filter((each: Book) =>
          each.status === /*status.reading*/ 2
        );
        console.warn('curr', this.currentBooks);
        this.recentBooks = response.filter((each: Book) =>
          each.status === 4
        ).sort((a: any, b: any) => b.end_date.localeCompare(a.end_date));
        console.warn('rec', this.recentBooks);
        this.noBooks = !this.recentBooks.length && !this.currentBooks.length;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching books:', err);
        this.isLoading = false;
        this.noBooks = true;
      }
    });
  }
  protected removeConnection():void {
    this.unfollow.emit(this.connection.id);
  }

  protected fetchBooks() {
    this.bookUpdated.emit();
  }

}
