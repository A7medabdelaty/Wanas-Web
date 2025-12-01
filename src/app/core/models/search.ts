import { ListingCardDto } from './listingModel';

export interface ListingSearchRequestDto {
    keyword?: string;
    city?: string;

    // Price
    minPrice?: number;
    maxPrice?: number;

    // Rooms & beds
    minRooms?: number;
    maxRooms?: number;
    minBeds?: number;
    maxBeds?: number;

    // Area
    minArea?: number;
    maxArea?: number;

    // Floor
    minFloor?: number;
    maxFloor?: number;

    // Availability
    onlyAvailable?: boolean;

    // Features
    hasInternet?: boolean;
    hasKitchen?: boolean;
    hasElevator?: boolean;
    hasAirConditioner?: boolean;
    hasFans?: boolean;
    isPetFriendly?: boolean;
    isSmokingAllowed?: boolean;

    // Sorting & paging
    sortBy?: string;
    page: number;
    pageSize: number;
}

export interface ListingSearchResponseDto {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    listings: ListingCardDto[];
}
