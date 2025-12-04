import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ListingSearchRequestDto, ListingSearchResponseDto } from '../../../core/models/search';

@Injectable({
    providedIn: 'root'
})
export class ListingSearchService {
    private apiUrl = `${environment.apiUrl}/ListingsSearch`;

    constructor(private http: HttpClient) { }

    searchListings(request: ListingSearchRequestDto): Observable<ListingSearchResponseDto> {
        let params = new HttpParams();

        if (request.keyword) params = params.set('keyword', request.keyword);
        if (request.city) params = params.set('city', request.city);

        if (request.minPrice) params = params.set('minPrice', request.minPrice);
        if (request.maxPrice) params = params.set('maxPrice', request.maxPrice);

        if (request.minRooms) params = params.set('minRooms', request.minRooms);
        if (request.maxRooms) params = params.set('maxRooms', request.maxRooms);

        if (request.minBeds) params = params.set('minBeds', request.minBeds);
        if (request.maxBeds) params = params.set('maxBeds', request.maxBeds);

        if (request.minArea) params = params.set('minArea', request.minArea);
        if (request.maxArea) params = params.set('maxArea', request.maxArea);

        if (request.minFloor) params = params.set('minFloor', request.minFloor);
        if (request.maxFloor) params = params.set('maxFloor', request.maxFloor);

        if (request.onlyAvailable !== undefined) params = params.set('onlyAvailable', request.onlyAvailable);

        if (request.hasInternet !== undefined) params = params.set('hasInternet', request.hasInternet);
        if (request.hasKitchen !== undefined) params = params.set('hasKitchen', request.hasKitchen);
        if (request.hasElevator !== undefined) params = params.set('hasElevator', request.hasElevator);
        if (request.hasAirConditioner !== undefined) params = params.set('hasAirConditioner', request.hasAirConditioner);
        if (request.hasFans !== undefined) params = params.set('hasFans', request.hasFans);
        if (request.isPetFriendly !== undefined) params = params.set('isPetFriendly', request.isPetFriendly);
        if (request.isSmokingAllowed !== undefined) params = params.set('isSmokingAllowed', request.isSmokingAllowed);

        if (request.sortBy) params = params.set('sortBy', request.sortBy);

        params = params.set('page', request.page);
        params = params.set('pageSize', request.pageSize);

        return this.http.get<any>(`${this.apiUrl}/search`, { params }).pipe(
            map(response => {
                const base = environment.apiUrl.replace(/\/api$/, '');
                return {
                    ...response,
                    listings: (response.listings || []).map((item: any) => {
                        // Handle image URL
                        let mainImageUrl = '';
                        if (item.mainPhotoUrl) {
                            const rawUrl = item.mainPhotoUrl;
                            mainImageUrl = /^https?:\/\//i.test(rawUrl)
                                ? rawUrl
                                : `${base}${rawUrl.startsWith('/') ? rawUrl : '/' + rawUrl}`;
                        } else if (item.listingPhotos && item.listingPhotos.length > 0) {
                            const firstPhoto = item.listingPhotos[0];
                            const rawUrl = firstPhoto.url || firstPhoto;
                            if (typeof rawUrl === 'string') {
                                mainImageUrl = /^https?:\/\//i.test(rawUrl)
                                    ? rawUrl
                                    : `${base}${rawUrl.startsWith('/') ? rawUrl : '/' + rawUrl}`;
                            }
                        }

                        return {
                            id: item.id,
                            title: item.title,
                            price: item.monthlyPrice || item.price || 0,
                            city: item.city,
                            region: item.region,
                            mainImageUrl: mainImageUrl,
                            numberOfRooms: item.availableRooms ?? item.totalRooms ?? item.numberOfRooms ?? 0,
                            numberOfBeds: item.availableBeds ?? item.totalBeds ?? item.numberOfBeds ?? 0,
                            numberOfBathrooms: item.totalBathrooms ?? item.numberOfBathrooms ?? 0,
                            matchPercentage: item.matchPercentage
                        };
                    })
                };
            })
        );
    }
}
