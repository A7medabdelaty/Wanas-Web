export interface MatchingResultInterface {
    listingId: number,
    listingTitle: string,
    listingDescription: string,
    listingCity: string,
    firstPhotoUrl: string,
    price: number,
    listingPhotos: string[],
    score: number
}
