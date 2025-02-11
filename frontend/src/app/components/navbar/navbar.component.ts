import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode}  from 'jwt-decode';
import { RouterModule } from '@angular/router';
import { LogoutComponent } from '../logout/logout.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, LogoutComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  protected userId: string = '';

  constructor(protected router: Router) {}

  ngOnInit(): void {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('auth_token_bookends');
    const decodedToken: any = token ? jwtDecode(token) : null;

    if(decodedToken) {
      const userId = decodedToken.sub;
      this.userId = userId;
    }
  }
}
