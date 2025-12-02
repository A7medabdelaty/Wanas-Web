import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
    selector: 'app-forbidden-403',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './forbidden-403.html',
    styleUrl: './forbidden-403.css',
})
export class Forbidden403 {
    private location = inject(Location);
    private router = inject(Router);

    goBack() {
        // If there is navigation history, go back; otherwise navigate home
        if (window.history.length > 1) {
            this.location.back();
        } else {
            this.router.navigate(['/']);
        }
    }
}
