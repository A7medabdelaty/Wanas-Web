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
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        console.log('✅ تسجيل دخول ناجح:', response);

        if (!response.isProfileCompleted) {
          this.router.navigate(['/onboarding/profile']);
        } else if (!response.isPreferenceCompleted) {
          this.router.navigate(['/onboarding/preferences']);
        } else {
          this.router.navigate(['/home']);
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('❌ خطأ في تسجيل الدخول:', err);
        
        if (err.error?.title) {
          this.errorMessage = this.translateError(err.error.title);
        } else if (err.error?.message) {
          this.errorMessage = this.translateError(err.error.message);
        } else {
          this.errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
        }
        
        this.loading = false;
      }
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
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