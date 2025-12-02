// Models for booking selection
export interface RoomDto {
    id: number;
    roomNumber: string;
    beds: BedDto[];
    roomPrice: number;
}

export interface BedDto {
    id: number;
    bedNumber: string;
    roomId: number;
    isAvailable: boolean;
    bedPrice: number;
}

export interface BookingSelection {
    listingId: number;
    selectedBeds: number[]; // bed IDs
    selectedRooms: number[]; // room IDs
    totalAmount: number;
    breakdown: BookingBreakdown[];
}

export interface BookingBreakdown {
    type: 'bed' | 'room';
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
