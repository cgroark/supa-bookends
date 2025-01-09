import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { jwtDecode}  from 'jwt-decode';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BestsellersComponent } from '../bestsellers/bestsellers.component';
import { BookFormComponent } from '../book-form/book-form.component';
import { HeaderComponent } from '../header/header.component';
import { BookItemComponent } from '../book-item/book-item.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BestsellersComponent, BookItemComponent, BookFormComponent, HeaderComponent, NavbarComponent, CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  protected currentBooks: any[] = [];
  protected recentBooks: any[] = [];
  protected selectedBook: any;
  protected noBooks = false;

  constructor(private http: HttpClient, private modalService: NgbModal) {}

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
      this.currentBooks = response.filter((each: any) =>
        each.status === /*status.reading*/ 2);
      console.warn('curr', this.currentBooks);
      this.recentBooks = response.filter((each: any) =>
        each.status === 4)
        .sort((a: any, b: any) => b.end_date.localeCompare(a.end_date));
        console.warn('rec', this.recentBooks)
      this.noBooks = !this.recentBooks.length && !this.currentBooks.length;
      console.warn('NO BOOKS', this.noBooks)
    })
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
