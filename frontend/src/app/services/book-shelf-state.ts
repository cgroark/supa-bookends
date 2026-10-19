import { Subscription } from 'rxjs';
import { Book } from '../models/book.model';
import { BookQuery, BookService } from './book.service';

/** One bounded shelf. Reset cancels stale filters; subsequent pages are appended once. */
export class BookShelfState {
  books: Book[] = [];
  total = 0;
  loading = true;
  loadingMore = false;
  error = '';
  private offset = 0;
  private request?: Subscription;
  private generation = 0;
  private failedMore = false;

  constructor(private service: BookService, public query: BookQuery, public initialSize = 6,
    public pageSize = 12, private changed: () => void = () => {}) {}

  get hasMore(): boolean { return this.offset < this.total; }
  reset(query: BookQuery = this.query): void {
    this.request?.unsubscribe();
    this.generation++;
    this.query = query;
    this.books = [];
    this.total = 0;
    this.offset = 0;
    this.loading = true;
    this.loadingMore = false;
    this.fetch(false);
  }
  loadMore(): void {
    if (this.loading || this.loadingMore || !this.hasMore) return;
    this.loadingMore = true;
    this.fetch(true);
  }
  retry(): void { this.failedMore ? this.loadMore() : this.reset(); }
  destroy(): void { this.generation++; this.request?.unsubscribe(); }

  private fetch(more: boolean): void {
    this.error = '';
    this.failedMore = more;
    const generation = this.generation;
    this.request = this.service.getBookPage(this.query, more ? this.offset : 0,
      more ? this.pageSize : this.initialSize).subscribe({
      next: page => {
        if (generation !== this.generation) return;
        const known = new Set(this.books.map(book => book.id));
        this.books = [...this.books, ...page.books.filter(book => !known.has(book.id))];
        this.offset += page.books.length;
        this.total = page.total;
        // Handle deletions between requests without an endlessly empty next page.
        if (!page.books.length) this.total = Math.min(this.total, this.offset);
        this.loading = this.loadingMore = false;
        this.changed();
      },
      error: () => {
        if (generation !== this.generation) return;
        this.loading = this.loadingMore = false;
        this.error = 'Could not load these books. Please try again.';
        this.changed();
      }
    });
  }
}
