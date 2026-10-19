import { TestBed } from '@angular/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { UserService } from '../../services/user.service';
import { HomeComponent } from './home.component';

describe('Home book previews', () => {
  it('initially requests one current book and six latest books, loading more only on demand', () => {
    const previous = localStorage.getItem('auth_token_bookends');
    localStorage.setItem('auth_token_bookends', `header.${btoa(JSON.stringify({ sub: 'reader' }))}.signature`);
    const books = jasmine.createSpyObj<BookService>('BookService', ['getBookPage', 'getBookCount']);
    books.getBookPage.and.callFake(query => of({ books: [new Book({ id: String(query.status), status: query.status })], total: 20 }));
    books.getBookCount.and.returnValue(of(17));
    TestBed.configureTestingModule({ imports: [HomeComponent], providers: [
      { provide: BookService, useValue: books },
      { provide: UserService, useValue: { getUserById: () => of({ connections: [] }) } },
      { provide: NgbModal, useValue: {} }
    ] });
    TestBed.overrideComponent(HomeComponent, { set: { template: '' } });
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    expect(books.getBookPage.calls.allArgs()).toEqual([
      [{ userId: 'reader', status: 2 }, 0, 1], [{ userId: 'reader', status: 4 }, 0, 6]
    ]);
    const vm = fixture.componentInstance as any;
    expect(vm.yearlyCompletedCount).toBe(17);
    vm.currentShelf.loadMore();
    expect(books.getBookPage.calls.mostRecent().args).toEqual([{ userId: 'reader', status: 2 }, 1, 6]);
    fixture.destroy();
    if (previous === null) localStorage.removeItem('auth_token_bookends');
    else localStorage.setItem('auth_token_bookends', previous);
  });
});
