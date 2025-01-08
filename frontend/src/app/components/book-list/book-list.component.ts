import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { jwtDecode}  from 'jwt-decode';
import { Book} from 'src/app/models/book.model';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from '../header/header.component';
import { BookFormComponent } from '../book-form/book-form.component';
import { BookItemComponent } from '../book-item/book-item.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss'],
  imports: [BookItemComponent, BookFormComponent, HeaderComponent, NavbarComponent, CommonModule, NgbAccordionModule]
})
export class BookListComponent implements OnInit {

  // protected bookItems: Book[] = [];
  protected completed2025: any[] = [];
  protected completed2024: any[] = [];
  protected completed2023: any[] = [];
  protected completed2022: any[] = [];
  protected completed2021: any[] = [];
  protected completed2020: any[] = [];
  protected reading: any[] = [];
  protected wantToRead: any[] = [];
  protected setAside: any[] = [];
  protected selectedBook: any;


  constructor(private http: HttpClient, private modalService: NgbModal) { }

  ngOnInit(): void {
     // Retrieve the token from localStorage
     const token = localStorage.getItem('auth_token_bookends');
     const decodedToken: any = token ? jwtDecode(token) : null;
     if(decodedToken) {
      const userId = decodedToken.sub;
      console.log('Decoded user ID:', userId);
      this.fetchBooks(userId);
    }
  }

  protected fetchBooks(userId: string) {
    // Set the Authorization header
    const token = localStorage.getItem('auth_token_bookends');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
    .get(`http://127.0.0.1:8000/books?user_id=${userId}`, { headers })
    .subscribe((response: any) => {
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
      this.completed2025 = response.filter((each: any) =>
        each.status === 4 &&  each.end_date >= '2025-01-01' && each.end_date < '2026-01-01')
        .sort((a: any, b: any) => b.end_date.localeCompare(a.end_date));
      this.reading = response.filter((each: any) =>
          each.status === 2);
      this.wantToRead = response.filter((each: any) =>
        each.status === 1)
        .sort((a: any, b: any) => a.title.localeCompare(b.title));
      this.setAside = response.filter((each: any) =>
        each.status === 3);
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
