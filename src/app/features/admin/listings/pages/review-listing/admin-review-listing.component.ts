import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModerationStatus } from '../../../../../core/models/moderation';
import Swal from 'sweetalert2';
import { ListingService } from '../../../../listings/services/listing.service';
import { AdminListingService } from '../../../services/admin-listing.service';

@Component({
    selector: 'app-admin-review-listing',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './admin-review-listing.component.html',
    styleUrls: ['./admin-review-listing.component.css']
})
export class AdminReviewListingComponent implements OnInit {
    listing: any = null;
    loading = true;
    showRejectModal = false;
    showFlagModal = false;
    rejectReason = '';
    flagReason = '';
    ModerationStatus = ModerationStatus;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private adminListingService: AdminListingService,
        private listingService: ListingService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.loadListing(id);
        }
    }

    loadListing(id: number): void {
        this.loading = true;
        // We need both listing details and moderation status
        // Ideally backend should return merged DTO, but for now we might need to fetch details
        this.listingService.getListingById(id).subscribe({
            next: (details) => {
                this.listing = details;
                // Fetch moderation details separately if needed, or assume it's in details
                // For now, let's assume getListingById returns moderation info if user is admin
                // Or we call getModerationState
                this.adminListingService.getModerationState(id).subscribe({
                    next: (modState) => {
                        this.listing = { ...this.listing, ...modState };
                        this.loading = false;
                    },
                    error: () => this.loading = false
                });
            },
            error: (err) => {
                console.error('Error loading listing', err);
                this.loading = false;
            }
        });
    }

    approveListing(): void {
        Swal.fire({
            title: 'تأكيد الموافقة',
            text: 'هل أنت متأكد من الموافقة على نشر هذا الإعلان؟',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'نعم، وافق',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#198754'
        }).then((result) => {
            if (result.isConfirmed) {
                this.adminListingService.moderateListing(this.listing.id, ModerationStatus.Approved, '').subscribe({
                    next: () => {
                        Swal.fire('تم!', 'تمت الموافقة على الإعلان بنجاح.', 'success');
                        this.router.navigate(['/adminDashboard/listings/pending']);
                    },
                    error: () => Swal.fire('خطأ', 'حدث خطأ أثناء تنفيذ العملية', 'error')
                });
            }
        });
    }

    rejectListing(): void {
        this.adminListingService.moderateListing(this.listing.id, ModerationStatus.Rejected, this.rejectReason).subscribe({
            next: () => {
                this.showRejectModal = false;
                Swal.fire('تم!', 'تم رفض الإعلان بنجاح.', 'success');
                this.router.navigate(['/adminDashboard/listings/pending']);
            },
            error: () => Swal.fire('خطأ', 'حدث خطأ أثناء تنفيذ العملية', 'error')
        });
    }

    flagListing(): void {
        this.adminListingService.flagListing(this.listing.id, this.flagReason).subscribe({
            next: () => {
                this.showFlagModal = false;
                Swal.fire('تم!', 'تم تحديث حالة البلاغ بنجاح.', 'success');
                this.loadListing(this.listing.id); // Reload to see changes
            },
            error: () => Swal.fire('خطأ', 'حدث خطأ أثناء تنفيذ العملية', 'error')
        });
    }

    getListingImage(listing: any): string {
        if (listing.listingPhotos && listing.listingPhotos.length > 0) {
            const photo = listing.listingPhotos[0];
            return photo.url || photo;
        }
        return '/assets/placeholder-house.jpg';
    }

    getStatusLabel(status: number): string {
        switch (status) {
            case ModerationStatus.Pending: return 'قيد المراجعة';
            case ModerationStatus.Approved: return 'منشور';
            case ModerationStatus.Rejected: return 'مرفوض';
            case ModerationStatus.Removed: return 'محذوف';
            default: return 'غير معروف';
        }
    }

    getStatusBadgeClass(status: number): string {
        switch (status) {
            case ModerationStatus.Pending: return 'badge-pending';
            case ModerationStatus.Approved: return 'badge-approved';
            case ModerationStatus.Rejected: return 'badge-rejected';
            case ModerationStatus.Removed: return 'badge-removed';
            default: return 'badge-unknown';
        }
    }
}
