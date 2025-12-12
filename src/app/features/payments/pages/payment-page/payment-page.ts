import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { BookingSelection } from '../../../listings/models/booking';
import { ListingDetailsDto } from '../../../listings/models/listing';
import { ReservationService } from '../../../reservations/services/reservation.service';
import { DepositPaymentRequest } from '../../../../core/models/reservation.model';
import Swal from 'sweetalert2';
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
    errors: { [key: string]: string } = {};

    isVerified: boolean = false;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
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
        // Check if coming from existing reservation (query params)
        this.route.queryParams.subscribe(params => {
            if (params['reservationId'] && params['from'] === 'my-reservations') {
                this.reservationId = +params['reservationId'];
                // For existing reservations, we don't need bookingSelection or listing
                // The payment will be processed directly
                return;
            }
        });

        // If not from existing reservation, check for new booking data
        if (!this.reservationId && (!this.bookingSelection || !this.listing)) {
            console.warn('No booking data or reservation ID found, redirecting to home');
            this.router.navigate(['/home']);
            return;
        }

        this.verificationService.getStatus().subscribe({
            next: (status) => {
                this.isVerified = status.isVerified;
            },
            error: (error) => {
                console.error('Error fetching verification status:', error);
            }
        });
    }

    validateCardNumber() {
        if (!this.cardNumber) {
            this.errors['cardNumber'] = 'رقم البطاقة مطلوب';
            return;
        }

        const rawNumber = this.cardNumber.replace(/\s/g, '');

        if (!/^\d+$/.test(rawNumber)) {
            this.errors['cardNumber'] = 'رقم البطاقة يجب أن يحتوي على أرقام فقط';
        } else if (rawNumber.length !== 16) {
            this.errors['cardNumber'] = 'رقم البطاقة يجب أن يتكون من 16 رقم';
        } else {
            delete this.errors['cardNumber'];
        }
    }

    validateName() {
        if (!this.cardholder) {
            this.errors['cardholder'] = 'اسم صاحب البطاقة مطلوب';
        } else if (!/^[a-zA-Z\s]+$/.test(this.cardholder)) {
            this.errors['cardholder'] = 'الاسم يجب أن يحتوي على حروف إنجليزية فقط';
        } else if (this.cardholder.length === 50) {
            this.errors['cardholder'] = 'وصلت للحد الأقصى لطول الاسم (50 حرف)';
        } else {
            delete this.errors['cardholder'];
        }
    }

    validateCVV() {
        if (!this.cvv) {
            this.errors['cvv'] = 'رمز CVV مطلوب';
        } else if (!/^\d{3}$/.test(this.cvv)) {
            this.errors['cvv'] = 'رمز CVV يجب أن يكون 3 أرقام بالضبط';
        } else {
            delete this.errors['cvv'];
        }
    }

    validateDate() {
        if (!this.expiry) {
            this.errors['expiry'] = 'تاريخ الانتهاء مطلوب';
            return;
        }

        const datePattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!datePattern.test(this.expiry)) {
            this.errors['expiry'] = 'صيغة التاريخ غير صحيحة (MM/YY)';
            return;
        }

        const [monthStr, yearStr] = this.expiry.split('/');
        const month = parseInt(monthStr, 10);
        const year = parseInt('20' + yearStr, 10); // Assuming 20xx

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 0-indexed

        if (year < currentYear) {
            this.errors['expiry'] = 'تاريخ الانتهاء منتهي الصلاحية';
        } else if (year === currentYear && month < currentMonth) {
            this.errors['expiry'] = 'تاريخ الانتهاء منتهي الصلاحية';
        } else {
            delete this.errors['expiry'];
        }
    }

    onCardNumberInput(event: any) {
        const input = event.target;
        const value = input.value;

        // Check for non-numeric characters (ignoring spaces)
        if (/[^0-9\s]/.test(value)) {
            this.errors['cardNumber'] = 'رقم البطاقة يجب أن يحتوي على أرقام فقط';
        } else {
            if (this.errors['cardNumber'] && this.errors['cardNumber'].includes('أرقام فقط')) {
                delete this.errors['cardNumber'];
            }
        }

        // Strip all non-digits
        let rawNumbers = value.replace(/\D/g, '');

        // Truncate to 16 digits
        if (rawNumbers.length > 16) {
            rawNumbers = rawNumbers.substring(0, 16);
        }

        // Add spaces every 4 digits
        const formatted = rawNumbers.match(/.{1,4}/g)?.join(' ') || rawNumbers;

        if (value !== formatted) {
            input.value = formatted;
            this.cardNumber = formatted;
        } else {
            this.cardNumber = formatted;
        }
    }

    onCvvInput(event: any) {
        const input = event.target;
        const value = input.value;

        // Check for non-numeric characters before stripping
        if (/[^0-9]/.test(value)) {
            this.errors['cvv'] = 'رمز CVV يجب أن يحتوي على أرقام فقط';
        } else {
            // If valid number is typed, clear the error if it was "numbers only" type error
            if (this.errors['cvv'] && this.errors['cvv'].includes('أرقام فقط')) {
                delete this.errors['cvv'];
            }
        }

        const sanitizedValue = value.replace(/[^0-9]/g, '');

        if (value !== sanitizedValue) {
            input.value = sanitizedValue;
            this.cvv = sanitizedValue;
        }
    }

    onNameInput(event: any) {
        if (this.cardholder.length === 50) {
            this.errors['cardholder'] = 'وصلت للحد الأقصى لطول الاسم (50 حرف)';
        } else {
            if (this.errors['cardholder'] === 'وصلت للحد الأقصى لطول الاسم (50 حرف)') {
                delete this.errors['cardholder'];
            }
        }
    }

    onDateInput(event: any) {
        const input = event.target;
        const value = input.value;
        const isBackspace = event.inputType === 'deleteContentBackward';

        // Remove non-digits
        let cleanValue = value.replace(/\D/g, '');

        // Limit to 4 digits (MMYY)
        if (cleanValue.length > 4) {
            cleanValue = cleanValue.substring(0, 4);
        }

        let formattedValue = cleanValue;

        if (cleanValue.length >= 2) {
            // If we have 2 or more digits...

            // If exactly 2 digits and NOT deleting, add slash
            if (cleanValue.length === 2 && !isBackspace) {
                formattedValue = cleanValue + '/';
            }
            // If more than 2 digits, always ensure slash is there
            else if (cleanValue.length > 2) {
                formattedValue = cleanValue.substring(0, 2) + '/' + cleanValue.substring(2);
            }
        }

        if (value !== formattedValue) {
            input.value = formattedValue;
            this.expiry = formattedValue;
        } else {
            this.expiry = value;
        }
    }

    validateAll(): boolean {
        this.validateCardNumber();
        this.validateName();
        this.validateCVV();
        this.validateDate();
        return Object.keys(this.errors).length === 0;
    }

    processPayment() {
        if (this.processing || !this.reservationId) return;

        if (!this.validateAll()) {
            const errorMessages = Object.values(this.errors);
            if (errorMessages.some(msg => msg.includes('مطلوب'))) {
                Swal.fire({
                    title: 'بيانات غير مكتملة',
                    text: '.يرجى ملء جميع البيانات المطلوبة للمتابعة',
                    icon: 'warning',
                    confirmButtonText: 'حسناً',
                    confirmButtonColor: '#f59e0b'
                });
            } else {
                Swal.fire({
                    title: 'بيانات غير صحيحة',
                    text: 'يرجى التحقق من صحة البيانات المدخلة.',
                    icon: 'error',
                    confirmButtonText: 'حسناً',
                    confirmButtonColor: '#dc3545'
                });
            }
            return;
        }

        this.processing = true;

        const depositRequest: DepositPaymentRequest = {
            paymentToken: `mock-token-${this.cardNumber}-${Date.now()}`,
            paymentMethod: 'mock-credit-card',
            amountPaid: this.bookingSelection?.totalAmount || 0
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
                    // Navigate back to my-reservations if coming from there
                    if (this.listing) {
                        this.router.navigate(['/listings', this.listing.id]);
                    } else {
                        this.router.navigate(['/renter/requests']);
                    }
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
