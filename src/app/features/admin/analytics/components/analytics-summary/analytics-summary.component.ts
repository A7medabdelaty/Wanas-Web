import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAnalyticsService } from '../../../services/admin-analytics.service';
import { AnalyticsSummary } from '../../models/analytics.models';

@Component({
    selector: 'app-analytics-summary',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './analytics-summary.component.html',
    styleUrls: ['./analytics-summary.component.css']
})
export class AnalyticsSummaryComponent implements OnInit {
    summary: AnalyticsSummary | null = null;
    selectedDate: string = new Date().toISOString().split('T')[0];
    loading = false;

    constructor(private analyticsService: AdminAnalyticsService) { }

    ngOnInit(): void {
        this.loadSummary();
    }

    loadSummary(): void {
        this.loading = true;
        this.analyticsService.getSummary(this.selectedDate).subscribe({
            next: (data) => {
                this.summary = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading summary', err);
                this.loading = false;
            }
        });
    }

    onDateChange(): void {
        this.loadSummary();
    }
}
