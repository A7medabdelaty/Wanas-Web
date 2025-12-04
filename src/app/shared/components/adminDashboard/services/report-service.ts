import { environment } from './../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BanResult, ReportModel, ReportSeverity, ReportStatus, SuspendResult } from '../models/report-model';

@Injectable({
  providedIn: 'root',
})

export class ReportService {

  baseUrl = environment.apiUrl;
  constructor(private httpClient: HttpClient) { }

  getReports(filters?: {
    status?: ReportStatus | null;
    escalated?: boolean | null;
    severity?: ReportSeverity | null;
  }): Observable<{ totalCount: number; reports: ReportModel[] }> {
    const params: Record<string, string> = {};
    if (filters?.status !== undefined && filters.status !== null) params['status'] = String(filters.status);
    if (filters?.escalated !== undefined && filters.escalated !== null) params['escalated'] = String(filters.escalated);
    if (filters?.severity !== undefined && filters.severity !== null) params['severity'] = String(filters.severity);

    const query = new URLSearchParams(params).toString();
    const url = query ? `${this.baseUrl}/admin/reports?${query}` : `${this.baseUrl}/admin/reports`;
    return this.httpClient.get<{ totalCount: number; reports: ReportModel[] }>(url);
  }


  getReportById(ID: number): Observable<ReportModel> {
    return this.httpClient.get<ReportModel>(`${this.baseUrl}/admin/reports/${ID}`);
  }


  updateReportStatus(reportId: number, dto: { newStatus: ReportStatus; adminNote?: string }): Observable<void> {
    return this.httpClient.post<void>(`${this.baseUrl}/admin/reports/${reportId}/status`, dto);
  }

  banUser(userId: string, reason: string): Observable<BanResult> {
    return this.httpClient.post<BanResult>(`${this.baseUrl}/admin/users/${userId}/ban`, { reason });
  }

  unbanUser(userId: string, reason: string) {
    return this.httpClient.post(`/api/admin/users/${userId}/unban`, { reason });
  }

  suspendUser(userId: string, durationInDays: number, reason: string): Observable<SuspendResult> {
    return this.httpClient.post<SuspendResult>(`${this.baseUrl}/admin/users/${userId}/suspend`, { durationDays: durationInDays, reason });
  }


  unsuspendUser(userId: string, reason: string) {
    return this.httpClient.post(`/api/admin/users/${userId}/unsuspend`, { reason });
  }


  
  deleteListing(listingId: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/listing/${listingId}`);
  }


}



