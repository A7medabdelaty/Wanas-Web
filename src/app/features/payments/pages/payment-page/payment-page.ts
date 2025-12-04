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
        }
    }

    ngOnInit() {
        // If no booking data, redirect back
        if (!this.bookingSelection || !this.listing) {
            console.warn('No booking data found, redirecting to home');
            this.router.navigate(['/home']);
        }
    }

    processPayment() {
        if (this.processing || !this.bookingSelection || !this.listing) {
            return;
        }

        this.processing = true;

        // Create reservation request
        const reservationRequest: CreateReservationRequest = {
            listingId: this.bookingSelection.listingId,
            bedIds: this.bookingSelection.selectedBeds,
            startDate: this.bookingSelection.checkInDate.toISOString().split('T')[0],
            durationInDays: this.bookingSelection.duration
        };

        console.log('📋 Creating reservation:', reservationRequest);

        // Step 1: Create reservation
        this.reservationService.createReservation(reservationRequest).subscribe({
            next: (reservationResponse) => {
                console.log('✅ Reservation created:', reservationResponse);

                // Step 2: Pay deposit
                const depositRequest: DepositPaymentRequest = {
                    paymentToken: `mock-token-${Date.now()}`,
                    paymentMethod: 'mock-credit-card',
                    amountPaid: this.bookingSelection!.totalAmount
                };

                console.log('💳 Paying deposit:', depositRequest);

                this.reservationService.payDeposit(reservationResponse.reservationId, depositRequest).subscribe({
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
            },
            error: (error) => {
                console.error('❌ Reservation error:', error);
                this.processing = false;

                Swal.fire({
                    title: 'خطأ في الحجز',
                    text: 'حدث خطأ أثناء إنشاء الحجز. يرجى المحاولة مرة أخرى.',
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
