import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { ReservationListItemDto, PaymentStatus } from '../../../../core/models/reservation.model';
import { environment } from '../../../../../environments/environment';
import { SignalRService } from '../../../../features/chat/services/signalr.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-my-reservations',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './my-reservations.html',
    styleUrl: './my-reservations.css'
})
export class MyReservationsComponent implements OnInit, OnDestroy {
    reservations: ReservationListItemDto[] = [];
    loading: boolean = true;
    PaymentStatus = PaymentStatus;
    private destroy$ = new Subject<void>();

    constructor(
        private reservationService: ReservationService,
        private router: Router,
        private signalRService: SignalRService
    ) { }

    ngOnInit() {
        this.fetchReservations();
        this.subscribeToRealTimeUpdates();
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

    private subscribeToRealTimeUpdates() {
        // Subscribe to any reservation changes
        this.signalRService.reservationCreated$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                console.log('⚡ Real-time update: Reservation created');
                this.fetchReservations();
            });

        this.signalRService.reservationUpdated$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                console.log('⚡ Real-time update: Reservation updated');
                this.fetchReservations();
            });

        this.signalRService.reservationCancelled$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                console.log('⚡ Real-time update: Reservation cancelled');
                this.fetchReservations();
            });

        this.signalRService.paymentApproved$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                console.log('⚡ Real-time update: Payment approved');
                this.fetchReservations();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
