import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { ListingDetailsDto, ListingRoomDto } from '../../models/listing';
import { RoomDto, BedDto, BookingSelection, BookingBreakdown } from '../../models/booking';
import { ReservationService } from '../../../reservations/services/reservation.service';
import { CreateReservationRequest } from '../../../../core/models/reservation.model';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-booking-selection',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './booking-selection.html',
    styleUrl: './booking-selection.css'
})
export class BookingSelectionComponent implements OnInit {
    listing?: ListingDetailsDto;
    rooms: RoomDto[] = [];
    selectedBedIds: Set<number> = new Set();
    loading: boolean = true;

    // Duration and date selection
    selectedDuration: 15 | 30 = 30;  // Default to full month
    checkInDate: Date | null = null;
    checkOutDate: Date | null = null;
    minCheckInDate: string = '';  // Will be set in ngOnInit

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private listingService: ListingService,
        private reservationService: ReservationService
    ) { }

    ngOnInit() {
        // Set minimum check-in date to today
        const today = new Date();
        this.minCheckInDate = today.toISOString().split('T')[0];

        const idParam = this.route.snapshot.paramMap.get('id');
        const listingId = idParam ? Number(idParam) : NaN;

        if (!isNaN(listingId)) {
            this.fetchListingAndRooms(listingId);
        } else {
            console.error('Invalid listing ID');
            this.router.navigate(['/home']);
        }
    }

    fetchListingAndRooms(listingId: number) {
        this.loading = true;

        // Fetch listing details
        this.listingService.getListingById(listingId).subscribe({
            next: (listing) => {
                this.listing = listing;
                console.log('📦 Listing data received:', listing);

                // Map backend rooms to display format
                if (listing.rooms && listing.rooms.length > 0) {
                    this.rooms = this.mapBackendRoomsToDisplayRooms(listing.rooms);
                } else {
                    console.warn('⚠️ No rooms data in listing response');
                    this.rooms = [];
                }

                this.loading = false;
            },
            error: (error) => {
                console.error('Error fetching listing:', error);
                this.loading = false;
                Swal.fire({
                    title: 'خطأ',
                    text: 'حدث خطأ أثناء تحميل بيانات الإعلان',
                    icon: 'error',
                    confirmButtonText: 'حسناً',
                    confirmButtonColor: '#dc3545'
                }).then(() => {
                    this.router.navigate(['/home']);
                });
            }
        });
    }

    mapBackendRoomsToDisplayRooms(backendRooms: ListingRoomDto[]): RoomDto[] {
        const displayRooms: RoomDto[] = [];
        let fallbackBedId = 10000; // High number to avoid conflicts with real IDs

        backendRooms.forEach((backendRoom) => {
            const beds: BedDto[] = [];

            // Create display beds from backend bed data
            for (let i = 0; i < backendRoom.bedsCount; i++) {
                const backendBed = backendRoom.beds[i];

                let bedId: number;

                // Check if bed has a valid ID
                if (backendBed?.bedId) {
                    bedId = backendBed.bedId;
                } else {
                    // Fallback: generate unique ID and warn
                    bedId = fallbackBedId++;
                    console.warn(`⚠️ Bed ${i} in room ${backendRoom.roomId} missing bedId, using fallback ID: ${bedId}`);
                }

                const isAvailable = backendBed?.isAvailable ?? false;

                beds.push({
                    id: bedId,
                    bedNumber: `سرير ${i + 1}`,
                    roomId: backendRoom.roomId,
                    isAvailable: isAvailable,
                    bedPrice: backendRoom.pricePerBed
                });
            }

            // Calculate room price as pricePerBed * bedsCount
            const roomPrice = backendRoom.pricePerBed * backendRoom.bedsCount;

            displayRooms.push({
                id: backendRoom.roomId,
                roomNumber: `غرفة ${backendRoom.roomNumber}`,
                beds: beds,
                roomPrice: roomPrice,
                bedsCount: backendRoom.bedsCount,
                availableBeds: backendRoom.availableBeds,
                pricePerBed: backendRoom.pricePerBed,
                hasAirConditioner: backendRoom.hasAirConditioner,
                hasFan: backendRoom.hasFan
            });
        });

        console.log('🏠 Mapped display rooms:', displayRooms);

        // Validate no duplicate bed IDs
        const allBedIds = displayRooms.flatMap(room => room.beds.map(bed => bed.id));
        const uniqueBedIds = new Set(allBedIds);
        if (allBedIds.length !== uniqueBedIds.size) {
            console.warn('⚠️ WARNING: Duplicate bed IDs detected!', allBedIds);
        }

        return displayRooms;
    }

    toggleBed(bedId: number) {
        if (this.selectedBedIds.has(bedId)) {
            this.selectedBedIds.delete(bedId);
        } else {
            this.selectedBedIds.add(bedId);
        }
        console.log('Selected bed IDs:', Array.from(this.selectedBedIds));
    }

    isBedSelected(bedId: number): boolean {
        return this.selectedBedIds.has(bedId);
    }

    isRoomFullySelected(room: RoomDto): boolean {
        return room.beds.every(bed => this.selectedBedIds.has(bed.id));
    }

    getSelectedBedsInRoom(room: RoomDto): number {
        return room.beds.filter(bed => this.selectedBedIds.has(bed.id)).length;
    }

    /**
     * Handle duration change
     */
    onDurationChange(duration: 15 | 30) {
        this.selectedDuration = duration;
        if (this.checkInDate) {
            this.calculateCheckOutDate();
        }
    }

    /**
     * Handle check-in date change
     */
    onCheckInChange(event: any) {
        const dateValue = event.target?.value;
        if (dateValue) {
            this.checkInDate = new Date(dateValue);
            this.calculateCheckOutDate();
        }
    }

    /**
     * Calculate check-out date based on check-in and duration
     */
    calculateCheckOutDate() {
        if (!this.checkInDate) return;

        const checkOut = new Date(this.checkInDate);
        checkOut.setDate(checkOut.getDate() + this.selectedDuration);
        this.checkOutDate = checkOut;

        console.log('📅 Dates calculated:', {
            checkIn: this.checkInDate,
            checkOut: this.checkOutDate,
            duration: this.selectedDuration
        });
    }

    /**
     * Calculate price based on duration
     */
    calculatePrice(monthlyPrice: number): number {
        return this.selectedDuration === 15
            ? monthlyPrice * 0.5
            : monthlyPrice;
    }

    /**
     * Check if all available beds across all rooms are selected
     */
    isFullListingSelected(): boolean {
        if (!this.listing) return false;

        // Get all available beds
        const allAvailableBeds = this.rooms.flatMap(room =>
            room.beds.filter(bed => bed.isAvailable)
        );

        // Check if all available beds are selected
        return allAvailableBeds.every(bed => this.selectedBedIds.has(bed.id));
    }

    /**
     * Calculate total price with duration-based multiplier
     * - 15 days: 50% of monthly price
     * - 30 days: 100% of monthly price
     * - If all available beds selected, use listing monthly price
     */
    calculateTotal(): number {
        if (!this.listing) return 0;

        const multiplier = this.selectedDuration === 15 ? 0.5 : 1.0;

        // Check if full listing is selected
        if (this.isFullListingSelected() && this.selectedBedIds.size > 0) {
            const fullListingPrice = this.listing.monthlyPrice * multiplier;
            console.log(`💰 Full listing selected - applying ${this.selectedDuration} day price:`, fullListingPrice);
            return fullListingPrice;
        }

        // Otherwise calculate based on breakdown
        let total = 0;
        const breakdown = this.getBookingBreakdown();

        breakdown.forEach(item => {
            total += item.totalPrice;
        });

        return total;
    }

    getBookingBreakdown(): BookingBreakdown[] {
        if (!this.listing) return [];

        // Check if full listing is selected
        if (this.isFullListingSelected() && this.selectedBedIds.size > 0) {
            const multiplier = this.selectedDuration === 15 ? 0.5 : 1.0;
            return [{
                type: 'full',
                id: this.listing.id,
                name: `حجز كامل للإعلان (${this.selectedDuration} يوم)`,
                quantity: 1,
                unitPrice: this.listing.monthlyPrice * multiplier,
                totalPrice: this.listing.monthlyPrice * multiplier
            }];
        }

        // Otherwise, calculate room/bed breakdown
        const breakdown: BookingBreakdown[] = [];
        const processedBeds: Set<number> = new Set();

        // Check each room to see if it's fully selected
        this.rooms.forEach(room => {
            if (this.isRoomFullySelected(room)) {
                const multiplier = this.selectedDuration === 15 ? 0.5 : 1.0;
                const roomPrice = room.roomPrice * multiplier;
                // All beds in this room are selected -> count as room booking
                breakdown.push({
                    type: 'room',
                    id: room.id,
                    name: `${room.roomNumber} (${this.selectedDuration} يوم)`,
                    quantity: 1,
                    unitPrice: roomPrice,
                    totalPrice: roomPrice
                });
                // Mark all beds in this room as processed
                room.beds.forEach(bed => processedBeds.add(bed.id));
            }
        });

        // Count individual beds that are not part of full room bookings
        const individualBeds: number[] = [];
        this.selectedBedIds.forEach(bedId => {
            if (!processedBeds.has(bedId)) {
                individualBeds.push(bedId);
            }
        });

        if (individualBeds.length > 0) {
            const multiplier = this.selectedDuration === 15 ? 0.5 : 1.0;
            // Group by adjusted price to show accurate breakdown
            const bedsByPrice: Map<number, number> = new Map();

            individualBeds.forEach(bedId => {
                const bed = this.findBedById(bedId);
                if (bed) {
                    const adjustedPrice = bed.bedPrice * multiplier;
                    const currentCount = bedsByPrice.get(adjustedPrice) || 0;
                    bedsByPrice.set(adjustedPrice, currentCount + 1);
                }
            });

            bedsByPrice.forEach((count, price) => {
                breakdown.push({
                    type: 'bed',
                    id: 0,
                    name: count > 1
                        ? `أسرّة فردية (${price} ج.م للسرير - ${this.selectedDuration} يوم)`
                        : `سرير فردي (${this.selectedDuration} يوم)`,
                    quantity: count,
                    unitPrice: price,
                    totalPrice: count * price
                });
            });
        }

        return breakdown;
    }

    /**
     * Find bed by ID across all rooms
     */
    findBedById(bedId: number): BedDto | undefined {
        for (const room of this.rooms) {
            const bed = room.beds.find(b => b.id === bedId);
            if (bed) return bed;
        }
        return undefined;
    }

    confirmBooking() {
        // Validate beds selected
        if (this.selectedBedIds.size === 0) {
            Swal.fire({
                title: 'تنبيه',
                text: 'الرجاء اختيار سرير واحد على الأقل',
                icon: 'warning',
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#ffc107'
            });
            return;
        }

        // Validate check-in date
        if (!this.checkInDate) {
            Swal.fire({
                title: 'تنبيه',
                text: 'الرجاء اختيار تاريخ الوصول',
                icon: 'warning',
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#ffc107'
            });
            return;
        }

        const bookingSelection: BookingSelection = {
            listingId: this.listing!.id,
            selectedBeds: Array.from(this.selectedBedIds),
            selectedRooms: this.rooms
                .filter(room => this.isRoomFullySelected(room))
                .map(room => room.id),
            duration: this.selectedDuration,
            checkInDate: this.checkInDate,
            checkOutDate: this.checkOutDate!,
            totalAmount: this.calculateTotal(),
            breakdown: this.getBookingBreakdown()
        };

        console.log('📋 Creating reservation:', bookingSelection);

        // Show loading state
        Swal.fire({
            title: 'جاري إنشاء الحجز...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Create reservation request
        const reservationRequest: CreateReservationRequest = {
            listingId: bookingSelection.listingId,
            bedIds: bookingSelection.selectedBeds,
            startDate: bookingSelection.checkInDate.toISOString().split('T')[0],
            durationInDays: bookingSelection.duration
        };

        console.log('📋 Creating reservation with request:', reservationRequest);

        // Step 1: Create reservation
        this.reservationService.createReservation(reservationRequest).subscribe({
            next: (reservationResponse) => {
                console.log('✅ Reservation created successfully:', reservationResponse);
                Swal.close();

                // Navigate to payment page with reservation ID
                this.router.navigate(['/payment'], {
                    state: {
                        bookingSelection: bookingSelection,
                        listing: this.listing,
                        reservationId: reservationResponse.id
                    }
                });
            },
            error: (error) => {
                console.error('❌ Reservation creation failed');
                console.error('Error details:', error);
                console.error('Error status:', error.status);
                console.error('Error message:', error.message);
                console.error('Full error object:', JSON.stringify(error, null, 2));

                Swal.fire({
                    title: 'خطأ في الحجز',
                    text: error.error?.message || error.message || 'حدث خطأ أثناء إنشاء الحجز. يرجى المحاولة مرة أخرى.',
                    icon: 'error',
                    confirmButtonText: 'حسناً',
                    confirmButtonColor: '#dc3545'
                });
            }
        });
    }

    cancel() {
        if (this.listing) {
            this.router.navigate(['/listings', this.listing.id]);
        } else {
            this.router.navigate(['/home']);
        }
    }
}
