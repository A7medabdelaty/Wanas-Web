import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

@Component({
    selector: 'app-email-confirmation',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './email-confirmation.html',
    styleUrls: ['./email-confirmation.css']
})
export class EmailConfirmationComponent implements OnInit {
    loading = true;
    success = false;
    errorMessage = '';
    userId = '';
    code = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        // Get userId and code from query parameters
        this.route.queryParams.subscribe(params => {
            this.userId = params['userId'] || '';
            this.code = params['code'] || '';

            if (this.userId && this.code) {
                this.confirmEmail();
            } else {
                this.loading = false;
                this.errorMessage = 'رابط التأكيد غير صحيح. تأكد من نسخ الرابط كاملاً.';
            }
        });
    }

    confirmEmail(): void {
        this.loading = true;
        this.errorMessage = '';

        this.authService.confirmEmail({ userId: this.userId, code: this.code }).subscribe({
            next: () => {
                this.loading = false;
                this.success = true;
            },
            error: (err) => {
                console.error('❌ خطأ في تأكيد البريد الإلكتروني:', err);

                // Extract error code from different possible formats
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

                // Translate the error code to Arabic
                if (errorCode) {
                    this.errorMessage = this.translateError(errorCode);
                } else {
                    this.errorMessage = 'حدث خطأ أثناء تأكيد البريد الإلكتروني. حاول مرة أخرى.';
                }

                this.loading = false;
            }
        });
    }

    goToLogin(): void {
        this.router.navigate(['/auth/login']);
    }

    private translateError(error: string): string {
        const errors: { [key: string]: string } = {
            'User.InvalidCode': 'كود التأكيد غير صحيح',
            'User.ExpiredCode': 'كود التأكيد منتهي الصلاحية',
            'User.AlreadyConfirmed': 'البريد الإلكتروني مؤكد بالفعل',
            'User.UserNotFound': 'المستخدم غير موجود'
        };

        return errors[error] || 'حدث خطأ أثناء تأكيد البريد الإلكتروني. حاول مرة أخرى.';
    }
}