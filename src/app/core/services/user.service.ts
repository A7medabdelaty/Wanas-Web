import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    UpdatePreferencesRequest,
    UpdateProfileRequest,
    UserPreferencesResponse,
    UserProfileResponse,
} from '../models/user';
import { UserStatus } from '../models/user-status.model';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/User`;

    constructor(private http: HttpClient) { }

    // Profile
    getProfile(): Observable<UserProfileResponse> {
        return this.http.get<UserProfileResponse>(`${this.apiUrl}/profile`);
    }

    updateProfile(request: UpdateProfileRequest): Observable<UserProfileResponse> {
        // If photoFile is provided, send as FormData
        if (request.photoFile) {
            const formData = new FormData();

            // Only append fields that are actually provided
            if (request.fullName !== undefined && request.fullName !== null) {
                formData.append('FullName', request.fullName);
            }
            if (request.age !== undefined && request.age !== null) {
                formData.append('Age', request.age.toString());
            }
            if (request.city !== undefined && request.city !== null) {
                formData.append('City', request.city);
            }
            if (request.phoneNumber !== undefined && request.phoneNumber !== null) {
                formData.append('PhoneNumber', request.phoneNumber);
            }
            if (request.bio !== undefined && request.bio !== null) {
                formData.append('Bio', request.bio);
            }

            // Always append the photo file
            formData.append('PhotoFile', request.photoFile);

            return this.http.put<UserProfileResponse>(`${this.apiUrl}/profile`, formData);
        }

        // Otherwise send as JSON (when no photo file)
        return this.http.put<UserProfileResponse>(`${this.apiUrl}/profile`, request);
    }

    completeProfile(formData: FormData): Observable<UserProfileResponse> {
        return this.http.post<UserProfileResponse>(
            `${this.apiUrl}/complete-profile`,
            formData
        );
    }

    // Preferences
    getPreferences(): Observable<UserPreferencesResponse> {
        return this.http.get<UserPreferencesResponse>(`${this.apiUrl}/preferences`);
    }

    updatePreferences(
        request: UpdatePreferencesRequest
    ): Observable<UserPreferencesResponse> {
        return this.http.put<UserPreferencesResponse>(
            `${this.apiUrl}/preferences`,
            request
        );
    }

    completePreferences(
        request: UpdatePreferencesRequest
    ): Observable<UserPreferencesResponse> {
        return this.http.post<UserPreferencesResponse>(
            `${this.apiUrl}/complete-preferences`,
            request
        );
    }

    // Get user by ID (for fetching host details)
    getUserById(userId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/profile/${userId}`);
    }







    // User Status Management

    private userStatusSubject = new BehaviorSubject<UserStatus | null>(null);
    public userStatus$ = this.userStatusSubject.asObservable();

    // Get current user's ban/suspension status

    getUserStatus(): Observable<UserStatus> {
        return this.http.get<UserStatus>(`${this.apiUrl}/status`).pipe(
            tap((status) => this.userStatusSubject.next(status))
        );
    }


    // Check if user is currently active (not banned or suspended)

    isUserActive(): boolean {
        const status = this.userStatusSubject.value;
        if (!status) return true; // Assume active if status not loaded

        if (status.isBanned) return false;

        if (status.isSuspended && status.suspendedUntil) {
            const now = new Date();
            const suspendedUntil = new Date(status.suspendedUntil);
            return now > suspendedUntil; // Active if suspension expired
        }

        return status.isActive;
    }


    // Clear cached status

    clearStatus(): void {
        this.userStatusSubject.next(null);
    }


}
