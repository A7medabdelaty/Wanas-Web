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

    get timeDisplay(): { value: number, label: string } {
        if (!this.kpis || this.kpis.avgApprovalTimeHours === 0) {
            return { value: 0, label: 'ساعة' };
        }

        const hours = this.kpis.avgApprovalTimeHours;

        // If less than 1 hour, show in minutes
        if (hours < 1) {
            const minutes = Math.ceil(hours * 60);
            return {
                value: minutes,
                label: this.getMinuteLabel(minutes)
            };
        }

        // Otherwise show in hours
        return {
            value: hours,
            label: this.getHourLabel(Math.floor(hours))
        };
    }

    private getHourLabel(count: number): string {
        if (count === 1) return 'ساعة';
        if (count === 2) return 'ساعة';
        if (count >= 3 && count <= 10) return 'ساعات';
        return 'ساعة';
    }

    private getMinuteLabel(count: number): string {
        if (count === 1) return 'دقيقة';
        if (count === 2) return 'دقيقة';
        if (count >= 3 && count <= 10) return 'دقائق';
        return 'دقيقة';
    }
}
