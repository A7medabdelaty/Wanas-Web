import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ListingModerationDto } from '../../../core/models/moderation';

@Injectable({
    providedIn: 'root'
})
export class AdminListingService {
    private apiUrl = `${environment.apiUrl}/admin/listings/moderation`;

    constructor(private http: HttpClient) { }

    getPendingListings(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/pending`).pipe(
            map(response => response.listings)
        );
    }

    getModerationState(id: number): Observable<ListingModerationDto> {
        return this.http.get<ListingModerationDto>(`${this.apiUrl}/${id}`);
    }

    moderateListing(id: number, newStatus: number, note: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/moderate`, { newStatus, note });
    }

    flagListing(id: number, reason: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/flag`, { reason });
    }
}
