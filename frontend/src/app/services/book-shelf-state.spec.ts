import { Subject } from 'rxjs';
import { Book } from '../models/book.model';
import { BookPage, BookService } from './book.service';
import { BookShelfState } from './book-shelf-state';

describe('BookShelfState', () => {
  let service: jasmine.SpyObj<BookService>;
  let requests: Subject<BookPage>[];
  let shelf: BookShelfState;
  const book = (id: string) => new Book({ id, title: id });
  beforeEach(() => {
    requests = [];
    service = jasmine.createSpyObj<BookService>('BookService', ['getBookPage']);
    service.getBookPage.and.callFake(() => {
      const request = new Subject<BookPage>(); requests.push(request); return request;
    });
    shelf = new BookShelfState(service, { userId: 'reader', status: 4 }, 2, 3);
  });
  afterEach(() => shelf.destroy());

  it('fetches only its preview until requested, then appends pages without concurrent requests', () => {
    shelf.reset();
    expect(service.getBookPage.calls.count()).toBe(1);
    expect(service.getBookPage.calls.mostRecent().args.slice(1)).toEqual([0, 2]);
    requests[0].next({ books: [book('a'), book('b')], total: 5 });
    shelf.loadMore();
    shelf.loadMore();
    expect(service.getBookPage.calls.count()).toBe(2);
    expect(service.getBookPage.calls.mostRecent().args.slice(1)).toEqual([2, 3]);
    requests[1].next({ books: [book('c'), book('d'), book('e')], total: 5 });
    expect(shelf.books.map(item => item.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(shelf.hasMore).toBeFalse();
    shelf.loadMore();
    expect(service.getBookPage.calls.count()).toBe(2);
  });

  it('cancels old filters, resets the offset, and ignores stale results', () => {
    shelf.reset();
    const old = requests[0];
    shelf.reset({ ...shelf.query, search: 'new' });
    old.next({ books: [book('stale')], total: 10 });
    expect(shelf.books).toEqual([]);
    expect(service.getBookPage.calls.mostRecent().args).toEqual([{ userId: 'reader', status: 4, search: 'new' }, 0, 2]);
    requests[1].next({ books: [book('new')], total: 1 });
    expect(shelf.books.map(item => item.id)).toEqual(['new']);
  });

  it('keeps existing books after a next-page error and retries the same offset', () => {
    shelf.reset();
    requests[0].next({ books: [book('a'), book('b')], total: 4 });
    shelf.loadMore();
    requests[1].error(new Error('offline'));
    expect(shelf.error).toBeTruthy();
    expect(shelf.books.length).toBe(2);
    shelf.retry();
    expect(service.getBookPage.calls.mostRecent().args.slice(1)).toEqual([2, 3]);
    requests[2].next({ books: [book('c'), book('d')], total: 4 });
    expect(shelf.error).toBe('');
    expect(shelf.books.length).toBe(4);
  });

  it('deduplicates shifted rows and stops on an empty page after deletion', () => {
    shelf.reset();
    requests[0].next({ books: [book('a'), book('b')], total: 5 });
    shelf.loadMore();
    requests[1].next({ books: [book('b'), book('c')], total: 5 });
    expect(shelf.books.map(item => item.id)).toEqual(['a', 'b', 'c']);
    shelf.loadMore();
    requests[2].next({ books: [], total: 4 });
    expect(shelf.hasMore).toBeFalse();
  });
});
