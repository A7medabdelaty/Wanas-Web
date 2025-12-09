import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './reset-password.html',
    styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
    resetPasswordForm: FormGroup;
    loading = false;
    success = false;
    errorMessage = '';
    email = '';
    code = '';
    showNewPassword = false;
    showConfirmPassword = false;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) {
        this.resetPasswordForm = this.fb.group({
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit(): void {
        // Get email and code from query parameters
        this.route.queryParams.subscribe(params => {
            this.email = params['email'] || '';
            this.code = params['code'] || '';
        });
    }

    passwordMatchValidator(form: FormGroup) {
        const newPassword = form.get('newPassword');
        const confirmPassword = form.get('confirmPassword');

        if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }

        return null;
    }

    onSubmit(): void {
        if (this.resetPasswordForm.invalid) {
            this.resetPasswordForm.markAllAsTouched();
            return;
        }

        if (!this.email || !this.code) {
            this.errorMessage = 'رابط إعادة التعيين غير صحيح. تأكد من نسخ الرابط كاملاً.';
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.success = false;

        const { newPassword } = this.resetPasswordForm.value;

        this.authService.resetPassword({
            email: this.email,
            code: this.code,
            newPassword: newPassword
        }).subscribe({
            next: () => {
                this.loading = false;
                this.success = true;
            },
            error: (err) => {
                console.error('❌ خطأ في إعادة تعيين كلمة المرور:', err);

                // Extract error code
                let errorCode = '';

                if (err.error?.errors) {
                    if (Array.isArray(err.error.errors)) {
                        errorCode = err.error.errors[0];
                    } else if (typeof err.error.errors === 'object') {
                        const errorKeys = Object.keys(err.error.errors);
                        if (errorKeys.length > 0) {
                            const firstKey = errorKeys[0];
                            const errorValue = err.error.errors[firstKey];

                            if (Array.isArray(errorValue) && errorValue.length > 0) {
                                errorCode = errorValue[0];
                            } else {
                                errorCode = firstKey;
                            }
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
                    this.errorMessage = 'حدث خطأ أثناء إعادة تعيين كلمة المرور. حاول مرة أخرى.';
                }

                this.loading = false;
            }
        });
    }

    hasError(fieldName: string): boolean {
        const field = this.resetPasswordForm.get(fieldName);
        return !!(field && field.invalid && field.touched);
    }

    toggleNewPassword(): void {
        this.showNewPassword = !this.showNewPassword;
    }

    toggleConfirmPassword(): void {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    goToLogin(): void {
        this.router.navigate(['/auth/login']);
    }

    private translateError(error: string): string {
        const errors: { [key: string]: string } = {
            'User.InvalidCode': 'الكود غير صحيح أو منتهي الصلاحية',
            'User.ExpiredCode': 'انتهت صلاحية الكود. اطلب كود جديد',
            'User.UserNotFound': 'المستخدم غير موجود',
            'Password should be at least 8 digits and should contains Lowercase, NonAlphanumeric and Uppercase':
                'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على أحرف كبيرة وصغيرة وأرقام ورموز'
        };

        return errors[error] || 'حدث خطأ أثناء إعادة تعيين كلمة المرور. حاول مرة أخرى.';
    }
}
