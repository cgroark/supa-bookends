import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { BookService, BookQuery } from '../../services/book.service';
import { BookShelfState } from '../../services/book-shelf-state';
import { UserService } from '../../services/user.service';
import { StickySectionNavDirective } from '../../directives/sticky-section-nav.directive';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { BookShelfComponent } from '../book-shelf/book-shelf.component';
import { HeaderComponent } from '../header/header.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { BookFormComponent } from '../book-form/book-form.component';
import { UserStatsComponent } from '../user-stats/user-stats.component';

@Component({
  selector: 'app-book-list', standalone: true,
  templateUrl: './book-list.component.html', styleUrl: './book-list.component.scss',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, StickySectionNavDirective, SkeletonComponent,
    BookShelfComponent, HeaderComponent, NavbarComponent, BookFormComponent, UserStatsComponent]
})
export class BookListComponent implements OnInit, OnDestroy {
  protected userId = '';
  protected userIsSelf = false;
  protected user: any;
  protected isLoadingUser = true;
  protected selectedBook: any;
  protected readingShelf!: BookShelfState;
  protected asideShelf!: BookShelfState;
  protected wantedShelf!: BookShelfState;
  protected yearShelves: { label: string; shelf: BookShelfState }[] = [];
  protected yearlyCompletedCount: number | null = null;
  protected goalCountError = false;
  protected activeSection = '';
  protected sectionsLength = 0;
  protected searchForm = new FormGroup({ search: new FormControl('', { nonNullable: true }) });
  private searchTerm = '';
  private destroyed$ = new Subject<void>();
  private countRequest?: Subscription;
  private userRequest?: Subscription;
  private sectionObserver?: IntersectionObserver;
  private observationTimer?: ReturnType<typeof setTimeout>;

  protected get completedLoading(): boolean { return this.yearShelves.some(group => group.shelf.loading); }
  protected get hasCompleted(): boolean {
    return this.yearShelves.some(group => group.shelf.total > 0 || group.shelf.loading || !!group.shelf.error);
  }
  constructor(private bookService: BookService, private userService: UserService,
    private modalService: NgbModal, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.searchForm.controls.search.valueChanges.pipe(map(value => value.trim()), debounceTime(250),
      distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(term => {
      this.searchTerm = term;
      this.resetFilteredShelves();
    });
    const token = localStorage.getItem('auth_token_bookends');
    const selfId = token ? (jwtDecode(token) as { sub?: string }).sub : undefined;
    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe(params => {
      const userId = params['user'] || selfId;
      if (!userId) return;
      if (!params['user']) {
        this.router.navigate([], { queryParams: { user: userId }, replaceUrl: true });
        return;
      }
      this.userId = userId;
      this.userIsSelf = selfId === userId;
      this.fetchBooks(userId);
      this.userRequest?.unsubscribe();
      this.user = undefined;
      this.isLoadingUser = !this.userIsSelf;
      if (!this.userIsSelf) this.userRequest = this.userService.getUserById(userId).subscribe({
        next: user => { this.user = user; this.isLoadingUser = false; },
        error: () => this.isLoadingUser = false
      });
    });
  }

  protected fetchBooks(userId: string): void {
    this.disposeShelves();
    const create = (query: BookQuery) => new BookShelfState(this.bookService, query, 6, 12, () => this.observeSections());
    this.readingShelf = create({ userId, status: 2 });
    this.asideShelf = create({ userId, status: 3 });
    this.wantedShelf = create({ userId, status: 1 });
    const year = new Date().getFullYear();
    this.yearShelves = Array.from({ length: Math.max(1, year - 2020) }, (_, index) => {
      const value = year - index;
      return { label: String(value), shelf: create({ userId, status: 4, from: `${value}-01-01`, to: `${value + 1}-01-01` }) };
    });
    this.yearShelves.push({ label: '2020 and earlier', shelf: create({ userId, status: 4, to: '2021-01-01' }) },
      { label: 'No finish date', shelf: create({ userId, status: 4, undated: true }) });
    this.readingShelf.reset();
    this.resetFilteredShelves();
    if (this.userIsSelf) this.loadGoalCount();
  }

  private resetFilteredShelves(): void {
    const shelves = [this.asideShelf, this.wantedShelf, ...this.yearShelves.map(group => group.shelf)];
    shelves.filter(Boolean).forEach(shelf => shelf.reset({ ...shelf.query, search: this.searchTerm }));
  }

  protected loadGoalCount(): void {
    this.countRequest?.unsubscribe();
    this.yearlyCompletedCount = null;
    this.goalCountError = false;
    const year = new Date().getFullYear();
    this.countRequest = this.bookService.getBookCount({ userId: this.userId, status: 4,
      from: `${year}-01-01`, to: `${year + 1}-01-01` }).subscribe({
      next: count => this.yearlyCompletedCount = count,
      error: () => this.goalCountError = true
    });
  }

  protected onOpenForm(content: any, book: any): void {
    this.selectedBook = book;
    this.modalService.open(content, { size: 'md', backdrop: 'static' });
  }
  private disposeShelves(): void {
    [this.readingShelf, this.asideShelf, this.wantedShelf, ...this.yearShelves.map(group => group.shelf)]
      .filter(Boolean).forEach(shelf => shelf.destroy());
  }
  ngOnDestroy(): void {
    this.disposeShelves();
    this.countRequest?.unsubscribe();
    this.userRequest?.unsubscribe();
    this.sectionObserver?.disconnect();
    clearTimeout(this.observationTimer);
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  protected scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const nav = document.querySelector<HTMLElement>('.breadcrumbs');
      const offset = nav?.offsetHeight ? nav.offsetHeight + 16 : 16;
      this.activeSection = sectionId;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: elementPosition,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    }
  }


  protected observeSections(): void {
    clearTimeout(this.observationTimer);
    this.observationTimer = setTimeout(() => {
      this.sectionObserver?.disconnect();
      const sections = document.querySelectorAll('.breadcrumb-section');
      this.sectionsLength = sections.length;
      this.sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.activeSection = entry.target.id;
            }
          });
        },
        {
          rootMargin: '-80px 0px -65% 0px',
          threshold: 0,
        }
      );

      sections.forEach((section) => this.sectionObserver?.observe(section));
    }, 0);
  }

}
