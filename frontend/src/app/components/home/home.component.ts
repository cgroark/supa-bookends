import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { jwtDecode}  from 'jwt-decode';

import { BookService } from 'src/app/services/book.service';
import { Book } from 'src/app/models/book.model';

import { BestsellersComponent } from '../bestsellers/bestsellers.component';
import { BookFormComponent } from '../book-form/book-form.component';
import { HeaderComponent } from '../header/header.component';
import { BookItemComponent } from '../book-item/book-item.component';
import { UserStatsComponent } from '../user-stats/user-stats.component';
import { NavbarComponent } from '../navbar/navbar.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BestsellersComponent, BookItemComponent, BookFormComponent, HeaderComponent, NavbarComponent, UserStatsComponent, CommonModule, RouterModule, NgbAccordionModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  protected isLoading = true;
  protected currentBooks: Book[] = [];
  protected recentBooks: Book[] = [];
  protected completed2025: Book[] = [];
  protected selectedBook: any;
  protected noBooks = false;
  protected userId: string = '';

  constructor(private bookService: BookService, private modalService: NgbModal) {}

  ngOnInit(): void {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('auth_token_bookends');
    const decodedToken: any = token ? jwtDecode(token) : null;

    if(decodedToken) {
      const userId = decodedToken.sub;
      this.userId = userId;
      console.log('Decoded user ID:', userId);
      this.fetchBooks(userId);
    }
  }

  protected fetchBooks(userId: string) {
    console.warn("FETCH")
    this.isLoading = true;
    this.bookService.getAllUserBooks(userId).subscribe({
      next: (response: Book[]) => {
        this.currentBooks = response.filter((each: Book) =>
          each.status === /*status.reading*/ 2
        );
        console.warn('curr', this.currentBooks);
        this.recentBooks = response.filter((each: Book) =>
          each.status === 4
        ).sort((a: any, b: any) => b.end_date.localeCompare(a.end_date));
        console.warn('rec', this.recentBooks);
        this.noBooks = !this.recentBooks.length && !this.currentBooks.length;
        this.completed2025 = response.filter((each: any) =>
          each.status === 4 &&  each.end_date >= '2025-01-01');
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching books:', err);
        this.isLoading = false;
        this.noBooks = true;
      }
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

}
