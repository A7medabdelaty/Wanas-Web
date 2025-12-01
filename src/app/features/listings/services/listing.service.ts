import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ListingDetailsDto } from '../models/listing';

@Injectable({
    providedIn: 'root'
})
export class ListingService {
    private apiUrl = '/api';

    constructor(private http: HttpClient) { }

    generateDescription(data: any): Observable<any> {
        console.log(`[ListingService] Generating description. URL: ${this.apiUrl}/AI/generate-description`, data);
        return this.http.post(`${this.apiUrl}/AI/generate-description`, data, { responseType: 'text' });
    }

    addListing(data: any): Observable<any> {
        console.log(`[ListingService] Adding listing. URL: ${this.apiUrl}/listing`, data);
        return this.http.post(`${this.apiUrl}/listing`, data);
    }

    getListingById(id: number): Observable<ListingDetailsDto> {
        const base = environment.apiUrl.replace(/\/api$/, '');
        return this.http.get<any>(`${environment.apiUrl}/listing/${id}`).pipe(
            map((api: any) => ({
                id: api?.id ?? id,
                title: api?.title ?? '',
                description: api?.description ?? '',
                createdAt: api?.createdAt ? new Date(api.createdAt) : new Date(),
                city: api?.city ?? '',
                address: api?.address ?? '',
                monthlyPrice: api?.monthlyPrice ?? 0,
                hasElevator: !!api?.hasElevator,
                floor: api?.floor ?? '',
                areaInSqMeters: api?.areaInSqMeters ?? 0,
                totalRooms: api?.totalRooms ?? 0,
                availableRooms: api?.availableRooms ?? 0,
                totalBeds: api?.totalBeds ?? 0,
                availableBeds: api?.availableBeds ?? 0,
                totalBathrooms: api?.totalBathrooms ?? 0,
                hasKitchen: !!api?.hasKitchen,
                hasInternet: !!api?.hasInternet,
                hasAirConditioner: !!api?.hasAirConditioner,
                hasFans: !!api?.hasFans,
                isPetFriendly: !!api?.isPetFriendly,
                isSmokingAllowed: !!api?.isSmokingAllowed,
                listingPhotos: (api?.listingPhotos ?? api?.photos ?? []).map((p: any, idx: number) => {
                    const raw = p?.url ?? p;
                    const url = typeof raw === 'string'
                        ? (/^https?:\/\//i.test(raw) ? raw : `${base}${raw.startsWith('/') ? raw : '/' + raw}`)
                        : '';
                    return { id: p?.id ?? idx + 1, url };
                }),
                comments: api?.comments ?? [],
                host: api?.host ? {
                    id: String(api.host.id ?? ''),
                    fullName: api.host.fullName ?? '',
                    photoUrl: api.host.photoUrl ?? api.host.photo ?? undefined,
                    email: api.host.email ?? '',
                    phone: api.host.phone ?? api.host.phoneNumber ?? undefined,
                    city: api.host.city ?? '',
                    bio: api.host.bio ?? undefined
                } : (api?.owner ? {
                    id: String(api.owner.id ?? ''),
                    fullName: api.owner.fullName ?? '',
                    photoUrl: api.owner.photoUrl ?? api.owner.photo ?? undefined,
                    email: api.owner.email ?? '',
                    phone: api.owner.phone ?? api.owner.phoneNumber ?? undefined,
                    city: api.owner.city ?? '',
                    bio: api.owner.bio ?? undefined
                } : undefined)
            }))
        );
    }

    updateListing(id: number, data: any): Observable<any> {
        console.log(`[ListingService] Updating listing. URL: ${this.apiUrl}/listing/${id}`, data);
        return this.http.put(`${this.apiUrl}/listing/${id}`, data);
    }

    deleteListing(id: number): Observable<any> {
        console.log(`[ListingService] Deleting listing. URL: ${this.apiUrl}/listing/${id}`);
        return this.http.delete(`${this.apiUrl}/listing/${id}`);
    }
}
