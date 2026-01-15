import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup } from '@angular/forms';

import { jwtDecode}  from 'jwt-decode';
import { BookService } from 'src/app/services/book.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { Book} from 'src/app/models/book.model';
import { Subject } from 'rxjs'
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from '../header/header.component';
import { BookFormComponent } from '../book-form/book-form.component';
import { BookItemComponent } from '../book-item/book-item.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { UserStatsComponent } from '../user-stats/user-stats.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss'],
  imports: [BookItemComponent, BookFormComponent, UserStatsComponent, HeaderComponent, NavbarComponent, CommonModule, NgbAccordionModule, RouterLink, ReactiveFormsModule, FormsModule]
})
export class BookListComponent implements OnInit {

  protected booksError: string = '';
  protected allUserBooks: Book[] = [];
  protected isLoading = true;
  protected isLoadingUser = true;
  protected noBooks = false;
  protected completed: Book[] = [];
  protected completed2026: Book[] = [];
  protected completed2025: Book[] = [];
  protected completed2024: Book[] = [];
  protected completed2023: Book[] = [];
  protected completed2022: Book[] = [];
  protected completed2021: Book[] = [];
  protected completed2020: Book[] = [];
  protected reading: Book[] = [];
  protected wantToRead: Book[] = [];
  protected setAside: Book[] = [];
  protected selectedBook: any;
  protected userId: string = '';
  protected user: any;
  protected userIsSelf = false;
  protected activeSection: string = '';
  protected sectionsLength: number = 0;
  protected searchForm: FormGroup = new FormGroup({
    search: new FormControl<string>(''),
  })
  private allUserBooksSource: Book[] = [];
  private destroyed$ = new Subject<void>();


  constructor(private bookService: BookService, private modalService: NgbModal, private route: ActivatedRoute, private userService: UserService, private router: Router) {
    this.searchForm.controls['search'].valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        takeUntil(this.destroyed$),
      )
      .subscribe((search: string) => {
        const term = search?.trim().toLowerCase() ?? '';
        const filteredBooks = this.allUserBooksSource.filter(book =>
            book.title.toLowerCase().includes(term)
          )

        this.processBooks(filteredBooks);
      }
    )
  }

  ngOnInit(): void {
     // Retrieve the token from localStorage
     const token = localStorage.getItem('auth_token_bookends');
     const decodedToken: any = token ? jwtDecode(token) : null;
     this.route.queryParams.subscribe(params => {
      const userId = params['user'];
      if(!userId && decodedToken) {
        this.userId = decodedToken.sub;
        this.userIsSelf = true;
        this.router.navigate([], {
          queryParams: {user: this.userId}
        })
      }else if(userId) {
        this.userId = userId;
        this.fetchBooks(userId);
        if(decodedToken) {
          const selfId = decodedToken.sub;
          this.userIsSelf = selfId === this.userId;
          if(!this.userIsSelf) {
            this.isLoading = true;
            this.userService.getUserById(this.userId).subscribe({
              next: (response: User) => {
                this.user = response;
                this.isLoadingUser = false;
              },
              error: (err: any) => {
                console.error('Error fetching user:', err);
                this.isLoadingUser = false;
              }
            })
          }
        }
      }
    });
  }

  protected fetchBooks(userId: string) {
    this.bookService.getAllUserBooks(userId).subscribe({
      next: (response: Book[]) => {
        this.allUserBooks = this.allUserBooksSource = response;
        this.noBooks = !response.length
        const isProcessed = this.processBooks(response);
        if (isProcessed) {
          this.isLoading = false;
          this.observeSections();
        }
      },
      error: (err: any) => {
        console.error('Error fetching books:', err);
        this.booksError = err;
        this.isLoading = false;
      }
    })
  };

  private processBooks(response: Book[]): boolean {
      this.completed = response.filter((each: Book) => each.status === 4);
      this.completed2020 = this.sortBooksByDate(response, 4, null, '2021-01-01');
      this.completed2021 = this.sortBooksByDate(response, 4, '2021-01-01', '2022-01-01');
      this.completed2022 = this.sortBooksByDate(response, 4, '2022-01-01', '2023-01-01');
      this.completed2023 = this.sortBooksByDate(response, 4, '2023-01-01', '2024-01-01');
      this.completed2024 = this.sortBooksByDate(response, 4, '2024-01-01', '2025-01-01');
      this.completed2025 = this.sortBooksByDate(response, 4, '2025-01-01', '2026-01-01');
      this.completed2026 = this.sortBooksByDate(response, 4, '2026-01-01', '2027-01-01');

      this.reading = response.filter((each: Book) => each.status === 2);
      this.wantToRead = response
        .filter((each: Book) => each.status === 1)
        .sort((a: Book, b: Book) => a.title.localeCompare(b.title));
      this.setAside = response.filter((each: Book) => each.status === 3);
      this.reading = response.filter((each: Book) =>
          each.status === 2);
      this.wantToRead = response.filter((each: Book) =>
        each.status === 1)
        .sort((a: Book, b: Book) => a.title.localeCompare(b.title));
      this.setAside = response.filter((each: Book) =>
        each.status === 3);
      return true;
  }

  private sortBooksByDate(response: Book[], status: number, startDate: string | null, endDate: string | null): Book[] {
    return response
      .filter((each: any) =>
        each.status === status &&
        (startDate ? each.end_date >= startDate : true) &&
        (endDate ? each.end_date < endDate : true)
      )
      .sort((a: any, b: any) => b.end_date.localeCompare(a.end_date));
  }

  onOpenForm(content: any, book: any):void {
    this.modalService.open(content, {
      size: 'md',
      backdrop: 'static',
    });
    this.selectedBook = book;
  }

  protected scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 40;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  }


  protected observeSections(): void {
    setTimeout(() => {
      const sections = document.querySelectorAll('.breadcrumb-section');
      this.sectionsLength = sections.length;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.activeSection = entry.target.id;
            }
          });
        },
        {
          rootMargin: '0px 0px -94% 0px',
          threshold: 0,
        }
      );

      sections.forEach((section) => observer.observe(section));
    }, 0);
  }

}
