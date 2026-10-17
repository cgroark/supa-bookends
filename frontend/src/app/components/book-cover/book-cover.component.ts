import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-book-cover',
  standalone: true,
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

  ngOnChanges(): void { this.imageFailed = false; }
}
