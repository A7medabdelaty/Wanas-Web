import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ListingService {
    private apiUrl = '/api';

    constructor(private http: HttpClient) { }

    generateDescription(data: any): Observable<any> {
        console.log(`[ListingService] Generating description. URL: ${this.apiUrl}/AI/generate-description`, data);
        return this.http.post(`${this.apiUrl}/AI/generate-description`, data, { responseType: 'text' });
    }

    addListing(data: any): Observable<any> {
        console.log(`[ListingService] Adding listing. URL: ${this.apiUrl}/listing`, data);
        return this.http.post(`${this.apiUrl}/listing`, data);
    }
}
