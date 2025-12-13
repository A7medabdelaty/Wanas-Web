export interface ListingModel {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    city: string;
    address?: string;
    monthlyPrice: number;
    hasElevator: boolean;
    floor: number;
    areaInSqMeters: number;
    totalRooms: number;
    availableRooms: number;
    totalBeds: number;
    availableBeds: number;
    totalBathrooms: number;
    hasKitchen: boolean;
    hasInternet: boolean;
    hasAirConditioner: boolean;
    hasFans: boolean;
    isPetFriendly: boolean;
    isSmokingAllowed: boolean;
    listingPhotos: { id: number; url: string }[];
    comments: any[];
    moderationStatus?: number;
    isFlagged?: boolean;
    flagReason?: string;
    moderationNote?: string;
    isActive?: boolean;
    hasOccupiedBeds?: boolean;
    price?: number;
    mainPhotoUrl?: string;
    averageRating?: number;
    tenants?: any[];
    imageUrl?: string;
}

export interface ListingCardDto {
    id: number;
    title: string;
    price: number;
    city: string;
    region?: string;
    mainImageUrl?: string;
    numberOfRooms: number;
    numberOfBeds: number;
    numberOfBathrooms?: number; // Assuming this might be available
    matchPercentage?: number; // For the UI "98% Match"
}
