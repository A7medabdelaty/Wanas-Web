import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login({ email, password }, rememberMe).subscribe({
      next: (response) => {
        console.log('✅ تسجيل دخول ناجح:', response);

        this.router.navigate(['/']);

        this.loading = false;
      },
      error: (err) => {
        console.error('❌ خطأ في تسجيل الدخول:', err);

        let errorCode = '';

        if (err.error?.errors) {
          if (Array.isArray(err.error.errors)) {
            errorCode = err.error.errors[0];
          } else if (typeof err.error.errors === 'object') {
            const firstKey = Object.keys(err.error.errors)[0];
            if (firstKey) {
              errorCode = firstKey;
            }
          }
        } else if (err.error?.code) {
          errorCode = err.error.code;
        } else if (err.error?.message) {
          errorCode = err.error.message;
        } else if (err.error?.title) {
          errorCode = err.error.title;
        }

        if (errorCode) {
          this.errorMessage = this.translateError(errorCode);
        } else {
          this.errorMessage = 'حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.';
        }

        this.loading = false;
      }
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private translateError(error: string): string {
    const errors: { [key: string]: string } = {
      'Invalid email or password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      'Email not confirmed': 'يجب تأكيد البريد الإلكتروني أولاً',
      'Invalid credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      'User.InvalidCredentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      'User.EmailNotConfirmed': 'يجب تأكيد البريد الإلكتروني أولاً'
    };

    return errors[error] || 'حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.';
  }
}
