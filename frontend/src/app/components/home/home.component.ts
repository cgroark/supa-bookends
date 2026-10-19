import { BookShelfState } from '../../services/book-shelf-state';
import { BookShelfComponent } from '../book-shelf/book-shelf.component';
import { StickySectionNavDirective } from '../../directives/sticky-section-nav.directive';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { jwtDecode}  from 'jwt-decode';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BookService } from 'src/app/services/book.service';
import { UserService } from 'src/app/services/user.service';
import { Book } from 'src/app/models/book.model';
import { User } from 'src/app/models/user.model';

import { BestsellersComponent } from '../bestsellers/bestsellers.component';
import { BookFormComponent } from '../book-form/book-form.component';
import { HeaderComponent } from '../header/header.component';
import { BookItemComponent } from '../book-item/book-item.component';
import { UserStatsComponent } from '../user-stats/user-stats.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { EachConnectionComponent } from '../each-connection/each-connection.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BookShelfComponent, StickySectionNavDirective, SkeletonComponent, EachConnectionComponent, BestsellersComponent, BookItemComponent, BookFormComponent, HeaderComponent, NavbarComponent, UserStatsComponent, CommonModule, RouterModule, NgbAccordionModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  protected currentShelf!: BookShelfState;
  protected latestShelf!: BookShelfState;
  protected yearlyCompletedCount: number | null = null;
  protected goalCountError = false;
  private countRequest?: Subscription;
  private destroyed$ = new Subject<void>();
  protected get isLoading(): boolean { return this.currentShelf?.loading ?? true; }
  protected get currentBooks(): Book[] { return this.currentShelf?.books ?? []; }
  protected get recentBooks(): Book[] { return this.latestShelf?.books ?? []; }
  protected isLoadingConnections = false;
  protected selectedBook: any;
  protected get noBooks(): boolean { return !!this.latestShelf && !this.latestShelf.loading && !this.latestShelf.total; }
  protected userId: string = '';
  protected user: any;
  protected existingConnections: User[] = [];
  protected fullWidth = false;
  protected activeSection: string = '';
  protected sectionsLength: number = 0;
  private sectionObserver?: IntersectionObserver;
  private observationTimer?: ReturnType<typeof setTimeout>;

  ngOnDestroy(): void {
    this.currentShelf?.destroy();
    this.latestShelf?.destroy();
    this.countRequest?.unsubscribe();
    this.destroyed$.next();
    this.destroyed$.complete();
    this.sectionObserver?.disconnect();
    clearTimeout(this.observationTimer);
  }

  constructor(private userService: UserService, private bookService: BookService, private modalService: NgbModal) {}

  ngOnInit(): void {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('auth_token_bookends');
    const decodedToken: any = token ? jwtDecode(token) : null;

    if(decodedToken) {
      const userId = decodedToken.sub;
      this.userId = userId;
      this.fetchBooks(userId);
      this.fetchConnections(userId)
    }
  }

  protected fetchConnections(userId: string): void {
    this.isLoadingConnections = true;
    this.userService.getUserById(userId).pipe(takeUntil(this.destroyed$)).subscribe({
      next: (response) => {
        this.user = response;
        if (this.user.connections?.length) {
          const userRequests = this.user.connections.map((id: string) => this.userService.getUserById(id));
          forkJoin<User[]>(userRequests).pipe(takeUntil(this.destroyed$)).subscribe({
            next: (users: User[]) => {
              this.existingConnections = users;
              this.observeSections();
              this.isLoadingConnections = false;
            },
            error: (error) => {
              console.error('Error fetching connected users:', error);
              this.isLoadingConnections = false;
            }
          });
        } else {
          this.isLoadingConnections = false;
        }
      },
      error: (error) => {
        console.error('Error fetching user in backend:', error);
        this.isLoadingConnections = false;
      }
    });
  }

  protected fetchBooks(userId: string): void {
    this.currentShelf?.destroy();
    this.latestShelf?.destroy();
    this.currentShelf = new BookShelfState(this.bookService, { userId, status: 2 }, 1, 6, () => this.observeSections());
    this.latestShelf = new BookShelfState(this.bookService, { userId, status: 4 }, 6, 6, () => this.observeSections());
    this.currentShelf.reset();
    this.latestShelf.reset();
    this.loadGoalCount();
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

  protected onOpenForm(content: any, book: any):void {
    this.modalService.open(content, {
      size: 'md',
      backdrop: 'static',
    });
    this.selectedBook = book;
  }

  protected onOpenBook(contentBook: any, book: any):void {
    this.modalService.open(contentBook, {
      size: 'md',
      backdrop: 'static',
    });
    this.selectedBook = book;
  }

  protected fullWidthBooks(): void {
    this.fullWidth = true;
  }

  protected scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const nav = document.querySelector<HTMLElement>('.breadcrumbs');
      const offset = nav?.offsetHeight ? nav.offsetHeight + 24 : 16;
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
