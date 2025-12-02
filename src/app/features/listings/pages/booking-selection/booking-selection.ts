import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { ListingDetailsDto } from '../../models/listing';
import { RoomDto, BedDto, BookingSelection, BookingBreakdown } from '../../models/booking';

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

    // Pricing constants (will be replaced with backend data later)
    readonly BED_PRICE = 250;
    readonly ROOM_PRICE = 750;

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
                // Generate mock rooms and beds based on listing data
                this.generateMockRoomsAndBeds(listing);
                this.loading = false;
            },
            error: (error) => {
                console.error('Error fetching listing:', error);
                this.loading = false;
                alert('حدث خطأ أثناء تحميل بيانات الإعلان');
                this.router.navigate(['/home']);
            }
        });
    }

    generateMockRoomsAndBeds(listing: ListingDetailsDto) {
        // Generate rooms based on totalRooms and availableRooms
        const rooms: RoomDto[] = [];
        const bedsPerRoom = Math.floor(listing.totalBeds / listing.totalRooms);

        for (let i = 1; i <= listing.totalRooms; i++) {
            const beds: BedDto[] = [];

            for (let j = 1; j <= bedsPerRoom; j++) {
                beds.push({
                    id: (i - 1) * bedsPerRoom + j,
                    bedNumber: `سرير ${j}`,
                    roomId: i,
                    isAvailable: true,
                    bedPrice: this.BED_PRICE
                });
            }

            rooms.push({
                id: i,
                roomNumber: `غرفة ${i}`,
                beds: beds,
                roomPrice: this.ROOM_PRICE
            });
        }

        this.rooms = rooms;
        console.log('Generated rooms:', this.rooms);
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

    calculateTotal(): number {
        let total = 0;
        const breakdown = this.getBookingBreakdown();

        breakdown.forEach(item => {
            total += item.totalPrice;
        });

        return total;
    }

    getBookingBreakdown(): BookingBreakdown[] {
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
                    unitPrice: this.ROOM_PRICE,
                    totalPrice: this.ROOM_PRICE
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
            breakdown.push({
                type: 'bed',
                id: 0, // Generic ID for grouped beds
                name: 'أسرّة فردية',
                quantity: individualBeds.length,
                unitPrice: this.BED_PRICE,
                totalPrice: individualBeds.length * this.BED_PRICE
            });
        }

        return breakdown;
    }

    confirmBooking() {
        if (this.selectedBedIds.size === 0) {
            alert('الرجاء اختيار سرير واحد على الأقل');
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
