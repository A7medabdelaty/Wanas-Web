import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ReviewRequest {
    targetType: number; // 0 = User, 1 = Listing
    targetId: string;
    rating: number;
    comment: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private apiUrl = `${environment.apiUrl}/Reviews`;

    constructor(private http: HttpClient) { }

    addReview(review: ReviewRequest): Observable<any> {
        return this.http.post(this.apiUrl, review);
    }

    updateReview(id: number, review: ReviewRequest): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, review);
    }

    deleteReview(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    getListingReviews(listingId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/listing/${listingId}`);
    }

    getAverageRating(listingId: number): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/average-rating/${listingId}`);
    }
}
