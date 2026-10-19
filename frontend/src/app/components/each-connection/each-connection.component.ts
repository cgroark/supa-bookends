import { BookShelfState } from '../../services/book-shelf-state';
import { BookShelfComponent } from '../book-shelf/book-shelf.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { RouterModule } from '@angular/router';
import { Book } from 'src/app/models/book.model';
import { BookItemComponent } from '../book-item/book-item.component';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-each-connection',
  standalone: true,
  imports: [BookShelfComponent, SkeletonComponent, BookItemComponent, RouterModule],
  templateUrl: './each-connection.component.html',
  styleUrl: './each-connection.component.scss'
})
export class EachConnectionComponent implements OnInit, OnDestroy {
  @Input() connection: any;
  @Input() connectionsCount: number = 0;
  @Input() allowRemoval = true;
  @Input() minimize = false;
  @Output() unfollow = new EventEmitter<void>();
  @Output() bookUpdated = new EventEmitter<void>();


  protected currentShelf!: BookShelfState;
  protected latestShelf!: BookShelfState;
  protected get isLoading(): boolean { return !this.latestShelf || this.latestShelf.loading; }
  protected get currentBooks(): Book[] { return this.currentShelf?.books ?? []; }
  protected get recentBooks(): Book[] { return this.latestShelf?.books ?? []; }
  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.currentShelf = new BookShelfState(this.bookService, { userId: this.connection.id, status: 2 }, 3, 6, () => {
      const limit = this.minimize ? (this.currentShelf.total ? 3 : 6) : 2;
      if (this.latestShelf) {
        if (this.latestShelf.initialSize !== limit) {
          this.latestShelf.initialSize = limit;
          this.latestShelf.reset();
        }
        return;
      }
      this.latestShelf = new BookShelfState(this.bookService, { userId: this.connection.id, status: 4 }, limit);
      this.latestShelf.reset();
    });
    this.currentShelf.reset();
  }
  ngOnDestroy(): void { this.currentShelf?.destroy(); this.latestShelf?.destroy(); }
  protected removeConnection():void {
    this.unfollow.emit(this.connection.id);
  }

  protected fetchBooks() {
    this.bookUpdated.emit();
  }

}
