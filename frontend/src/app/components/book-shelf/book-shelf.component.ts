import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BookShelfState } from '../../services/book-shelf-state';
import { BookItemComponent } from '../book-item/book-item.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';

@Component({
  selector: 'app-book-shelf', standalone: true,
  imports: [BookItemComponent, SkeletonComponent],
  templateUrl: './book-shelf.component.html', styleUrl: './book-shelf.component.scss'
})
export class BookShelfComponent {
  @Input({ required: true }) shelf!: BookShelfState;
  @Input() editable = false;
  @Input() compact = false;
  @Input() columns = 2;
  @Input() label = 'books';
  @Input() singleReading = false;
  @Input() allowMore = true;
  @Output() bookUpdated = new EventEmitter<void>();
}
