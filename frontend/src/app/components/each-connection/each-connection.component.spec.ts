import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { EachConnectionComponent } from './each-connection.component';

describe('Friend preview limits', () => {
  [true, false].forEach(hasCurrent => {
    it(`requests ${hasCurrent ? 3 : 6} latest books when current reading ${hasCurrent ? 'exists' : 'is empty'}`, () => {
      const books = jasmine.createSpyObj<BookService>('BookService', ['getBookPage']);
      books.getBookPage.and.callFake(query => of({
        books: query.status === 2 && hasCurrent ? [new Book({ id: 'current', status: 2 })] : [],
        total: query.status === 2 && hasCurrent ? 1 : 0
      }));
      TestBed.configureTestingModule({ imports: [EachConnectionComponent], providers: [{ provide: BookService, useValue: books }] });
      TestBed.overrideComponent(EachConnectionComponent, { set: { template: '' } });
      const fixture = TestBed.createComponent(EachConnectionComponent);
      fixture.componentRef.setInput('connection', { id: 'friend' });
      fixture.componentRef.setInput('minimize', true);
      fixture.detectChanges();
      expect(books.getBookPage.calls.allArgs()).toEqual([
        [{ userId: 'friend', status: 2 }, 0, 3],
        [{ userId: 'friend', status: 4 }, 0, hasCurrent ? 3 : 6]
      ]);
      fixture.destroy();
    });
  });
});
