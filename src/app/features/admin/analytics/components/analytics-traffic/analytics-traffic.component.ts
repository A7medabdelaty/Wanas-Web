import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAnalyticsService } from '../../../services/admin-analytics.service';
import { TrafficPoint } from '../../models/analytics.models';

@Component({
    selector: 'app-analytics-traffic',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './analytics-traffic.component.html',
    styleUrls: ['./analytics-traffic.component.css']
})
export class AnalyticsTrafficComponent implements OnInit {
    trafficData: TrafficPoint[] = [];
    fromDate: string = '';
    toDate: string = '';
    loading = false;

    constructor(private analyticsService: AdminAnalyticsService) {
        const today = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(today.getDate() - 7);

        this.toDate = today.toISOString().split('T')[0];
        this.fromDate = lastWeek.toISOString().split('T')[0];
    }

    ngOnInit(): void {
        this.loadTraffic();
    }

    loadTraffic(): void {
        this.loading = true;
        console.log('Loading traffic from:', this.fromDate, 'to:', this.toDate);
        this.analyticsService.getTraffic(this.fromDate, this.toDate).subscribe({
            next: (data) => {
                console.log('Traffic data received:', data);
                this.trafficData = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading traffic data', err);
                this.loading = false;
            }
        });
    }

    onDateChange(): void {
        console.log('Date changed:', this.fromDate, this.toDate);
        if (this.fromDate && this.toDate) {
            this.loadTraffic();
        }
    }

    getMethodClass(method: string): string {
        switch (method.toUpperCase()) {
            case 'GET': return 'bg-info text-dark';
            case 'POST': return 'bg-success';
            case 'PUT': return 'bg-warning text-dark';
            case 'DELETE': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }
}
