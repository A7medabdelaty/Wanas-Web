import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { UpdateProfileRequest } from '../../../core/models/user';
import { UserService } from '../../../core/services/user.service';
import { PreferenceEdit } from '../../preferences/preference-edit/preference-edit';

@Component({
    selector: 'app-user-profile-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, PreferenceEdit],
    templateUrl: './user-profile-edit.html',
    styleUrl: './user-profile-edit.css',
})
export class UserProfileEdit implements OnInit {
    @ViewChild('fileInput') fileInput!: ElementRef;
    profileForm: FormGroup;
    loading = false;
    successMessage = '';
    errorMessage = '';
    photoPreview: string | null = null;
    selectedFile: File | null = null;
    isPhotoRemoved = false;

    constructor(private fb: FormBuilder, private userService: UserService) {
        this.profileForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            email: [{ value: '', disabled: true }],
            age: [null, [Validators.min(18), Validators.max(100)]],
            city: ['', [Validators.minLength(2), Validators.maxLength(50)]],
            phoneNumber: ['', [Validators.pattern('^01[0125][0-9]{8}$')]],
            bio: ['', [Validators.maxLength(500)]],
        });
    }

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile() {
        this.loading = true;
        this.userService.getProfile().subscribe({
            next: (data) => {
                this.profileForm.patchValue(data);
                if (data.photo) {
                    this.photoPreview = data.photo;
                }
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load profile', err);
                this.errorMessage = 'فشل تحميل بيانات الملف الشخصي.';
                this.loading = false;
            },
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.isPhotoRemoved = false;

            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                this.photoPreview = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    removePhoto() {
        this.photoPreview = null;
        this.selectedFile = null;
        this.isPhotoRemoved = true;
        if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
        }
    }

    getBioCharCount(): number {
        return this.profileForm.get('bio')?.value?.length || 0;
    }

    onSubmit() {
        if (this.profileForm.invalid) {
            this.profileForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.successMessage = '';
        this.errorMessage = '';

        const request: UpdateProfileRequest = {
            ...this.profileForm.value,
            photoFile: this.selectedFile || undefined,
            photo: this.isPhotoRemoved ? '' : undefined
        };

        this.userService.updateProfile(request).subscribe({
            next: (res) => {
                this.successMessage = 'تم تحديث الملف الشخصي بنجاح!';
                this.loading = false;
                setTimeout(() => (this.successMessage = ''), 3000);
            },
            error: (err) => {
                console.error(err);
                this.loading = false;

                if (err.status === 400 && err.error?.errors) {
                    // Handle validation errors
                    const validationErrors = err.error.errors;
                    const messages = [];

                    for (const key in validationErrors) {
                        if (validationErrors.hasOwnProperty(key)) {
                            // Translate each error message
                            const translatedErrors = validationErrors[key].map((msg: string) => this.translateError(msg));
                            messages.push(...translatedErrors);
                        }
                    }

                    this.errorMessage = messages.join('<br>');
                } else {
                    this.errorMessage = 'فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.';
                }
            },
        });
    }

    private translateError(error: string): string {
        const errors: { [key: string]: string } = {
            // Phone Number
            'Invalid phone number format': 'صيغة رقم الهاتف غير صحيحة (يجب أن يكون 11 رقم ويبدأ بـ 01)',

            // Full Name
            'Full name must be at least 3 characters': 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل',
            'Full name must not exceed 100 characters': 'الاسم الكامل يجب ألا يتجاوز 100 حرف',

            // Age
            'Age must be at least 18': 'يجب أن يكون العمر 18 عاماً على الأقل',
            'Age must not exceed 100': 'يجب ألا يتجاوز العمر 100 عام',

            // City
            'City must be at least 2 characters': 'اسم المدينة يجب أن يكون حرفين على الأقل',
            'City must not exceed 50 characters': 'اسم المدينة يجب ألا يتجاوز 50 حرفاً',

            // Bio
            'Bio must not exceed 500 characters': 'النبذة يجب ألا تتجاوز 500 حرف',
        };

        return errors[error] || error;
    }
}
