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


  // Temporary: Restore dummy data for Home page compatibility until API is ready for it
  Listings: ListingModel[] = [
    {
      id: 1,
      title: "استوديو حديث",
      description: "استوديو مريح مناسب للأفراد أو الطلاب، بتصميم عصري ومساحة عملية.",
      createdAt: "2023-01-01",
      monthlyPrice: 2500,
      city: "السادات",
      hasElevator: true,
      floor: 2,
      areaInSqMeters: 50,
      totalRooms: 1,
      availableRooms: 1,
      totalBeds: 1,
      availableBeds: 1,
      totalBathrooms: 1,
      hasKitchen: true,
      hasInternet: true,
      hasAirConditioner: true,
      hasFans: true,
      isPetFriendly: false,
      isSmokingAllowed: false,
      listingPhotos: [{ id: 1, url: "images/listings/1.jpg" }],
      comments: [],
      price: 2500,
      imageUrl: "images/listings/1.jpg"
    },
    {
      id: 2,
      title: "شقة عائلية بغرفتين",
      description: "شقة واسعة بموقع ممتاز بالقرب من الخدمات، مناسبة للعائلات الصغيرة.",
      createdAt: "2023-01-02",
      monthlyPrice: 4200,
      city: "الإسكندرية",
      hasElevator: true,
      floor: 3,
      areaInSqMeters: 100,
      totalRooms: 2,
      availableRooms: 2,
      totalBeds: 3,
      availableBeds: 3,
      totalBathrooms: 1,
      hasKitchen: true,
      hasInternet: true,
      hasAirConditioner: true,
      hasFans: true,
      isPetFriendly: true,
      isSmokingAllowed: false,
      listingPhotos: [{ id: 2, url: "images/listings/2.jpg" }],
      comments: [],
      price: 4200,
      imageUrl: "images/listings/2.jpg"
    },
    {
      id: 3,
      title: "بنتهاوس فاخر",
      description: "وحدة فاخرة في الطابق الأخير بإطلالة بانورامية على المدينة ومساحة فسيحة.",
      createdAt: "2023-01-03",
      monthlyPrice: 8500,
      city: "الجيزة",
      hasElevator: true,
      floor: 10,
      areaInSqMeters: 200,
      totalRooms: 4,
      availableRooms: 4,
      totalBeds: 4,
      availableBeds: 4,
      totalBathrooms: 3,
      hasKitchen: true,
      hasInternet: true,
      hasAirConditioner: true,
      hasFans: true,
      isPetFriendly: false,
      isSmokingAllowed: true,
      listingPhotos: [{ id: 3, url: "images/listings/3.jpg" }],
      comments: [],
      price: 8500,
      imageUrl: "images/listings/3.jpg"
    },
    {
      id: 4,
      title: "استوديو حديث",
      description: "استوديو مريح مناسب للأفراد أو الطلاب، بتصميم عصري ومساحة عملية.",
      createdAt: "2023-01-01",
      monthlyPrice: 2500,
      city: "السادات",
      hasElevator: true,
      floor: 2,
      areaInSqMeters: 50,
      totalRooms: 1,
      availableRooms: 1,
      totalBeds: 1,
      availableBeds: 1,
      totalBathrooms: 1,
      hasKitchen: true,
      hasInternet: true,
      hasAirConditioner: true,
      hasFans: true,
      isPetFriendly: false,
      isSmokingAllowed: false,
      listingPhotos: [{ id: 1, url: "images/listings/1.jpg" }],
      comments: [],
      price: 2500,
      imageUrl: "images/listings/1.jpg"
    },
    {
      id: 5,
      title: "شقة عائلية بغرفتين",
      description: "شقة واسعة بموقع ممتاز بالقرب من الخدمات، مناسبة للعائلات الصغيرة.",
      createdAt: "2023-01-02",
      monthlyPrice: 4200,
      city: "الإسكندرية",
      hasElevator: true,
      floor: 3,
      areaInSqMeters: 100,
      totalRooms: 2,
      availableRooms: 2,
      totalBeds: 3,
      availableBeds: 3,
      totalBathrooms: 1,
      hasKitchen: true,
      hasInternet: true,
      hasAirConditioner: true,
      hasFans: true,
      isPetFriendly: true,
      isSmokingAllowed: false,
      listingPhotos: [{ id: 2, url: "images/listings/2.jpg" }],
      comments: [],
      price: 4200,
      imageUrl: "images/listings/2.jpg"
    },
    {
      id: 6,
      title: "بنتهاوس فاخر",
      description: "وحدة فاخرة في الطابق الأخير بإطلالة بانورامية على المدينة ومساحة فسيحة.",
      createdAt: "2023-01-03",
      monthlyPrice: 8500,
      city: "الجيزة",
      hasElevator: true,
      floor: 10,
      areaInSqMeters: 200,
      totalRooms: 4,
      availableRooms: 4,
      totalBeds: 4,
      availableBeds: 4,
      totalBathrooms: 3,
      hasKitchen: true,
      hasInternet: true,
      hasAirConditioner: true,
      hasFans: true,
      isPetFriendly: false,
      isSmokingAllowed: true,
      listingPhotos: [{ id: 3, url: "images/listings/3.jpg" }],
      comments: [],
      price: 8500,
      imageUrl: "images/listings/3.jpg"
    }
  ];

}
