import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LogoutComponent } from '../logout/logout.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, LogoutComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

}
