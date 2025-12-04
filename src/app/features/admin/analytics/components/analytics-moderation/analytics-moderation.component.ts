import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAnalyticsService } from '../../../services/admin-analytics.service';
import { ModerationKpi } from '../../models/analytics.models';

@Component({
    selector: 'app-analytics-moderation',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './analytics-moderation.component.html',
    styleUrls: ['./analytics-moderation.component.css']
})
export class AnalyticsModerationComponent implements OnInit {
    kpis: ModerationKpi | null = null;
    selectedDate: string = new Date().toISOString().split('T')[0];
    loading = false;

    constructor(private analyticsService: AdminAnalyticsService) { }

    ngOnInit(): void {
        this.loadKpis();
    }

    loadKpis(): void {
        this.loading = true;
        this.analyticsService.getModerationKpis(this.selectedDate).subscribe({
            next: (data) => {
                this.kpis = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading moderation KPIs', err);
                this.loading = false;
            }
        });
    }

    onDateChange(): void {
        this.loadKpis();
    }
}
