import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CompleteProfileRequest {
    age: number;
    bio: string;
    photoFile: File;
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
    private apiUrl = environment?.apiUrl || '/api';

    /**
     * Complete user profile with multipart/form-data
     */
    completeProfile(data: CompleteProfileRequest): Observable<any> {
        const formData = new FormData();
        formData.append('Age', data.age.toString());
        formData.append('Bio', data.bio);
        formData.append('PhotoFile', data.photoFile);

        return this.http.post(`${this.apiUrl}/user/complete-profile`, formData);
    }

    /**
     * Add user preferences
     */
    addPreferences(data: PreferencesRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/user/complete-preferences`, data);
    }

    /**
     * Check if profile is completed (stored in localStorage)
     */
    isProfileCompleted(): boolean {
        return localStorage.getItem('profileCompleted') === 'true';
    }

    /**
     * Mark profile as completed
     */
    markProfileCompleted(): void {
        localStorage.setItem('profileCompleted', 'true');
    }

    /**
     * Check if preferences are completed (stored in localStorage)
     */
    arePreferencesCompleted(): boolean {
        return localStorage.getItem('preferencesCompleted') === 'true';
    }

    /**
     * Mark preferences as completed
     */
    markPreferencesCompleted(): void {
        localStorage.setItem('preferencesCompleted', 'true');
    }

    /**
     * Reset onboarding status (for testing)
     */
    resetOnboardingStatus(): void {
        localStorage.removeItem('profileCompleted');
        localStorage.removeItem('preferencesCompleted');
    }
}
