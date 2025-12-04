import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateReservationRequest, ReservationResponse, DepositPaymentRequest, DepositPaymentResponse, ReservationDto, ReservationListItemDto } from '../../../core/models/reservation.model';
import { environment } from '../../../../environments/environment';

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
    payDeposit(reservationId: number, payment: DepositPaymentRequest): Observable<DepositPaymentResponse> {
        console.log(`[ReservationService] Paying deposit for reservation ${reservationId}:`, payment);
        return this.http.post<DepositPaymentResponse>(
            `${this.apiUrl}/reservation/${reservationId}/deposit`,
            payment
        );
    }

    /**
     * Get all reservations for the logged-in owner
     */
    getOwnerReservations(): Observable<ReservationDto[]> {
        console.log('[ReservationService] Fetching owner reservations');
        return this.http.get<ReservationDto[]>(`${this.apiUrl}/reservation/owner`);
    }

    /**
     * Get all reservations made by the logged-in renter
     */
    getRenterReservations(): Observable<ReservationListItemDto[]> {
        console.log('[ReservationService] Fetching renter reservations');
        return this.http.get<ReservationListItemDto[]>(`${this.apiUrl}/reservation/my`);
    }
}
