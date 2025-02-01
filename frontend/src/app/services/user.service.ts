import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://127.0.0.1:8000/users';

  constructor(private http: HttpClient) {}

  createUser(user: Partial<User>): Observable<User> {
    console.warn('crate in user service', user)
    return this.http.post<User>(`${this.apiUrl}/`, user).pipe(
      map((response) => User.fromApiResponse(response))
    );
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`).pipe(
      map((response) => User.fromApiResponse(response))
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      map((responses) => responses.map((response) => User.fromApiResponse(response)))
    );
  }

  updateUser(userId: string, userData: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, userData);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }
}
