import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminListingService } from '../../../services/admin-listing.service';

@Component({
    selector: 'app-admin-pending-listings',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './admin-pending-listings.component.html'
})
export class AdminPendingListingsComponent implements OnInit {
    pendingListings: any[] = [];
    loading = true;

    constructor(private adminListingService: AdminListingService) { }

    ngOnInit(): void {
        this.loadPendingListings();
    }

    loadPendingListings(): void {
        this.loading = true;
        this.adminListingService.getPendingListings().subscribe({
            next: (data) => {
                this.pendingListings = data;
                console.log('Pending Listings:', data);
                // Log first item structure to debug owner info
                if (data.length > 0) {
                    console.log('First listing structure:', JSON.stringify(data[0], null, 2));
                }
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading pending listings', err);
                this.loading = false;
            }
        });
    }

    getListingImage(listing: any): string {
        if (listing.listingPhotos && listing.listingPhotos.length > 0) {
            const photo = listing.listingPhotos[0];
            return photo.url || photo;
        }
        return '/assets/placeholder-house.jpg';
    }
}
