import { SkeletonComponent } from '../skeleton/skeleton.component';
import { DecodedImageDirective } from '../../directives/decoded-image.directive';
import { Component, EventEmitter, Input, OnChanges, SimpleChanges, Output } from '@angular/core';

@Component({
  selector: 'app-book-cover',
  standalone: true,
  imports: [SkeletonComponent, DecodedImageDirective],
  templateUrl: './book-cover.component.html',
  styleUrl: './book-cover.component.scss'
})
export class BookCoverComponent implements OnChanges {
  @Input() imageUrl: string | null = null;
  @Input() title = '';
  @Input() author = '';
  @Input() compact = false;
  @Output() opened = new EventEmitter<void>();
  protected imageFailed = false;
  protected loading = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['imageUrl']) return;
    this.imageFailed = false;
    this.loading = !!this.imageUrl;
  }
}
