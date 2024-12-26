import { Component } from '@angular/core';
import { BestsellersComponent } from '../bestsellers/bestsellers.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BestsellersComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
