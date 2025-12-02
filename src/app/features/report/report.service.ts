import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private apiUrl = 'https://localhost:7279/api/report';

    constructor(private http: HttpClient) { }

    submitReport(formData: FormData): Observable<any> {
        return this.http.post(this.apiUrl, formData);
    }
}
