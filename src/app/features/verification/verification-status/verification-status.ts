import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { VerificationService } from '../../../core/services/verification.service';
import { CommonModule } from '@angular/common';
import { VerificationStatus, VerificationStatusEnum } from '../../../core/models/verification.model';

@Component({
  selector: 'app-verification-status',
  templateUrl: './verification-status.html',
  styleUrls: ['./verification-status.css'],
  imports: [CommonModule, RouterLink]
})
export class VerificationStatusComponent implements OnInit {
  verificationStatus: VerificationStatus | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  justUploaded = false;
  constructor(
    public verificationService: VerificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1. Check if we just came from the upload page
    if (history.state.uploadSuccess) {
      this.justUploaded = true;
      // Optional: Auto-hide after 5 seconds
      setTimeout(() => this.justUploaded = false, 7000);
    }
    this.loadStatus();
  }

  loadStatus(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.verificationService.getStatus().subscribe({
      next: (status) => {
        this.verificationStatus = status;
        this.isLoading = false;

        // If not submitted, redirect to upload page
        if (!status.hasSubmitted) {
          this.router.navigate(['/verification/upload']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'حدث خطأ أثناء تحميل البيانات';
      }
    });
  }

  viewDocument(documentId: string): void {
    this.verificationService.getDocument(documentId).subscribe({
      next: (blob) => {
        // Create blob URL and open in new tab
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (error) => {
        console.error('Error viewing document:', error);
        alert('حدث خطأ أثناء عرض المستند');
      }
    });
  }

  getStatusClass(status: VerificationStatusEnum | undefined): string {
    switch (status) {
      case VerificationStatusEnum.Pending: return 'pending'; // Under Review
      case VerificationStatusEnum.UnderReview: return 'under-review'; // Processing
      case VerificationStatusEnum.Approved: return 'success'; // Approved
      case VerificationStatusEnum.Rejected: return 'rejected'; // Rejected
      default: return 'expired';
    }
  }

  getDocumentTypeLabel(type: number): string {
    switch (type) {
      case 1: return 'البطاقة (الأمام)';
      case 2: return 'البطاقة (الخلف)';
      case 3: return 'صورة شخصية';
      default: return 'مستند';
    }
  }
}