import { TestBed } from '@angular/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { Book } from '../../models/book.model';
import { BookPage, BookService } from '../../services/book.service';
import { BookShelfState } from '../../services/book-shelf-state';
import { BookShelfComponent } from './book-shelf.component';

describe('Book shelf View more', () => {
  it('keeps existing covers and shows skeletons while the requested next page loads', () => {
    const first = new Subject<BookPage>();
    const next = new Subject<BookPage>();
    const books = jasmine.createSpyObj<BookService>('BookService', ['getBookPage']);
    books.getBookPage.and.returnValues(first, next);
    TestBed.configureTestingModule({ imports: [BookShelfComponent], providers: [
      { provide: BookService, useValue: books }, { provide: NgbModal, useValue: {} }
    ] });
    const state = new BookShelfState(books, { userId: 'reader', status: 4 }, 1, 2);
    state.reset();
    const fixture = TestBed.createComponent(BookShelfComponent);
    fixture.componentRef.setInput('shelf', state);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-skeleton')).toBeTruthy();
    first.next({ books: [new Book({ id: 'a', title: 'A' })], total: 3 });
    fixture.detectChanges();
    expect(books.getBookPage.calls.count()).toBe(1);
    fixture.nativeElement.querySelector('.shelf-more').click();
    fixture.detectChanges();
    expect(books.getBookPage.calls.count()).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('app-book-item').length).toBe(1);
    expect(fixture.nativeElement.querySelector('app-skeleton')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.shelf-more').disabled).toBeTrue();
    next.next({ books: [new Book({ id: 'b', title: 'B' }), new Book({ id: 'c', title: 'C' })], total: 3 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-book-item').length).toBe(3);
    expect(fixture.nativeElement.querySelector('.shelf-more')).toBeNull();
    state.destroy(); fixture.destroy();
  });
});
