import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BookService } from './book.service';

describe('BookService pagination', () => {
  let service: BookService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(BookService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('requests a bounded, stable page scoped to user, status, and finish year', () => {
    let total = 0;
    service.getBookPage({ userId: 'reader', status: 4, from: '2026-01-01', to: '2027-01-01' }, 6, 12)
      .subscribe(page => total = page.total);
    const request = http.expectOne(req => req.url.endsWith('/books'));
    expect(request.request.params.get('user_id')).toBe('eq.reader');
    expect(request.request.params.get('status')).toBe('eq.4');
    expect(request.request.params.getAll('end_date')).toEqual(['gte.2026-01-01', 'lt.2027-01-01']);
    expect(request.request.params.get('offset')).toBe('6');
    expect(request.request.params.get('limit')).toBe('12');
    expect(request.request.params.get('order')).toBe('end_date.desc.nullslast,id.desc');
    expect(request.request.headers.get('Prefer')).toBe('count=exact');
    request.flush([], { headers: { 'Content-Range': '6-17/24' } });
    expect(total).toBe(24);
  });

  it('gets goal counts without downloading any book rows', () => {
    let total = -1;
    service.getBookCount({ userId: 'reader', status: 4, from: '2026-01-01', to: '2027-01-01' })
      .subscribe(value => total = value);
    const request = http.expectOne(req => req.method === 'HEAD');
    expect(request.request.params.get('select')).toBe('id');
    expect(request.request.params.has('or')).toBeFalse();
    request.flush(null, { headers: { 'Content-Range': '*/17' } });
    expect(total).toBe(17);
  });

  it('quotes punctuation in title/author filters rather than interpolating filter syntax', () => {
    service.getBookPage({ userId: 'reader', status: 1, search: 'Dune, "Part Two"' }).subscribe();
    const request = http.expectOne(req => req.url.endsWith('/books'));
    expect(request.request.params.get('or')).toBe('(title.ilike."%Dune, \\"Part Two\\"%",author.ilike."%Dune, \\"Part Two\\"%")');
    request.flush([], { headers: { 'Content-Range': '*/0' } });
  });

  it('checks duplicates only for the current search-result titles', () => {
    service.findExistingBooks('reader', ['Dune', 'Dune', 'A "quoted" title']).subscribe();
    const request = http.expectOne(req => req.url.endsWith('/books'));
    expect(request.request.params.get('select')).toBe('title,author');
    expect(request.request.params.get('title')).toBe('in.("Dune","A \\"quoted\\" title")');
    request.flush([]);
  });
});
