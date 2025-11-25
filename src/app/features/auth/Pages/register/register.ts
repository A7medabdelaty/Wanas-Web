import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './register.html',
    styleUrls: ['./register.css']
})
export class RegisterComponent {
    registerForm: FormGroup;
    loading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            city: ['', [Validators.required]],
            phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]], // Basic phone validation
            profileType: [2, [Validators.required]] // Default to Renter (2)
        });
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        const request = {
            ...this.registerForm.value,
            profileType: Number(this.registerForm.value.profileType)
        };

        this.authService.register(request).subscribe({
            next: () => {
                this.loading = false;
                // Redirect to login or show success message
                this.router.navigate(['/auth/login'], { queryParams: { registered: true } });
            },
            error: (err) => {
                this.loading = false;
                if (err.error?.title) {
                    this.errorMessage = this.translateError(err.error.title);
                } else if (err.error?.message) {
                    this.errorMessage = this.translateError(err.error.message);
                } else {
                    this.errorMessage = 'حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.';
                }
            }
        });
    }

    hasError(fieldName: string): boolean {
        const field = this.registerForm.get(fieldName);
        return !!(field && field.invalid && field.touched);
    }

    private translateError(error: string): string {
        const errors: { [key: string]: string } = {
            'DuplicatedEmail': 'البريد الإلكتروني مستخدم بالفعل',
            'InvalidProfileType': 'نوع الحساب غير صحيح',
            'User.DuplicatedEmail': 'البريد الإلكتروني مستخدم بالفعل'
        };

        return errors[error] || error || 'حدث خطأ غير متوقع';
    }
}
