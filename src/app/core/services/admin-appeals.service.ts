import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    AdminAppealsResponse,
    ReviewAppealRequest,
    ReviewAppealResponse,
    UnsuspendUserRequest,
    UnbanUserRequest
} from '../models/admin-appeal.model';
import { AppealStatus } from '../../features/appeals/enums/appeal-status.enum';


@Injectable({
    providedIn: 'root'
})
export class AdminAppealsService {
    private readonly apiUrl = `${environment.apiUrl}/admin/users`;

    constructor(private http: HttpClient) { }

    // Get all appeals with optional status filter

    getAppeals(status?: AppealStatus): Observable<AdminAppealsResponse> {
        let params = new HttpParams();
        if (status !== undefined && status !== null) {
            params = params.set('status', status.toString());
        }
        return this.http.get<AdminAppealsResponse>(`${this.apiUrl}/appeals`, { params });
    }

    // Review an appeal (approve or reject)

    reviewAppeal(appealId: string, request: ReviewAppealRequest): Observable<ReviewAppealResponse> {
        return this.http.post<ReviewAppealResponse>(
            `${this.apiUrl}/appeals/${appealId}/review`,
            request
        );
    }

    // Unsuspend a user

    unsuspendUser(userId: string, request: UnsuspendUserRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/${userId}/unsuspend`, request);
    }

    // Unban a user

    unbanUser(userId: string, request: UnbanUserRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/${userId}/unban`, request);
    }
}