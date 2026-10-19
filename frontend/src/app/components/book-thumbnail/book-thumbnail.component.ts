import { DecodedImageDirective } from '../../directives/decoded-image.directive';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SkeletonComponent } from '../skeleton/skeleton.component';

@Component({
  selector: 'app-book-thumbnail',
  standalone: true,
  imports: [SkeletonComponent, DecodedImageDirective],
  templateUrl: './book-thumbnail.component.html',
  styleUrl: './book-thumbnail.component.scss'
})
export class BookThumbnailComponent implements OnChanges {
  @Input() imageUrl: string | null = null;
  @Input() title = '';
  protected loading = false;
  protected failed = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['imageUrl']) return;
    this.loading = !!this.imageUrl;
    this.failed = false;
  }
}
