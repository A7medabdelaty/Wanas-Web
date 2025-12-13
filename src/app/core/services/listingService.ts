import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListingModel } from '../models/listingModel';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ListingService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  // Assuming environment.api is defined as per user request, or falling back to a default if needed.
  // Since I cannot see environment.ts, I will trust the user's prompt to use environment.api
  // If environment.api is not valid, I might need to use a hardcoded string or /api
  // But strictly following prompt:
  // return this.http.get<Listing[]>(`${environment.api}/listing/user/${userId}`);

  // However, I need to import environment. 
  // Let's assume standard path.

  getListingsByUserId(userId: string): Observable<ListingModel[]> {
    // Using the absolute URL as requested by the user and matching ProfileService
    return this.http.get<ListingModel[]>(`${this.baseUrl}/listing/user/${userId}`);
  }


  getTopSixListings(): Observable<ListingModel[]> {
    return this.http.get<ListingModel[]>(`${this.baseUrl}/listing/top`);
  }

  reactivateListing(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/listing/${id}/reactivate`, {});
  }

}
