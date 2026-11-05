import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BookCatalogService } from '../../services/book-catalog.service';
import { BestsellersComponent } from './bestsellers.component';

describe('BestsellersComponent adding books', () => {
  let component: BestsellersComponent;
  let http: HttpTestingController;
  let modal: jasmine.SpyObj<NgbModal>;
  const book = {
    title: 'THE TEST BOOK', author: 'Test Author', primary_isbn13: '9781250457899',
    isbns: [{ isbn13: '9781250457899' }], book_image: 'https://example.com/cover.jpg',
    description: 'NYT summary',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    http = TestBed.inject(HttpTestingController);
    modal = jasmine.createSpyObj('NgbModal', ['open']);
    modal.open.and.returnValue({ close: () => {} } as any);
    component = new BestsellersComponent(TestBed.inject(HttpClient), modal,
      TestBed.inject(BookCatalogService), new DatePipe('en'));
  });
  afterEach(() => http.verify());

  it('uses one Open Library ISBN lookup and passes normalized metadata to the form', () => {
    component.addBestSeller('form', book);
    component.addBestSeller('form', book);
    const request = http.expectOne(req => req.url === 'https://openlibrary.org/search.json');
    expect(request.request.params.get('q')).toBe('isbn:9781250457899');
    request.flush({ docs: [{ key: '/works/OL1W', title: 'The Test Book', author_name: ['Test Author'], cover_i: 42 }] });
    expect((component as any).bookToAdd).toEqual(jasmine.objectContaining({
      title: 'The Test Book', authors: ['Test Author'], openLibraryWorkKey: '/works/OL1W',
      image_url: 'https://covers.openlibrary.org/b/id/42-M.jpg?default=false', overview: 'NYT summary',
    }));
    expect(modal.open).toHaveBeenCalledTimes(1);
    expect((component as any).isAdding).toBeFalse();
  });

  for (const outcome of ['empty', 'unrelated', 'error']) {
    it(`opens a usable form with NYT metadata when lookup is ${outcome}`, () => {
      component.addBestSeller('form', { ...book, isbns: undefined });
      const request = http.expectOne(req => req.url === 'https://openlibrary.org/search.json');
      if (outcome === 'error') request.flush({}, { status: 429, statusText: 'Too Many Requests' });
      else request.flush({ docs: outcome === 'empty' ? [] : [{ title: 'Another Book' }] });
      expect((component as any).bookToAdd).toEqual(jasmine.objectContaining({
        title: book.title, authors: [book.author], image_url: book.book_image, overview: book.description,
      }));
      expect((component as any).identifiedBook).toBeTrue();
      expect((component as any).isAdding).toBeFalse();
      expect(modal.open).toHaveBeenCalled();
    });
  }
});
