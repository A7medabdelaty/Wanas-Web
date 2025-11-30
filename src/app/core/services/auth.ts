import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import {
  LoginRequest, LoginResponse, RegisterRequest,
  ConfirmEmailRequest, ResendConfirmationEmailRequest,
  ForgetPasswordRequest, ResetPasswordRequest, UserInfo
} from '../models/auth';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  // BehaviorSubject holds current user info (or null)
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(this.loadUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { }

  // ---------- AUTH ACTIONS ----------
  login(credentials: LoginRequest, rememberMe = false): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth`, credentials)
      .pipe(
        tap(response => {
          this.saveTokens(response.token, response.refreshToken, rememberMe);
          const userInfo: UserInfo = {
            id: response.id,
            email: response.email,
            fullName: response.fullName,
            photoURL: response.photoURL ?? null,
            isFirstLogin: response.isFirstLogin,
            isProfileCompleted: response.isProfileCompleted,
            isPreferenceCompleted: response.isPreferenceCompleted,
            role: response.role
          };
          this.saveUser(userInfo, rememberMe);
          this.currentUserSubject.next(userInfo);
        })
      );
  }

  refreshToken(): Observable<LoginResponse> {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    if (!token || !refreshToken) return of(null as any);

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/refresh`, { token, refreshToken })
      .pipe(
        tap(response => {
          // Determine if we are using persistent storage (Remember Me)
          // If the current token is in localStorage, we should keep using localStorage.
          const isPersistent = !!localStorage.getItem('token');

          // update tokens + user
          this.saveTokens(response.token, response.refreshToken, isPersistent);
          const userInfo: UserInfo = {
            id: response.id,
            email: response.email,
            fullName: response.fullName,
            photoURL: response.photoURL ?? null,
            isFirstLogin: response.isFirstLogin,
            isProfileCompleted: response.isProfileCompleted,
            isPreferenceCompleted: response.isPreferenceCompleted,
            role: response.role
          };
          this.saveUser(userInfo, isPersistent);
          this.currentUserSubject.next(userInfo);
        })
      );
  }

  logout(): void {
    // call revoke endpoint optionally
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    if (token && refreshToken) {
      // best-effort notify backend (fire-and-forget)
      this.http.post(`${this.apiUrl}/auth/revoke-refresh-token`, { token, refreshToken })
        .subscribe({ next: () => { }, error: () => { } });
    }

    // remove everything
    sessionStorage.removeItem('token'); sessionStorage.removeItem('refreshToken'); sessionStorage.removeItem('user');
    localStorage.removeItem('token'); localStorage.removeItem('refreshToken'); localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  register(data: RegisterRequest) { return this.http.post(`${this.apiUrl}/auth/register`, data); }
  confirmEmail(data: ConfirmEmailRequest) { return this.http.post(`${this.apiUrl}/auth/confirm-email`, data); }
  resendConfirmationEmail(data: ResendConfirmationEmailRequest) { return this.http.post(`${this.apiUrl}/auth/resend-confirmation-email`, data); }
  forgetPassword(data: ForgetPasswordRequest) { return this.http.post(`${this.apiUrl}/auth/forget-password`, data); }
  resetPassword(data: ResetPasswordRequest) { return this.http.post(`${this.apiUrl}/auth/reset-password`, data); }

  // ---------- STORAGE HELPERS ----------
  private saveTokens(token: string, refresh: string, rememberMe: boolean) {
    if (rememberMe) {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refresh);
    } else {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('refreshToken', refresh);
    }
  }

  private saveUser(user: UserInfo, rememberMe: boolean) {
    const json = JSON.stringify(user);
    if (rememberMe) localStorage.setItem('user', json);
    else sessionStorage.setItem('user', json);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token') ?? localStorage.getItem('token');
  }
  getRefreshToken(): string | null {
    return sessionStorage.getItem('refreshToken') ?? localStorage.getItem('refreshToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser(): UserInfo | null {
    return this.loadUser();
  }

  private loadUser(): UserInfo | null {
    const s = sessionStorage.getItem('user') ?? localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  }
}
