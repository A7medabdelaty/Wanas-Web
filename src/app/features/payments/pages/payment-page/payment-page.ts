import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingSelection } from '../../../listings/models/booking';
import { ListingDetailsDto } from '../../../listings/models/listing';

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

    constructor(private router: Router) {
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
        if (this.processing) {
            return;
        }

        this.processing = true;

        // Mock payment processing
        console.log('Processing payment for booking:', this.bookingSelection);

        // Simulate API call delay
        setTimeout(() => {
            // Show success message
            alert('تم تأكيد الحجز بنجاح! سيتم الاتصال بك قريباً.');

            // Navigate back to listing details or home
            if (this.listing) {
                this.router.navigate(['/listings', this.listing.id]);
            } else {
                this.router.navigate(['/home']);
            }
        }, 1500);

        // TODO: Replace with actual API call when backend endpoint is ready
        // this.paymentService.processBookingPayment(this.bookingSelection).subscribe({
        //   next: (response) => {
        //     this.processing = false;
        //     // Handle success
        //   },
        //   error: (error) => {
        //     this.processing = false;
        //     // Handle error
        //   }
        // });
    }

    cancel() {
        if (this.listing) {
            this.router.navigate(['/listings', this.listing.id, 'book']);
        } else {
            this.router.navigate(['/home']);
        }
    }
}
