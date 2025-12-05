import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AdminReportCounts } from './models/adminReportCounts';
import { ReportService } from './services/report-service';
import { AdminUserCounts } from './models/adminUsersCount';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe],
    templateUrl: './admin-dashboard.html',
    styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
    today = new Date();
    private router = inject(Router);
    adminReportCounts!: AdminReportCounts;
    triagedPercent!: number;
    usersCounts: AdminUserCounts = { total: 0, owners: 0, renters: 0 };

    // Track if current admin child route is the root ("/admin")
    isRootAdmin = signal(true);

    constructor(private reportService: ReportService) {
        // Initial check
        this.updateIsRoot();

        // Listen to navigation events efficiently
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            this.updateIsRoot();
        });
    }
    ngOnInit(): void {
        this.reportService.getAdminReportCounts().subscribe({
            next: (data: AdminReportCounts) => { this.adminReportCounts = data, this.triagedPercent = data.total == 0 ? 0 : (data.total - data.pendingCount) / data.total },
            error: (err) => console.log(err),
        })

        this.reportService.getUserCounts().subscribe({
            next: (data: AdminUserCounts) => { this.usersCounts = data },
            error: (err) => console.log(err),
        })
    }

    private updateIsRoot() {
        const url = this.router.url ?? '';
        // This logic ensures Nav hides if URL is '/admin/manageReports'
        this.isRootAdmin.set(url === '/admin' || url === '/admin/');
    }

    get greeting(): string {
        const hour = this.today.getHours();
        if (hour < 12) return 'صباح الخير';
        if (hour < 17) return 'طاب يومك';
        return 'مساء الخير';
    }
}