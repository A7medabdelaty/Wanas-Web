import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApprovalStatusDto, PaymentApprovalRequest } from '../../../core/models/chat.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
    providedIn: 'root'
})
export class BookingApprovalService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl + '/BookingApproval';

    /**
     * Get approval status for a user regarding a specific listing
     * GET /BookingApproval/status/{listingId}/{userId}
     */
    getApprovalStatus(listingId: number, userId: string): Observable<ApprovalStatusDto> {
        return this.http.get<ApiResponse<ApprovalStatusDto>>(`${this.apiUrl}/status/${listingId}/${userId}`)
            .pipe(map(response => response.data));
    }

    /**
     * Approve user to join the group chat
     * POST /BookingApproval/{listingId}/approve-to-group/{userId}
     */
    approveToGroup(listingId: number, userId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${listingId}/approve-to-group/${userId}`, {});
    }

    /**
     * Approve user to start payment process
     * POST /BookingApproval/approve-payment
     */
    approvePayment(request: PaymentApprovalRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/approve-payment`, request);
    }
}
