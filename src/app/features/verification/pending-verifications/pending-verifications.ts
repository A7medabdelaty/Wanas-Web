import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminVerificationService } from '../../../core/services/admin-verification.service';
import { PendingVerification } from '../../../core/models/admin-verification.model';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-pending-verifications',
  templateUrl: './pending-verifications.html',
  styleUrls: ['./pending-verifications.css'],
  imports: [DatePipe, CommonModule]
})
export class PendingVerificationsComponent implements OnInit {
  pendingVerifications: PendingVerification[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private adminVerificationService: AdminVerificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPendingVerifications();
   
  }

  loadPendingVerifications(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.adminVerificationService.getPendingVerifications().subscribe({
      next: (verifications) => {
        this.pendingVerifications = verifications;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading pending verifications:', error);
        this.errorMessage = 'حدث خطأ أثناء تحميل البيانات';
        this.isLoading = false;
      }
    });
  }

 reviewVerification(verification: PendingVerification): void {
  this.adminVerificationService.setSelectedPendingVerification(verification);
  this.router.navigate(['/admin/verification/review']);
 }

  getDocumentCount(verification: PendingVerification): number {
    return verification.documents?.length || 0;
  }
}