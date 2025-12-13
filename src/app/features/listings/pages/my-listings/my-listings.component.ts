import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { AuthService } from '../../../../core/services/auth';
import { ModerationStatus } from '../../../../core/models/moderation';

@Component({
    selector: 'app-my-listings',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './my-listings.component.html',
    styleUrls: ['./my-listings.component.css']
})
export class MyListingsComponent implements OnInit {
    listings: any[] = [];
    loading = true;
    selectedListing: any = null;
    ModerationStatus = ModerationStatus;

    constructor(
        private listingService: ListingService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadListings();
    }

    loadListings(): void {
        const user = this.authService.getUserInfo();
        if (!user || !user.id) {
            this.loading = false;
            return;
        }

        this.loading = true;
        this.listingService.getListingsByUserId(user.id).subscribe({
            next: (data) => {
                this.listings = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading listings', err);
                this.loading = false;
            }
        });
    }

    getStatusLabel(listing: any): string {
        if (!listing.isActive && listing.moderationStatus === ModerationStatus.Approved) {
            return 'غير مفعل';
        }
        switch (listing.moderationStatus) {
            case ModerationStatus.Pending: return 'قيد المراجعة';
            case ModerationStatus.Approved: return 'منشور';
            case ModerationStatus.Rejected: return 'مرفوض';
            case ModerationStatus.Removed: return 'محذوف';
            default: return 'غير معروف';
        }
    }

    getStatusBadgeClass(listing: any): string {
        if (!listing.isActive && listing.moderationStatus === ModerationStatus.Approved) {
            return 'badge-inactive';
        }
        switch (listing.moderationStatus) {
            case ModerationStatus.Pending: return 'badge-pending';
            case ModerationStatus.Approved: return 'badge-approved';
            case ModerationStatus.Rejected: return 'badge-rejected';
            case ModerationStatus.Removed: return 'badge-removed';
            default: return 'badge-unknown';
        }
    }

    getListingImage(listing: any): string {
        if (listing.listingPhotos && listing.listingPhotos.length > 0) {
            const photo = listing.listingPhotos[0];
            return this.getSafeImageUrl(photo.url || photo);
        }
        return 'https://placehold.co/600x400?text=No+Image';
    }

    getSafeImageUrl(url: string | undefined | null): string {
        if (!url) {
            return 'https://placehold.co/600x400?text=No+Image';
        }

        // If URL is already absolute
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        // If URL is relative
        const baseUrl = 'https://localhost:7279';
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${path}`;
    }

    showModerationDetails(listing: any): void {
        if (listing.moderationStatus === ModerationStatus.Rejected ||
            listing.moderationStatus === ModerationStatus.Removed ||
            listing.isFlagged) {
            this.selectedListing = listing;
        }
    }

    deleteListing(id: number): void {
        if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
            this.listingService.deleteListing(id).subscribe({
                next: () => {
                    this.listings = this.listings.filter(l => l.id !== id);
                },
                error: (err) => console.error('Error deleting listing', err)
            });
        }
    }
}
