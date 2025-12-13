export interface ListingPhotoDto {
  id: number;
  url: string;
}

export interface CommentDto {
  id: number;
  authorName: string;
  authorId: string;
  authorPhoto?: string;
  content: string;
  createdAt: Date;
  replies: CommentDto[];
}

export interface ReviewDto {
  reviewId: number;
  targetId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  reviewerId: string;
  reviewerName: string;
  reviewerProfilePhotoUrl?: string;
}

export interface BedDto {
  bedId: number;        // Actual database bed ID
  isAvailable: boolean;
}

export interface ListingRoomDto {
  roomId: number;
  roomNumber: number;
  bedsCount: number;
  availableBeds: number;
  pricePerBed: number;
  hasAirConditioner: boolean;
  hasFan: boolean;
  beds: BedDto[];
}

export interface ListingDetailsDto {
  id: number;
  ownerId: string;
  groupChatId: string;
  title: string;
  description: string;
  createdAt: Date;
  city: string;
  address: string;
  monthlyPrice: number;
  hasElevator: boolean;
  floor: number;
  areaInSqMeters: number;
  isActive: boolean;
  hasOccupiedBeds: boolean;
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
  host?: HostDetailsDto;
  listingPhotos: ListingPhotoDto[];
  comments: CommentDto[];
  rooms: ListingRoomDto[];
  tenants: TenantDto[];
  averageRating?: number;
}

export interface TenantDto {
  id: string;
  fullName: string;
  photo?: string;
  gender: number; // 0=Male, 1=Female
  age?: number;
  bio?: string;
}

export interface HostDetailsDto {
  id: string;
  fullName: string;
  photoUrl?: string;
  email: string;
  phone: string;
  city: string;
  bio?: string;
}
