import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { jwtDecode}  from 'jwt-decode';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';

import  {Observable, of, ReplaySubject, Subject} from 'rxjs'
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { HeaderComponent } from '../header/header.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-connections',
  standalone: true,
  imports: [HeaderComponent, NavbarComponent, NgSelectModule, CommonModule, NgOptionHighlightModule, FormsModule],
  templateUrl: './connections.component.html',
  styleUrl: './connections.component.scss'
})
export class ConnectionsComponent implements OnInit {
  protected connections$: Observable<any[]>;
  protected connectionInput$ = new ReplaySubject<string>(1);
  protected isLoading = false;
  protected isAdding = false;
  protected selectedConnection: any;
  protected userId: string = '';
  protected user: any;

  constructor(private userService: UserService) {
    this.connections$ = this.connectionInput$.pipe(
      tap(() => (this.isLoading = true)),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((term) => {
        if (!term) {
          this.isLoading = false;
          return of([]);
        }

        return this.userService.searchUsers(term).pipe(
          map((users) =>
            users.map((user) => ({
              first: user.first,
              last: user.last,
              id: user.id,
            }))
          ),
          tap(() => (this.isLoading = false))
        );
      })
    );
  }

  ngOnInit(): void {
  const token = localStorage.getItem('auth_token_bookends');
    const decodedToken: any = token ? jwtDecode(token) : null;
    if(decodedToken) {
      const userId = decodedToken.sub;
      this.userId = userId;
    }
  }

  protected onChange(selected: any): void {
    console.log('Selected:', selected);
    this.selectedConnection = selected;
  }

  protected addConnection(id: string): void {
    console.warn('ID', id);
    this.isAdding = true;
    const connections = {connections: [id]};
    this.userService.updateUser(this.userId, connections).subscribe({
      next: (response) => {
        console.warn('res', response);
        this.isAdding = false;
      },
      error: (error) => {
        console.error('Error updating user in backend:', error);
        this.isAdding = false;
      },
    })


  }
}
