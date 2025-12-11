import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';   // ✅ REQUIRED
import { Router, RouterLink } from '@angular/router';
import { BookingSelection } from '../../../listings/models/booking';
import { ListingDetailsDto } from '../../../listings/models/listing';
import { ReservationService } from '../../../reservations/services/reservation.service';
import { DepositPaymentRequest } from '../../../../core/models/reservation.model';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../core/services/auth';
import { VerificationService } from '../../../../core/services/verification.service.ts';

@Component({
    selector: 'app-payment-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink
    ],
    templateUrl: './payment-page.html',
    styleUrl: './payment-page.css'
})
export class PaymentPage implements OnInit {

    bookingSelection?: BookingSelection;
    listing?: ListingDetailsDto;
    reservationId?: number;
    processing = false;
    showVerificationCta = false;
    cardNumber: string = '';
    cardholder: string = '';
    expiry: string = '';
    cvv: string = '';

    isVerified: boolean = false;
    constructor(
        private router: Router,
        private reservationService: ReservationService,
        private verificationService: VerificationService
    ) {
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state) {
            this.bookingSelection = navigation.extras.state['bookingSelection'];
            this.listing = navigation.extras.state['listing'];
            this.reservationId = navigation.extras.state['reservationId'];
        }
    }

    ngOnInit() {
        if (!this.bookingSelection || !this.listing || !this.reservationId) {
            console.warn('No booking data or reservation ID found, redirecting to home');
            this.router.navigate(['/home']);
        }
         this.verificationService.getStatus().subscribe(
      {
        next: (status) => {
          this.isVerified = status.isVerified;
          console.log(status.isVerified);
        },
        error: (error) => {
          console.error('Error fetching verification status:', error);
        }
      }
    );
}

    processPayment() {
        if (this.processing || !this.bookingSelection || !this.reservationId) return;

        this.processing = true;

        const depositRequest: DepositPaymentRequest = {
            paymentToken: `mock-token-${this.cardNumber}-${Date.now()}`,
            paymentMethod: 'mock-credit-card',
            amountPaid: this.bookingSelection.totalAmount
        };

        this.reservationService.payDeposit(this.reservationId, depositRequest).subscribe({
            next: () => {
                this.processing = false;

                Swal.fire({
                    title: 'تم تأكيد الحجز!',
                    text: 'تم تأكيد حجزك بنجاح.',
                    icon: 'success',
                    confirmButtonText: 'حسناً',
                    confirmButtonColor: '#10b981'
                }).then(() => {
                    this.router.navigate(['/listings', this.listing!.id]);
                });
            },
            error: () => {
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
