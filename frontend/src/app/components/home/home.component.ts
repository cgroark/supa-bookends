import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { jwtDecode}  from 'jwt-decode';
import  { forkJoin } from 'rxjs'

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
  imports: [EachConnectionComponent, BestsellersComponent, BookItemComponent, BookFormComponent, HeaderComponent, NavbarComponent, UserStatsComponent, CommonModule, RouterModule, NgbAccordionModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  protected isLoading = true;
  protected isLoadingConnections = false;
  protected currentBooks: Book[] = [];
  protected recentBooks: Book[] = [];
  protected completed2026: Book[] = [];
  protected allUserBooks: Book[] = []
  protected selectedBook: any;
  protected noBooks = false;
  protected userId: string = '';
  protected user: any;
  protected existingConnections: User[] = [];
  protected fullWidth = false;
  protected activeSection: string = '';
  protected sectionsLength: number = 0;

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
    this.userService.getUserById(userId).subscribe({
      next: (response) => {
        this.user = response;
        if (this.user.connections?.length) {
          const userRequests = this.user.connections.map((id: string) => this.userService.getUserById(id));
          forkJoin<User[]>(userRequests).subscribe({
            next: (users: User[]) => {
              this.existingConnections = users;
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

  protected fetchBooks(userId: string) {
    this.isLoading = true;
    this.bookService.getAllUserBooks(userId).subscribe({
      next: (response: Book[]) => {
        this.allUserBooks = response;
        this.currentBooks = response.filter((each: Book) =>
          each.status === /*status.reading*/ 2
        );
        this.recentBooks = response.filter((each: Book) =>
          each.status === 4
        ).sort((a: any, b: any) => b.end_date.localeCompare(a.end_date));
        this.noBooks = !this.recentBooks.length;
        this.completed2026 = response.filter((each: any) =>
          each.status === 4 &&  each.end_date >= '2026-01-01');
        this.isLoading = false;
        this.observeSections();
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

  protected fullWidthBooks(): void {
    this.fullWidth = true;
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
