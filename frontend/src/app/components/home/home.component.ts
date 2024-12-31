import { Component, OnInit } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { BestsellersComponent } from '../bestsellers/bestsellers.component';
import { BookFormComponent } from '../book-form/book-form.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BestsellersComponent, BookFormComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  protected currentBooks: any;
  protected recentBooks: any;


  constructor(private http: HttpClient, private modalService: NgbModal) {}

  ngOnInit(): void {
    this.http
    .get('http://127.0.0.1:8000/books/')
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

  onOpen(content: any) {
    this.modalService.open(content, {
      size: 'md',
      backdrop: 'static',
    });
  }

}
