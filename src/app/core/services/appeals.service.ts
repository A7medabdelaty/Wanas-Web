// src/app/services/appeals.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { 
  SubmitAppealRequest, 
  SubmitAppealResponse, 
  MyAppealsResponse 
} from '../models/appeal.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppealsService {
  private readonly apiUrl = `${environment.apiUrl}/user/appeals`;

  constructor(private http: HttpClient) {}

  // Submit a new appeal
   
  submitAppeal(request: SubmitAppealRequest): Observable<SubmitAppealResponse> {
    return this.http.post<SubmitAppealResponse>(this.apiUrl, request);
  }

  // Get current user's appeals
   
  getMyAppeals(): Observable<MyAppealsResponse> {
    return this.http.get<MyAppealsResponse>(`${this.apiUrl}/my`);
  }
}