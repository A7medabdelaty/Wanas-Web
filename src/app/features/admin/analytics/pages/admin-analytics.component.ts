import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsSummaryComponent } from '../components/analytics-summary/analytics-summary.component';
import { AnalyticsTrafficComponent } from '../components/analytics-traffic/analytics-traffic.component';
import { AnalyticsModerationComponent } from '../components/analytics-moderation/analytics-moderation.component';

@Component({
    selector: 'app-admin-analytics',
    standalone: true,
    imports: [
        CommonModule,
        AnalyticsSummaryComponent,
        AnalyticsTrafficComponent,
        AnalyticsModerationComponent
    ],
    templateUrl: './admin-analytics.component.html',
    styleUrls: ['./admin-analytics.component.css']
})
export class AdminAnalyticsComponent {
    now = new Date();
}
