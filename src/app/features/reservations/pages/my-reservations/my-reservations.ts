import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { ReservationListItemDto, PaymentStatus } from '../../../../core/models/reservation.model';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-my-reservations',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './my-reservations.html',
    styleUrl: './my-reservations.css'
})
export class MyReservationsComponent implements OnInit {
    reservations: ReservationListItemDto[] = [];
    loading: boolean = true;
    PaymentStatus = PaymentStatus;

    constructor(
        private reservationService: ReservationService,
        private router: Router
    ) { }

    ngOnInit() {
        this.fetchReservations();
    }

    fetchReservations() {
        this.loading = true;
        this.reservationService.getRenterReservations().subscribe({
            next: (reservations) => {
                this.reservations = reservations;
                this.loading = false;
                console.log('📋 Renter reservations:', reservations);
            },
            error: (error) => {
                console.error('❌ Error fetching reservations:', error);
                this.loading = false;
            }
        });
    }

    getPaymentStatusText(status: PaymentStatus): string {
        switch (status) {
            case PaymentStatus.Pending:
                return 'قيد الانتظار';
            case PaymentStatus.Paid:
                return 'مدفوع';
            case PaymentStatus.Failed:
                return 'فشل';
            case PaymentStatus.Refunded:
                return 'مسترجع';
            default:
                return 'غير معروف';
        }
    }

    getPaymentStatusClass(status: PaymentStatus): string {
        switch (status) {
            case PaymentStatus.Pending:
                return 'status-pending';
            case PaymentStatus.Paid:
                return 'status-paid';
            case PaymentStatus.Failed:
                return 'status-failed';
            case PaymentStatus.Refunded:
                return 'status-refunded';
            default:
                return '';
        }
    }

    getCoverPhotoUrl(url: string): string {
        if (!url) return '/assets/placeholder.jpg';
        return url.startsWith('http') ? url : `${environment.apiUrl}${url}`;
    }

    viewListing(listingId: number) {
        this.router.navigate(['/listings', listingId]);
    }

    completePayment(reservation: ReservationListItemDto) {
        // Navigate to payment page with reservation data
        this.router.navigate(['/payment'], {
            state: {
                reservationId: reservation.id,
                totalAmount: reservation.totalPrice,
                listingTitle: reservation.listingTitle
            }
        });
    }

    isPending(status: PaymentStatus): boolean {
        return status === PaymentStatus.Pending;
    }

    navigateToSearch() {
        this.router.navigate(['/search']);
    }
}
