import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UserProfileResponse {
    id: string;
    email: string;
    fullName: string;
    profileType: number;
    age: number;
    city: string;
    phoneNumber: string;
    bio: string;
    photo: string;
    isFirstLogin: boolean;
    isProfileCompleted: boolean;
    isPreferenceCompleted: boolean;
}

export interface UserPreferencesResponse {
    id: number;
    city: string;
    minimumAge: number;
    maximumAge: number;
    gender: number;
    minimumBudget: number;
    maximumBudget: number;
    children: number;
    visits: number;
    overnightGuests: number;
    smoking: number;
    pets: number;
    sleepSchedule: number;
    socialLevel: number;
    noiseToleranceLevel: number;
    job: string;
    isStudent: boolean;
    university: string;
    major: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private http = inject(HttpClient);
    // Using direct URL as requested, but ideally should use environment.apiUrl
    // Assuming the user wants to use the provided localhost URL directly or via environment if it matches.
    // I'll use a base URL strategy.
    private apiUrl = 'https://localhost:7279/api';

    getProfile(): Observable<UserProfileResponse> {
        return this.http.get<UserProfileResponse>(`${this.apiUrl}/User/profile`);
    }

    getPreferences(): Observable<UserPreferencesResponse> {
        return this.http.get<UserPreferencesResponse>(`${this.apiUrl}/User/preferences`);
    }

    getProfileById(id: string): Observable<UserProfileResponse> {
        return this.http.get<UserProfileResponse>(`${this.apiUrl}/User/profile/${id}`);
    }

    getPreferencesById(id: string): Observable<UserPreferencesResponse> {
        return this.http.get<UserPreferencesResponse>(`${this.apiUrl}/User/preferences/${id}`);
    }
}
