export interface ListingModel {
    id: number;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    city: string;
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
