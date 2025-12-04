import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyticsSummary, ModerationKpi, TrafficPoint } from '../analytics/models/analytics.models';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AdminAnalyticsService {
    private apiUrl = `${environment.apiUrl}/admin/analytics`;

    constructor(private http: HttpClient) { }

    getSummary(date?: string): Observable<AnalyticsSummary> {
        let params = new HttpParams();
        if (date) {
            params = params.set('date', date);
        }
        return this.http.get<AnalyticsSummary>(`${this.apiUrl}/summary`, { params });
    }

    getTraffic(from: string, to: string): Observable<TrafficPoint[]> {
        const params = new HttpParams()
            .set('from', from)
            .set('to', to);
        return this.http.get<TrafficPoint[]>(`${this.apiUrl}/traffic`, { params });
    }

    getModerationKpis(date?: string): Observable<ModerationKpi> {
        let params = new HttpParams();
        if (date) {
            params = params.set('date', date);
        }
        return this.http.get<ModerationKpi>(`${this.apiUrl}/moderation`, { params });
    }
}
