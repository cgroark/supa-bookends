import { Component } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import { BestsellersComponent } from '../bestsellers/bestsellers.component';
import { BookFormComponent } from '../book-form/book-form.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BestsellersComponent, BookFormComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  constructor(private modalService: NgbModal) {}

  onOpen(content: any) {
    this.modalService.open(content, {
      size: 'lg',
      backdrop: 'static',
    });
  }

}
