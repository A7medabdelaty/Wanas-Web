import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { ReservationDto, PaymentStatus } from '../../../../core/models/reservation.model';
import { SignalRService } from '../../../../features/chat/services/signalr.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-owner-reservations',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './owner-reservations.html',
    styleUrl: './owner-reservations.css'
})
export class OwnerReservationsComponent implements OnInit, OnDestroy {
    reservations: ReservationDto[] = [];
    loading: boolean = true;
    PaymentStatus = PaymentStatus; // Make enum available in template
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

    private subscribeToRealTimeUpdates() {
        // Subscribe to any reservation changes
        this.signalRService.reservationCreated$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                console.log('⚡ Real-time update: New reservation created');
                // Could optimize by just adding to list, but refetch is safer for now
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
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
