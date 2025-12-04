import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe],
    templateUrl: './admin-dashboard.html',
    styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {
    today = new Date();
    private router = inject(Router);

    // Track if current admin child route is the root ("/admin")
    isRootAdmin = signal(true);

    constructor() {
        // Initial check
        this.updateIsRoot();

        // Listen to navigation events efficiently
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            this.updateIsRoot();
        });
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