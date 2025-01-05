import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BestsellersComponent } from '../bestsellers/bestsellers.component';
import { BookFormComponent } from '../book-form/book-form.component';
import { HeaderComponent } from '../header/header.component';
import { LogoutComponent } from '../logout/logout.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BestsellersComponent, BookFormComponent, HeaderComponent, LogoutComponent, CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  protected currentBooks: any;
  protected recentBooks: any;
  protected selectedBook: any;

  constructor(private http: HttpClient, private modalService: NgbModal) {}

  ngOnInit(): void {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('auth_token_bookends');
    console.warn('TOKEN'), token

    // Set the Authorization header
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
    .get('http://127.0.0.1:8000/books/', { headers })
    .subscribe((response: any) => {
      this.currentBooks = response.filter((each: any) =>
        // TODO: update userId check
        each.user_id == 1 && each.status === /*status.reading*/ 2);
      console.warn('curr', this.currentBooks);
      this.recentBooks = response.filter((each: any) =>
        each.user_id == 1 && each.status === 4
      ).sort((a: any, b: any) => b.end_date.localeCompare(a.end_date));
      console.warn('rec', this.recentBooks)

    })
  }

  onOpenForm(content: any, book: any):void {
    this.modalService.open(content, {
      size: 'md',
      backdrop: 'static',
    });
    this.selectedBook = book;
  }

  onOpenBook(contentBook: any, book: any):void {
    this.modalService.open(contentBook, {
      size: 'md',
      backdrop: 'static',
    });
    this.selectedBook = book;
  }

}
