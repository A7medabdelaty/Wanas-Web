import { Component, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OnboardingService } from '../../onboarding/services/onboarding.service';

@Component({
  selector: 'app-complete-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complete-profile.html',
  styleUrl: './complete-profile.css',
})
export class CompleteProfile {
  @Output() profileCompleted = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private onboardingService = inject(OnboardingService);

  profileForm: FormGroup;
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.profileForm = this.fb.group({
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      bio: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.processFile(file);
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  processFile(file: File) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('الرجاء اختيار صورة فقط');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    this.selectedFile.set(file);
    this.errorMessage.set(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeFile() {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }

  getBioCharCount(): number {
    return this.profileForm.get('bio')?.value?.length || 0;
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formData = {
      age: this.profileForm.value.age,
      bio: this.profileForm.value.bio,
      photoFile: this.selectedFile(),
    };

    this.onboardingService.completeProfile(formData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.profileCompleted.emit();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'حدث خطأ أثناء حفظ البيانات');
      },
    });
  }
}
