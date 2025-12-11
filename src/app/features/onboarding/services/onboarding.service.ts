import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth';

export interface CompleteProfileRequest {
    age: number;
    bio: string;
    photoFile?: File | null;
}

export interface PreferencesRequest {
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
    providedIn: 'root',
})
export class OnboardingService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = environment?.apiUrl || '/api';

    /**
     * Complete user profile with multipart/form-data
     */
    completeProfile(data: CompleteProfileRequest): Observable<any> {
        const formData = new FormData();
        formData.append('Age', data.age.toString());
        formData.append('Bio', data.bio);
        if (data.photoFile) {
            formData.append('PhotoFile', data.photoFile);
        }

        return this.http.post<any>(`${this.apiUrl}/user/complete-profile`, formData).pipe(
            tap((response) => {
                // Prepare updates
                const updates: any = { isProfileCompleted: true };

                // Update photoURL from the response (backend sends 'Photo' property)
                if (response && response.Photo) {
                    updates.photoURL = response.Photo;
                }

                // Centralized update via AuthService
                this.authService.updateCurrentUser(updates);
            })
        );
    }

    /**
     * Add user preferences
     */
    addPreferences(data: PreferencesRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/user/complete-preferences`, data).pipe(
            tap(() => {
                this.authService.updateCurrentUser({ isPreferenceCompleted: true });
            })
        );
    }
}
