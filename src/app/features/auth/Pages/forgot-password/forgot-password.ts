import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './forgot-password.html',
    styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
    forgotPasswordForm: FormGroup;
    loading = false;
    success = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.forgotPasswordForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit(): void {
        if (this.forgotPasswordForm.invalid) {
            this.forgotPasswordForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.success = false;

        const { email } = this.forgotPasswordForm.value;

        this.authService.forgetPassword({ email }).subscribe({
            next: () => {
                this.loading = false;
                this.success = true;
            },
            error: (err) => {
                console.error('❌ خطأ في إرسال رمز إعادة التعيين:', err);

                // Extract error code
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
                    this.errorMessage = 'حدث خطأ أثناء إرسال رمز إعادة التعيين. حاول مرة أخرى.';
                }

                this.loading = false;
            }
        });
    }

    hasError(fieldName: string): boolean {
        const field = this.forgotPasswordForm.get(fieldName);
        return !!(field && field.invalid && field.touched);
    }

    private translateError(error: string): string {
        const errors: { [key: string]: string } = {
            'User.UserNotFound': 'البريد الإلكتروني غير مسجل',
            'User.EmailNotConfirmed': 'يجب تأكيد البريد الإلكتروني أولاً',
            'User.InvalidEmail': 'صيغة البريد الإلكتروني غير صحيحة'
        };

        return errors[error] || 'حدث خطأ أثناء إرسال رمز إعادة التعيين. حاول مرة أخرى.';
    }
}
