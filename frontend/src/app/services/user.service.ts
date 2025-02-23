import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})

export class UserService {
  constructor(private http: HttpClient) {}

  createUser(user: Partial<User>): Observable<User> {
    const url = `${environment.supabaseUrl}/rest/v1/users`;
    const headers = new HttpHeaders({
      'apikey': environment.supabaseKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation' // Ensures response returns created data
    });

    return this.http.post<User>(url, user, { headers }).pipe(
      map((response) => User.fromApiResponse(response))
    );
  }

  getUserById(userId: string): Observable<User> {
    console.warn('GET USER', userId);
    const url = `${environment.supabaseUrl}/rest/v1/users?id=eq.${userId}`;
    const headers = new HttpHeaders({
      'apikey': environment.supabaseKey,
      'Content-Type': 'application/json'
    });

    return this.http.get<User[]>(url, { headers }).pipe(
      map((responses) => {
        if (responses.length === 1) {
          return User.fromApiResponse(responses[0]); // Return the first user if found
        } else if (responses.length === 0) {
          throw new Error('User not found'); // Handle case where user is not found
        } else {
          throw new Error('Multiple users found'); // Handle unexpected case
        }
      })
    );
  }


  getAllUsers(): Observable<User[]> {
    const url = `${environment.supabaseUrl}/rest/v1/users`;
    const headers = new HttpHeaders({
      'apikey': environment.supabaseKey,
      'Content-Type': 'application/json'
    });

    return this.http.get<User[]>(url, { headers }).pipe(
      map((responses) => responses.map((response) => User.fromApiResponse(response)))
    );
  }

  updateUser(userId: string, userData: Partial<User>): Observable<User> {
    const url = `${environment.supabaseUrl}/rest/v1/users?id=eq.${userId}`;
    const headers = new HttpHeaders({
      'apikey': environment.supabaseKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    });

    return this.http.patch<User>(url, userData, { headers });
  }

  deleteUser(userId: number): Observable<any> {
    const url = `${environment.supabaseUrl}/rest/v1/users?id=eq.${userId}`;
    const headers = new HttpHeaders({
      'apikey': environment.supabaseKey,
      'Content-Type': 'application/json'
    });

    return this.http.delete(url, { headers });
  }

  searchUsers(query: string): Observable<User[]> {
    const url = `${environment.supabaseUrl}/rest/v1/users`;

    const headers = new HttpHeaders({
      'apikey': environment.supabaseKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    });

    const trimmedQuery = query.trim();
    const words = trimmedQuery.split(/\s+/);

    let params = new HttpParams();

    if (words.length > 1) {
      const firstPart = words[0];
      const lastPart = words.slice(1).join(" ");
      params = params.set(
        'or',
        `(first.ilike.%${firstPart}%,last.ilike.%${lastPart}%,first.ilike.%${trimmedQuery}%,last.ilike.%${trimmedQuery}%,first.ilike.%${firstPart}%&last.ilike.%${lastPart}%)`
      );
    } else {
      params = params.set(
        'or',
        `(first.ilike.%${trimmedQuery}%,last.ilike.%${trimmedQuery}%)`
      );
    }

    return this.http.get<User[]>(url, { params, headers }).pipe(
      map((responses) => responses.map((response) => User.fromApiResponse(response)))
    );
  }
}

