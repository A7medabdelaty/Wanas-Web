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
    listingPhotos: string[];
    comments: any[];
    // Keeping old fields for compatibility if needed, but marking optional or removing if unused
    price?: number;
    imageUrl?: string;
}
