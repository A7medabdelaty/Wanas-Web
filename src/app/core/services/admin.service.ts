import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export enum ReportStatus {
    Pending = 0,
    Reviewed = 1,
    Resolved = 2,
    Rejected = 3
}

export enum ReportSeverity {
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}

export enum ReportTarget {
    User = 0,
    Listing = 1
}

export interface ReportResponseDto {
    reportId: number;
    reporterId: string;
    targetType: ReportTarget;
    targetId: string;
    reason: string;
    createdAt: string;
    status: ReportStatus;
    photoUrls: string[];
    isEscalated: boolean;
    escalatedAt?: string;
    escalationReason?: string;
    reviewedByAdminId?: string;
    reviewedAt?: string;
    adminNote?: string;
    severity: ReportSeverity;
}

export interface UpdateReportStatusDto {
    newStatus: ReportStatus;
    adminNote?: string;
    severity?: ReportSeverity;
}

export interface EscalateReportDto {
    reason: string;
    cancelEscalation: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl + '/admin';

    getReports(status?: ReportStatus, escalated?: boolean, severity?: ReportSeverity): Observable<{ totalCount: number, reports: ReportResponseDto[] }> {
        let params = new HttpParams();
        if (status !== undefined && status !== null) params = params.set('status', status.toString());
        if (escalated !== undefined && escalated !== null) params = params.set('escalated', escalated.toString());
        if (severity !== undefined && severity !== null) params = params.set('severity', severity.toString());

        return this.http.get<{ totalCount: number, reports: ReportResponseDto[] }>(`${this.apiUrl}/reports`, { params });
    }

    getReportById(id: number): Observable<ReportResponseDto> {
        return this.http.get<ReportResponseDto>(`${this.apiUrl}/reports/${id}`);
    }

    updateReportStatus(id: number, dto: UpdateReportStatusDto): Observable<any> {
        return this.http.post(`${this.apiUrl}/reports/${id}/status`, dto);
    }

    escalateReport(id: number, dto: EscalateReportDto): Observable<any> {
        return this.http.post(`${this.apiUrl}/reports/${id}/escalate`, dto);
    }

    banUser(userId: string, reason: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/users/${userId}/ban`, { reason });
    }

    suspendUser(userId: string, durationInDays: number, reason: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/users/${userId}/suspend`, { durationInDays, reason });
    }
}
