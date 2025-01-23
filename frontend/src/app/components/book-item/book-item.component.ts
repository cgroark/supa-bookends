import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { BookFormComponent } from '../book-form/book-form.component';
import { SystemMessageService } from '../../services/system-message.service';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-book-item',
  standalone: true,
  imports: [BookFormComponent, CommonModule, NgbDropdownModule],
  templateUrl: './book-item.component.html',
  styleUrl: './book-item.component.scss'
})
export class BookItemComponent {
  @Input() selectedBook: any;
  @Input() editable = false;
  @Output() bookUpdated = new EventEmitter<void>();

  protected isExpanded = false;
  protected isSubmitting = false;
  private currentModal: any;


  constructor(private bookService: BookService, private modalService: NgbModal, private systemMessageService: SystemMessageService) {}

  protected onOpenForm(content: any, book: any):void {
    if (this.currentModal) {
      this.currentModal.close();
    }

    this.currentModal = this.modalService.open(content, {
      size: 'md',
      backdrop: 'static',
    });
    this.selectedBook = book;
  }

  protected onOpenBook(contentBook: any, book: any):void {
    if (this.currentModal) {
      this.currentModal.close();
    }

    this.currentModal = this.modalService.open(contentBook, {
      size: 'md',
      backdrop: 'static',
    });
    this.selectedBook = book;
  }

  protected onOpenDelete(contentDelete: any, book: any):void {
    if (this.currentModal) {
      this.currentModal.close();
    }

    this.currentModal = this.modalService.open(contentDelete, {
      size: 'md',
      backdrop: 'static',
    });
    this.selectedBook = book;
  }

  protected displayRating(rating: number): any {
    let i = 0
    let ratingSet = [];
    while(i<rating) {
      ratingSet.push('<i class="bi bi-star-fill me-1"></i>')
      i++
    }
    console.warn('rating', ratingSet.join(''))
    return ratingSet.join('')
  }

  protected deleteBook(bookId: number): void {
    this.isSubmitting = true;
    this.bookService.deleteBook(bookId).subscribe({
      next: (response) => {
        console.log('Book deleted successfully:', response);
        this.isSubmitting = false;
        this.currentModal.close();
        this.systemMessageService.showMessage(`${this.selectedBook.title} has been deleted!`);
        this.fetchBooks();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error deleting book:', error);
        this.currentModal.close();
      },
    });
  }

  protected toggleView() {
    this.isExpanded = !this.isExpanded;
  }

  protected fetchBooks() {
    console.warn('fetch in item')
    this.bookUpdated.emit();
  }
}
