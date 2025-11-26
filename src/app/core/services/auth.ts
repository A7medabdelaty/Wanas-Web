import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ConfirmEmailRequest,
  ResendConfirmationEmailRequest,
  ForgetPasswordRequest,
  ResetPasswordRequest,
  UserInfo
} from '../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  // BehaviorSubject to track user state - starts with current user or null
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(this.getUserInfo());

  // Observable that components can subscribe to
  public currentUser$ = this.currentUserSubject.asObservable();

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
            photoURL: response.photoURL,
            isFirstLogin: response.isFirstLogin,
            isProfileCompleted: response.isProfileCompleted,
            isPreferenceCompleted: response.isPreferenceCompleted
          };

          localStorage.setItem('user', JSON.stringify(userInfo));

          // ✨ Notify all subscribers that user logged in
          this.currentUserSubject.next(userInfo);
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

    // ✨ Notify all subscribers that user logged out
    this.currentUserSubject.next(null);
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