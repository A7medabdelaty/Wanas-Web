import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { LoginRequest, LoginResponse, RegisterRequest, UserInfo } from '../models/auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // الـ Backend URL من environment
  private apiUrl = environment.apiUrl;

  // HttpClient علشان نعمل HTTP requests
  constructor(private http: HttpClient) { }

  // دالة الـ Login
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth`, credentials)
      .pipe(
        tap(response => {
          // لما الـ login ينجح، نحفظ البيانات
          localStorage.setItem('token', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);

          const userInfo: UserInfo = {
            id: response.id,
            email: response.email,
            fullName: response.fullName,
            isFirstLogin: response.isFirstLogin,
            isProfileCompleted: response.isProfileCompleted,
            isPreferenceCompleted: response.isPreferenceCompleted
          };

          localStorage.setItem('user', JSON.stringify(userInfo));
        })
      );
  }

  // دالة الـ Register
  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  // دالة الـ Logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // شيك لو اليوزر مسجل دخول
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // جيب معلومات اليوزر
  getUserInfo(): UserInfo | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // جيب الـ Token
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}