import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { ReservationDto, PaymentStatus } from '../../../../core/models/reservation.model';

@Component({
    selector: 'app-owner-reservations',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './owner-reservations.html',
    styleUrl: './owner-reservations.css'
})
export class OwnerReservationsComponent implements OnInit {
    reservations: ReservationDto[] = [];
    loading: boolean = true;
    PaymentStatus = PaymentStatus; // Make enum available in template

    constructor(
        private reservationService: ReservationService,
        private router: Router
    ) { }

    ngOnInit() {
        this.fetchReservations();
    }

    fetchReservations() {
        this.loading = true;
        this.reservationService.getOwnerReservations().subscribe({
            next: (reservations) => {
                this.reservations = reservations;
                this.loading = false;
                console.log('📋 Owner reservations:', reservations);
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

    viewListing(listingId: number) {
        this.router.navigate(['/listings', listingId]);
    }
}
