import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewVerificationRequest, VerificationDocumentDto } from '../../../core/models/admin-verification.model';
import { AdminVerificationService } from '../../../core/services/admin-verification.service';
import { VerificationService } from '../../../core/services/verification.service.ts';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-review-verification',
  templateUrl: './review-verification.html',
  styleUrls: ['./review-verification.css'],
  imports: [DatePipe, CommonModule, FormsModule]
})
export class ReviewVerificationComponent implements OnInit {
  userId: string = '';
  verification: any = null;
  documents: VerificationDocumentDto[] = [];

  // Document images
  nationalIdFront: string | null = null;
  nationalIdBack: string | null = null;
  selfieWithId: string | null = null;

  // UI State
  isLoading = true;
  isSubmitting = false;
  errorMessage: string | null = null;

  // Review form
  rejectionReason: string = '';
  showRejectionInput = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminVerificationService: AdminVerificationService,
    public verificationService: VerificationService
  ) { }

  ngOnInit(): void {
    // Try reading selection from shared service first
    this.verification = this.adminVerificationService.getSelectedPendingVerification();
    if (this.verification) {
      this.userId = this.verification.userId;
      this.documents = this.verification.documents ?? [];
      this.loadDocumentImages();
      return;
    }

    // No data available (e.g., direct URL or refresh)
    this.router.navigate(['/admin/verification/pending']);
  }

  loadDocumentImages(): void {
    const frontDoc = this.documents.find(d => d.documentType === 1);
    const backDoc = this.documents.find(d => d.documentType === 2);
    const selfieDoc = this.documents.find(d => d.documentType === 3);

    if (frontDoc) this.loadImage(frontDoc.id, 'front');
    if (backDoc) this.loadImage(backDoc.id, 'back');
    if (selfieDoc) this.loadImage(selfieDoc.id, 'selfie');
  }

  loadImage(documentId: string, type: 'front' | 'back' | 'selfie'): void {
    this.adminVerificationService.getDocument(documentId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        switch (type) {
          case 'front': this.nationalIdFront = url; break;
          case 'back': this.nationalIdBack = url; break;
          case 'selfie': this.selfieWithId = url; break;
        }

        if (this.nationalIdFront && this.nationalIdBack && this.selfieWithId) {
          this.isLoading = false;
        }
      },
      error: () => {
        this.errorMessage = 'تعذر تحميل صورة الوثيقة';
      }
    });
  }

 approveVerification(): void {
  // 1. Show Confirmation Dialog
  Swal.fire({
    title: 'هل أنت متأكد؟',
    text: "سيتم الموافقة على طلب التوثيق وتفعيل هوية المستخدم.",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#172351', // Wanas Blue
    cancelButtonColor: '#ef4444',  // Red for cancel
    confirmButtonText: 'نعم، موافقة',
    cancelButtonText: 'إلغاء',
    reverseButtons: true,          // Better UX for Arabic
    customClass: {
      popup: 'font-cairo',         // Apply Cairo font
      title: 'fw-bold'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      
      // 2. Proceed with Logic
      this.isSubmitting = true;
      this.errorMessage = null;
      
      const request: ReviewVerificationRequest = { 
        userId: this.userId, 
        status: 2, 
        rejectionReason: null 
      };

      this.adminVerificationService.reviewVerification(request).subscribe({
        next: () => {
          // 3. Show Success Dialog
          Swal.fire({
            title: 'تم بنجاح!',
            text: 'تمت الموافقة على الطلب وتوثيق الحساب.',
            icon: 'success',
            confirmButtonColor: '#172351',
            confirmButtonText: 'حسناً',
            customClass: { popup: 'font-cairo' }
          }).then(() => {
            // Navigate after closing the alert
            this.router.navigate(['/admin/verification/pending']); 
          });
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.error?.message || 'حدث خطأ أثناء الموافقة';
          
        }
      });
    }
  });
}

  rejectVerification(): void {
  this.isSubmitting = true;
  this.errorMessage = null;

  const request: ReviewVerificationRequest = { 
    userId: this.userId, 
    status: 3, 
    rejectionReason: this.rejectionReason 
  };

  this.adminVerificationService.reviewVerification(request).subscribe({
    next: () => {
      // Replace standard alert with SweetAlert
      Swal.fire({
        title: 'تم الرفض!',
        text: 'تم رفض طلب التوثيق بنجاح.',
        icon: 'success',
        confirmButtonColor: '#172351', // Wanas Blue
        confirmButtonText: 'تم',
        customClass: { popup: 'font-cairo' }
      }).then(() => {
        this.router.navigate(['/admin/verification/pending']);
      });
    },
    error: (error) => {
      this.errorMessage = error.error?.message || 'حدث خطأ أثناء الرفض';
      this.isSubmitting = false;
    }
  });
}

  toggleRejectionInput(): void {
    this.showRejectionInput = !this.showRejectionInput;
    if (!this.showRejectionInput) this.rejectionReason = '';
  }

  openImageModal(imageUrl: string, title: string): void {
    window.open(imageUrl, '_blank');
  }

  goBack(): void { this.router.navigate(['/admin/verification/pending']); }
  // Add inside your component class
  getStatusBadgeClass(status: number | undefined): string {
    switch (status) {
      case 0: return 'bg-warning text-dark'; // Pending
      case 1: return 'bg-info text-white';    // Processing
      case 2: return 'bg-success text-white'; // Approved
      case 3: return 'bg-danger text-white';  // Rejected
      default: return 'bg-secondary text-white';
    }
  }
}