import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { BookListComponent } from './book-list.component';
import { BookService } from '../../services/book.service';
import { UserService } from '../../services/user.service';

describe('Book list server filtering', () => {
  it('only resets filtered shelves, leaving current reads and goal counts untouched', fakeAsync(() => {
    const previousToken = localStorage.getItem('auth_token_bookends');
    localStorage.setItem('auth_token_bookends', `header.${btoa(JSON.stringify({ sub: 'reader' }))}.signature`);
    const books = jasmine.createSpyObj<BookService>('BookService', ['getBookPage', 'getBookCount']);
    books.getBookPage.and.returnValue(of({ books: [], total: 0 }));
    books.getBookCount.and.returnValue(of(17));
    TestBed.configureTestingModule({
      imports: [BookListComponent, HttpClientTestingModule],
      providers: [
        { provide: BookService, useValue: books },
        { provide: UserService, useValue: { getUserById: () => of({ goals: [], connections: [] }) } },
        { provide: ActivatedRoute, useValue: { queryParams: of({ user: 'reader' }) } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate'), events: of() } },
        { provide: NgbModal, useValue: { open: jasmine.createSpy('open') } }
      ]
    });
    TestBed.overrideComponent(BookListComponent, { set: { template: '' } });
    const fixture = TestBed.createComponent(BookListComponent);
    fixture.detectChanges();
    tick();
    const vm = fixture.componentInstance as any;
    expect(vm.yearlyCompletedCount).toBe(17);
    books.getBookPage.calls.reset();
    books.getBookCount.calls.reset();
    vm.searchForm.controls.search.setValue('dune');
    tick(300);
    fixture.detectChanges();
    expect(books.getBookPage.calls.count()).toBeGreaterThan(0);
    expect(books.getBookPage.calls.allArgs().every(([query]) => query.status !== 2 && query.search === 'dune')).toBeTrue();
    expect(books.getBookCount).not.toHaveBeenCalled();
    expect(vm.yearlyCompletedCount).toBe(17);
    fixture.destroy();
    if (previousToken === null) localStorage.removeItem('auth_token_bookends');
    else localStorage.setItem('auth_token_bookends', previousToken);
  }));
});
