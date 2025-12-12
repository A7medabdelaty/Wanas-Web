import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UploadVerificationDocumentsResponse, VerificationStatus } from '../models/verification.model.ts';


@Injectable({
  providedIn: 'root'
})
export class VerificationService {
  private apiUrl = `${environment.apiUrl}/verification`;

  constructor(private http: HttpClient) {}

  /**
   * Upload verification documents (National ID front, back, selfie)
   */
  uploadDocuments(
    nationalIdFront: File,
    nationalIdBack: File,
    selfieWithId: File
  ): Observable<UploadVerificationDocumentsResponse> {
    const formData = new FormData();
    formData.append('NationalIdFront', nationalIdFront);
    formData.append('NationalIdBack', nationalIdBack);
    formData.append('SelfieWithId', selfieWithId);

    return this.http.post<UploadVerificationDocumentsResponse>(
      `${this.apiUrl}/upload`,
      formData
    );
  }

  /**
   * Get current user's verification status
   */
  getStatus(): Observable<VerificationStatus> {
    return this.http.get<VerificationStatus>(`${this.apiUrl}/status`);
  }

  /**
   * Get verification document by ID
   */
  getDocument(documentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/document/${documentId}`, {
      responseType: 'blob'
    });
  }

  /**
   * Helper: Get status label
   */
  getStatusLabel(status?: number): string {
    switch (status) {
      case 0: return 'قيد المراجعة';
      case 1: return 'تحت المراجعة';
      case 2: return 'موافق عليه';
      case 3: return 'مرفوض';
      case 4: return 'منتهي الصلاحية';
      default: return 'غير معروف';
    }
  }

  /**
   * Helper: Get status color
   */
  getStatusColor(status?: number): string {
    switch (status) {
      case 0: return 'warning'; // Pending
      case 1: return 'info';    // UnderReview
      case 2: return 'success'; // Approved
      case 3: return 'danger';  // Rejected
      case 4: return 'secondary'; // Expired
      default: return 'secondary';
    }
  }
}