import { HttpClient } from '@angular/common/http';
import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatchResult } from '../models/rommate-model';


@Injectable({
  providedIn: 'root',
})
export class RommatesMatchingService {
  private baseUrl = environment.apiUrl;

  constructor(private http:HttpClient){}

  // GET /api/Matching/roommates/{id}?top=10
  getRoommateMatches(id: string, top: number = 10): Observable<MatchResult[]> {
    return this.http.get<MatchResult[]>(`${this.baseUrl}/Matching/roommates/${id}?top=${top}`);
  }
}
