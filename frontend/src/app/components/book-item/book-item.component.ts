import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BookFormComponent } from '../book-form/book-form.component';

@Component({
  selector: 'app-book-item',
  standalone: true,
  imports: [BookFormComponent],
  templateUrl: './book-item.component.html',
  styleUrl: './book-item.component.scss'
})
export class BookItemComponent {
  @Input() selectedBook: any;
  @Input() editable = false;
  @Output() bookUpdated = new EventEmitter<void>();

  constructor(private modalService: NgbModal) {}

  onOpenForm(content: any, book: any):void {
    this.modalService.open(content, {
      size: 'md',
      backdrop: 'static',
    });
    this.selectedBook = book;
  }

  onOpenBook(contentBook: any, book: any):void {
    this.modalService.open(contentBook, {
      size: 'md',
      backdrop: 'static',
    });
    this.selectedBook = book;
  }

  protected fetchBooks() {
    console.warn('fetch in item')
    this.bookUpdated.emit();
  }
}
