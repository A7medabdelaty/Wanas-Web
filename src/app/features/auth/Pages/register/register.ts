import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { CITIES } from '../../../../core/constants/cities';

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
    openDropdown: string | null = null;
    showPassword = false;
    registrationSuccess = false;
    cities = CITIES;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            city: ['', [Validators.required]],
            phoneNumber: ['', [Validators.required, Validators.pattern('^(010|011|012|015)[0-9]{8}$')]],
            profileType: [2, [Validators.required]] // Default to Renter (2)
        });
    }

    toggleDropdown(name: string): void {
        this.openDropdown = this.openDropdown === name ? null : name;
    }

    selectProfileType(type: number): void {
        this.registerForm.patchValue({ profileType: type });
        this.registerForm.get('profileType')?.markAsTouched();
        this.openDropdown = null;
    }

    selectCity(city: string): void {
        this.registerForm.patchValue({ city: city });
        this.registerForm.get('city')?.markAsTouched();
        this.openDropdown = null;
    }

    get selectedProfileTypeLabel(): string {
        const type = this.registerForm.get('profileType')?.value;
        return type === 1 ? 'مالك (Owner)' : 'مستأجر (Renter)';
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        const request = {
            email: this.registerForm.value.email,
            password: this.registerForm.value.password,
            fullName: this.registerForm.value.fullName,
            city: this.registerForm.value.city,
            phoneNumber: this.registerForm.value.phoneNumber,
            profileType: Number(this.registerForm.value.profileType)
        };

        this.authService.register(request).subscribe({
            next: () => {
                this.loading = false;
                this.registrationSuccess = true;
            },
            error: (err) => {
                console.error('❌ خطأ في التسجيل:', err);

                // Extract error code from different possible formats
                let errorCode = '';

                if (err.error?.errors) {
                    if (Array.isArray(err.error.errors)) {
                        // errors is an array: ["User.DuplicatedEmail", "Email already exists"]
                        errorCode = err.error.errors[0];
                    } else if (typeof err.error.errors === 'object') {
                        // errors is an object: { "Password": ["Password should be..."] }
                        const firstKey = Object.keys(err.error.errors)[0];
                        if (firstKey && Array.isArray(err.error.errors[firstKey]) && err.error.errors[firstKey].length > 0) {
                            errorCode = err.error.errors[firstKey][0];
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
                    this.errorMessage = 'حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.';
                }

                this.loading = false;
            }
        });
    }

    hasError(fieldName: string): boolean {
        const field = this.registerForm.get(fieldName);
        return !!(field && field.invalid && field.touched);
    }

    togglePassword(): void {
        this.showPassword = !this.showPassword;
    }

    private translateError(error: string): string {
        const errors: { [key: string]: string } = {
            // Registration specific errors
            'User.DuplicatedEmail': 'البريد الإلكتروني مستخدم بالفعل',
            'User.InvalidProfileType': 'لا يمكن التسجيل كمسؤول. يُسمح فقط بالمالك أو المستأجر',
            'User.InvalidEmail': 'صيغة البريد الإلكتروني غير صحيحة',
            'Password should be at least 8 digits and should contains Lowercase, NonAlphanumeric and Uppercase':
                'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على أحرف كبيرة وصغيرة وأرقام ورموز'
        };

        return errors[error] || 'حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.';
    }
}
