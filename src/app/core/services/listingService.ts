import { Injectable } from '@angular/core';
import { ListingModel } from '../models/listingModel';

@Injectable({
  providedIn: 'root',
})
export class ListingService {
  Listings: ListingModel[] = [
    {
      id: 1,
      title: "استوديو حديث",
      description: "استوديو مريح مناسب للأفراد أو الطلاب، بتصميم عصري ومساحة عملية.",
      price: 2500,
      imageUrl: "images/listings/1.jpg",
      city: "القاهرة"
    },
    {
      id: 2,
      title: "شقة عائلية بغرفتين",
      description: "شقة واسعة بموقع ممتاز بالقرب من الخدمات، مناسبة للعائلات الصغيرة.",
      price: 4200,
      imageUrl: "images/listings/2.jpg",
      city: "الإسكندرية"
    },
    {
      id: 3,
      title: "بنتهاوس فاخر",
      description: "وحدة فاخرة في الطابق الأخير بإطلالة بانورامية على المدينة ومساحة فسيحة.",
      price: 8500,
      imageUrl: "images/listings/3.jpg",
      city: "الجيزة"
    }
  ];
}
