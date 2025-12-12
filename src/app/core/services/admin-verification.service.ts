import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  PendingVerification,
  ReviewVerificationRequest,
  UnverifyUserRequest
} from '../models/admin-verification.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminVerificationService {
  private apiUrl = `${environment.apiUrl}/verification`;
  private adminUrl = `${environment.apiUrl}/admin/users`;
  private selectedPendingVerification?: PendingVerification;

  constructor(private http: HttpClient) {}

  /**
   * Get all pending verifications (Admin only)
   */
  getPendingVerifications(): Observable<PendingVerification[]> {
    return this.http.get<PendingVerification[]>(`${this.apiUrl}/pending`);
  }

  /**
   * Shared selection across navigation
   */
  setSelectedPendingVerification(verification: PendingVerification): void {
    this.selectedPendingVerification = verification;
  }

  getSelectedPendingVerification(): PendingVerification | undefined {
    return this.selectedPendingVerification;
  }

  clearSelectedPendingVerification(): void {
    this.selectedPendingVerification = undefined;
  }

  /**
   * Get specific verification document by ID
   */
  getDocument(documentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/document/${documentId}`, {
      responseType: 'blob'
    });
  }

  /**
   * Review verification (Approve/Reject)
   */
  reviewVerification(request: ReviewVerificationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/review`, request);
  }


  /**
   * Verify user (using existing admin endpoint)
   */
  verifyUser(userId: string, reason?: string): Observable<any> {
    return this.http.post(`${this.adminUrl}/${userId}/verify`, {
      reason: reason || 'Approved via verification documents'
    });
  }

  /**
   * Unverify user (using existing admin endpoint)
   */
  unverifyUser(userId: string, request: UnverifyUserRequest): Observable<any> {
    return this.http.post(`${this.adminUrl}/${userId}/unverify`, request);
  }

  /**
   * Helper: Get document type label
   */
  getDocumentTypeLabel(type: number): string {
    switch (type) {
      case 1: return 'البطاقة (الأمام)';
      case 2: return 'البطاقة (الخلف)';
      case 3: return 'صورة شخصية';
      default: return 'مستند';
    }
  }

  /**
   * Helper: Get status label
   */
  getStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'قيد المراجعة';
      case 1: return 'تحت المراجعة';
      case 2: return 'موافق عليه';
      case 3: return 'مرفوض';
      case 4: return 'منتهي الصلاحية';
      default: return 'غير معروف';
    }
  }
}