import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ListingService {
    private apiUrl = 'https://localhost:7279/api';

    constructor(private http: HttpClient) { }

    generateDescription(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/AI/generate-description`, data);
    }

    addListing(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/listing`, data);
    }
}
