import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingSelection } from '../../../listings/models/booking';
import { ListingDetailsDto } from '../../../listings/models/listing';
import { ReservationService } from '../../../reservations/services/reservation.service';
import { CreateReservationRequest, DepositPaymentRequest } from '../../../../core/models/reservation.model';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-payment-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payment-page.html',
    styleUrl: './payment-page.css'
})
export class PaymentPage implements OnInit {
    bookingSelection?: BookingSelection;
    listing?: ListingDetailsDto;
    reservationId?: number;
    processing: boolean = false;

    constructor(
        private router: Router,
        private reservationService: ReservationService
    ) {
        // Get booking data from navigation state
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state) {
            this.bookingSelection = navigation.extras.state['bookingSelection'];
            this.listing = navigation.extras.state['listing'];
            this.reservationId = navigation.extras.state['reservationId'];
        }
    }

    ngOnInit() {
        // If no booking data or reservation ID, redirect back
        if (!this.bookingSelection || !this.listing || !this.reservationId) {
            console.warn('No booking data or reservation ID found, redirecting to home');
            this.router.navigate(['/home']);
        }
    }

    processPayment() {
        if (this.processing || !this.bookingSelection || !this.reservationId) {
            return;
        }

        this.processing = true;

        // Create deposit payment request
        const depositRequest: DepositPaymentRequest = {
            paymentToken: `mock-token-${Date.now()}`,
            paymentMethod: 'mock-credit-card',
            amountPaid: this.bookingSelection.totalAmount
        };

        console.log('💳 Paying deposit for reservation', this.reservationId, ':', depositRequest);

        // Pay deposit for the existing reservation
        this.reservationService.payDeposit(this.reservationId, depositRequest).subscribe({
            next: (paymentResponse) => {
                console.log('✅ Payment successful:', paymentResponse);
                this.processing = false;

                Swal.fire({
                    title: 'تم تأكيد الحجز!',
                    text: 'تم تأكيد حجزك بنجاح. سيتم الاتصال بك قريباً.',
                    icon: 'success',
                    confirmButtonText: 'حسناً',
                    confirmButtonColor: '#10b981'
                }).then(() => {
                    this.router.navigate(['/listings', this.listing!.id]);
                });
            },
            error: (error) => {
                console.error('❌ Payment error:', error);
                this.processing = false;

                Swal.fire({
                    title: 'خطأ في الدفع',
                    text: 'حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.',
                    icon: 'error',
                    confirmButtonText: 'حسناً',
                    confirmButtonColor: '#dc3545'
                });
            }
        });
    }

    cancel() {
        if (this.listing) {
            this.router.navigate(['/listings', this.listing.id, 'book']);
        } else {
            this.router.navigate(['/home']);
        }
    }
}
