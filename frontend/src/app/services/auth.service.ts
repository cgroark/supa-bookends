import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'auth_token_bookends'; // Local storage key for the JWT

  isLoggedIn(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    // Optionally validate the token (e.g., check expiration)
    return !!token;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
