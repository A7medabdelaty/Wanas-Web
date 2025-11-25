import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';


import { LoginRequest, LoginResponse, RegisterRequest, UserInfo, ConfirmEmailRequest, ResendConfirmationEmailRequest, ForgetPasswordRequest, ResetPasswordRequest } from '../models/auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth`, credentials)
      .pipe(
        tap(response => {
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

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  confirmEmail(data: ConfirmEmailRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/confirm-email`, data);
  }

  resendConfirmationEmail(data: ResendConfirmationEmailRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/resend-confirmation-email`, data);
  }

  forgetPassword(data: ForgetPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forget-password`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, data);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserInfo(): UserInfo | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}