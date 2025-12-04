import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { ListingDetailsDto, ListingRoomDto } from '../../models/listing';
import { RoomDto, BedDto, BookingSelection, BookingBreakdown } from '../../models/booking';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-booking-selection',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './booking-selection.html',
    styleUrl: './booking-selection.css'
})
export class BookingSelectionComponent implements OnInit {
    listing?: ListingDetailsDto;
    rooms: RoomDto[] = [];
    selectedBedIds: Set<number> = new Set();
    loading: boolean = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private listingService: ListingService
    ) { }

    ngOnInit() {
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

    /**
     * Map backend ListingRoomDto[] to display RoomDto[]
     */
    mapBackendRoomsToDisplayRooms(backendRooms: ListingRoomDto[]): RoomDto[] {
        const displayRooms: RoomDto[] = [];
        let globalBedId = 1; // Global bed ID counter

        backendRooms.forEach((backendRoom) => {
            const beds: BedDto[] = [];

            // Create display beds from backend bed data
            for (let i = 0; i < backendRoom.bedsCount; i++) {
                const isAvailable = backendRoom.beds[i]?.isAvailable ?? false;

                beds.push({
                    id: globalBedId++,
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
     * Calculate total price
     * - If all available beds are selected, return monthlyPrice
     * - Otherwise, sum individual bed/room prices
     */
    calculateTotal(): number {
        if (!this.listing) return 0;

        // Check if full listing is selected
        if (this.isFullListingSelected() && this.selectedBedIds.size > 0) {
            console.log('💰 Full listing selected - applying monthly price:', this.listing.monthlyPrice);
            return this.listing.monthlyPrice;
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
            return [{
                type: 'full',
                id: this.listing.id,
                name: 'حجز كامل للإعلان',
                quantity: 1,
                unitPrice: this.listing.monthlyPrice,
                totalPrice: this.listing.monthlyPrice
            }];
        }

        // Otherwise, calculate room/bed breakdown
        const breakdown: BookingBreakdown[] = [];
        const processedBeds: Set<number> = new Set();

        // Check each room to see if it's fully selected
        this.rooms.forEach(room => {
            if (this.isRoomFullySelected(room)) {
                // All beds in this room are selected -> count as room booking
                breakdown.push({
                    type: 'room',
                    id: room.id,
                    name: room.roomNumber,
                    quantity: 1,
                    unitPrice: room.roomPrice,
                    totalPrice: room.roomPrice
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
            // Get the price of the first selected bed (they might have different prices)
            // Group by price to show accurate breakdown
            const bedsByPrice: Map<number, number> = new Map();

            individualBeds.forEach(bedId => {
                const bed = this.findBedById(bedId);
                if (bed) {
                    const currentCount = bedsByPrice.get(bed.bedPrice) || 0;
                    bedsByPrice.set(bed.bedPrice, currentCount + 1);
                }
            });

            bedsByPrice.forEach((count, price) => {
                breakdown.push({
                    type: 'bed',
                    id: 0,
                    name: count > 1 ? `أسرّة فردية (${price} ج.م للسرير)` : 'سرير فردي',
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

        const bookingSelection: BookingSelection = {
            listingId: this.listing!.id,
            selectedBeds: Array.from(this.selectedBedIds),
            selectedRooms: this.rooms
                .filter(room => this.isRoomFullySelected(room))
                .map(room => room.id),
            totalAmount: this.calculateTotal(),
            breakdown: this.getBookingBreakdown()
        };

        console.log('Booking selection:', bookingSelection);

        // Navigate to payment page with booking details
        this.router.navigate(['/payment'], {
            state: { bookingSelection, listing: this.listing }
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
