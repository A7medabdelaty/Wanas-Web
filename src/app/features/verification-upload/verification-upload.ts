import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VerificationService } from '../../core/services/verification.service.ts';

@Component({
  selector: 'app-verification-upload',
  templateUrl: './verification-upload.html',
  styleUrls: ['./verification-upload.css'],
  imports: [CommonModule]
})
export class VerificationUploadComponent implements OnInit {
  // Form state
  nationalIdFront: File | null = null;
  nationalIdBack: File | null = null;
  selfieWithId: File | null = null;

  // Preview URLs
  nationalIdFrontPreview: string | null = null;
  nationalIdBackPreview: string | null = null;
  selfieWithIdPreview: string | null = null;

  // UI state
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // File validation
  maxFileSize = 10 * 1024 * 1024; // 10MB
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  constructor(
    private verificationService: VerificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user already submitted
    this.checkExistingSubmission();
  }

  checkExistingSubmission(): void {
    this.verificationService.getStatus().subscribe({
      next: (status) => {
        if (status.hasSubmitted && status.status === 0) {
          // Already has pending submission
          this.router.navigate(['/verification/status']);
        }
      },
      error: (err) => console.error('Error checking status:', err)
    });
  }

  onFileSelected(event: any, type: 'front' | 'back' | 'selfie'): void {
    const file: File = event.target.files[0];

    if (!file) return;

    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      this.errorMessage = validation.error!;
      return;
    }

    // Clear error
    this.errorMessage = null;

    // Set file and preview
    switch (type) {
      case 'front':
        this.nationalIdFront = file;
        this.createPreview(file, 'front');
        break;
      case 'back':
        this.nationalIdBack = file;
        this.createPreview(file, 'back');
        break;
      case 'selfie':
        this.selfieWithId = file;
        this.createPreview(file, 'selfie');
        break;
    }
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `حجم الملف يجب أن يكون أقل من ${this.maxFileSize / 1024 / 1024}MB`
      };
    }

    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'نوع الملف غير مسموح. يُسمح فقط بـ JPG, JPEG, PNG'
      };
    }

    return { valid: true };
  }

  createPreview(file: File, type: 'front' | 'back' | 'selfie'): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      switch (type) {
        case 'front':
          this.nationalIdFrontPreview = e.target.result;
          break;
        case 'back':
          this.nationalIdBackPreview = e.target.result;
          break;
        case 'selfie':
          this.selfieWithIdPreview = e.target.result;
          break;
      }
    };
    reader.readAsDataURL(file);
  }

  removeFile(type: 'front' | 'back' | 'selfie'): void {
    switch (type) {
      case 'front':
        this.nationalIdFront = null;
        this.nationalIdFrontPreview = null;
        break;
      case 'back':
        this.nationalIdBack = null;
        this.nationalIdBackPreview = null;
        break;
      case 'selfie':
        this.selfieWithId = null;
        this.selfieWithIdPreview = null;
        break;
    }
  }

  isFormValid(): boolean {
    return !!(
      this.nationalIdFront &&
      this.nationalIdBack &&
      this.selfieWithId
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'يرجى رفع جميع المستندات المطلوبة';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.verificationService
      .uploadDocuments(
        this.nationalIdFront!,
        this.nationalIdBack!,
        this.selfieWithId!
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = response.message;
          
          // Redirect to status page after 2 seconds

           this.router.navigate(['/verification/status'], { 
            state: { uploadSuccess: true, message: response.message } 
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'حدث خطأ أثناء رفع المستندات';
        }
      });
  }
}