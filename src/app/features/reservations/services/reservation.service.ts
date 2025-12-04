import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    CreateReservationRequest,
    ReservationResponse,
    DepositPaymentRequest,
    DepositPaymentResponse
} from '../../../core/models/reservation.model';

@Injectable({
    providedIn: 'root'
})
export class ReservationService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    /**
     * Create a new reservation
     */
    createReservation(request: CreateReservationRequest): Observable<ReservationResponse> {
        console.log('[ReservationService] Creating reservation:', request);
        return this.http.post<ReservationResponse>(`${this.apiUrl}/reservation`, request);
    }

    /**
     * Pay deposit for a reservation
     */
    payDeposit(
        reservationId: number,
        payment: DepositPaymentRequest
    ): Observable<DepositPaymentResponse> {
        console.log(`[ReservationService] Paying deposit for reservation ${reservationId}:`, payment);
        return this.http.post<DepositPaymentResponse>(
            `${this.apiUrl}/reservation/${reservationId}/deposit`,
            payment
        );
    }
}
