import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

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
    // Root shows hero + stats; children show compact layout without scroll.
    isRootAdmin = signal(true);

    constructor() {
        // Initialize and react on navigation changes
        this.updateIsRoot();
        this.router.events.subscribe(() => this.updateIsRoot());
    }

    private updateIsRoot() {
        const url = this.router.url ?? '';
        // Consider '/admin' or '/admin/' as root. Any deeper path is a child.
        this.isRootAdmin.set(url === '/admin' || url === '/admin/');
    }
}
