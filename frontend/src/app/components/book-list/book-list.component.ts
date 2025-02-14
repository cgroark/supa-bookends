import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { jwtDecode}  from 'jwt-decode';
import { BookService } from 'src/app/services/book.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { Book} from 'src/app/models/book.model';

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
  imports: [BookItemComponent, BookFormComponent, UserStatsComponent, HeaderComponent, NavbarComponent, CommonModule, NgbAccordionModule]
})
export class BookListComponent implements OnInit {

  protected allUserBooks: Book[] = [];
  protected isLoading = true;
  protected noBooks = false;
  protected completed: Book[] = [];
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

  constructor(private bookService: BookService, private modalService: NgbModal, private route: ActivatedRoute, private userService: UserService) { }

  ngOnInit(): void {
     // Retrieve the token from localStorage
     const token = localStorage.getItem('auth_token_bookends');
     const decodedToken: any = token ? jwtDecode(token) : null;
     this.route.paramMap.subscribe(params => {
      const userId = params.get('userId');
      if (userId) {
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
                this.isLoading = false;
              },
              error: (err: any) => {
                console.error('Error fetching user:', err);
                this.isLoading = false;
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
        this.allUserBooks = response;
        this.noBooks = !response.length
        this.completed = response.filter((each: Book) => each.status === 4);
        console.warn('COM', this.completed)
        this.completed2020 = response.filter((each: any) =>
          each.status === 4 &&  each.end_date >= '2020-01-01' && each.end_date < '2021-01-01')
          .sort((a: any, b: any) => b.end_date.localeCompare(a.end_date));
        this.completed2021 = response.filter((each: any) =>
          each.status === 4 &&  each.end_date >= '2021-01-01' && each.end_date < '2022-01-01')
          .sort((a: any, b: any) => b.end_date.localeCompare(a.end_date));
        this.completed2022 = response.filter((each: any) =>
          each.status === 4 &&  each.end_date >= '2022-01-01' && each.end_date < '2023-01-01')
          .sort((a: any, b: any) => b.end_date.localeCompare(a.end_date));
        this.completed2023 = response.filter((each: any) =>
          each.status === 4 &&  each.end_date >= '2023-01-01' && each.end_date < '2024-01-01')
          .sort((a: any, b: any) => b.end_date.localeCompare(a.end_date));
        this.completed2024 = response.filter((each: any) =>
          each.status === 4 &&  each.end_date >= '2024-01-01' && each.end_date < '2025-01-01')
          .sort((a: any, b: any) => b.end_date.localeCompare(a.end_date));
          console.warn('COM22', this.completed2022)
        this.completed2025 = response.filter((each: any) =>
          each.status === 4 &&  each.end_date >= '2025-01-01')
          .sort((a: any, b: any) => b.end_date.localeCompare(a.end_date));
        this.reading = response.filter((each: Book) =>
            each.status === 2);
        this.wantToRead = response.filter((each: Book) =>
          each.status === 1)
          .sort((a: Book, b: Book) => a.title.localeCompare(b.title));
        this.setAside = response.filter((each: Book) =>
          each.status === 3);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching books:', err);
        this.isLoading = false;
      }
    })
  };

  onOpenForm(content: any, book: any):void {
    this.modalService.open(content, {
      size: 'md',
      backdrop: 'static',
    });
    this.selectedBook = book;
  }
}
