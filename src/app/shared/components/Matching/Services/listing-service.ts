import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatchingResultInterface } from '../models/matching-result-interface';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})

export class ListingService {
  baseUrl = environment.apiUrl;
  constructor(private httpClient: HttpClient) { }

  // GET /api/Matching/user/{id}
  getListings(userId: string | undefined): Observable<MatchingResultInterface[]> {
    return this.httpClient.get<MatchingResultInterface[]>(`${this.baseUrl}/Matching/user/${userId}`);
  }
}
