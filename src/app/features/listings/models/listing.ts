export interface ListingPhotoDto {
  id: number;
  url: string;
}

export interface CommentDto {
  id: number;
  authorName: string;
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
