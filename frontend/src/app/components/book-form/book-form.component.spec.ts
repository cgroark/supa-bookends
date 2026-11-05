import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookFormComponent } from './book-form.component';

describe('BookFormComponent', () => {
  let component: BookFormComponent;
  let fixture: ComponentFixture<BookFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ BookFormComponent, HttpClientTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('prefills bestseller metadata and loads the Open Library summary', () => {
    component.addingBestSeller = {
      title: 'Test Book', authors: ['Test Author'], image_url: null,
      overview: null, openLibraryWorkKey: '/works/OL1W',
    };
    component.ngOnInit();
    expect((component as any).form.value.title).toBe('Test Book');
    expect((component as any).form.value.author).toBe('Test Author');
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('https://openlibrary.org/works/OL1W.json').flush({ description: { value: 'Summary' } });
    expect((component as any).selectedBook.overview).toBe('Summary');
    http.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
