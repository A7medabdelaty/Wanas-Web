import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth';

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
    private authService = inject(AuthService);
    private apiUrl = environment?.apiUrl || '/api';

    /**
     * Complete user profile with multipart/form-data
     */
    completeProfile(data: CompleteProfileRequest): Observable<any> {
        const formData = new FormData();
        formData.append('Age', data.age.toString());
        formData.append('Bio', data.bio);
        formData.append('PhotoFile', data.photoFile);

        return this.http.post<any>(`${this.apiUrl}/user/complete-profile`, formData).pipe(
            tap((response) => {
                // Update user info in localStorage after successful profile completion
                const userInfo = this.authService.getUserInfo();
                if (userInfo) {
                    userInfo.isProfileCompleted = true;

                    // Update photoURL from the response (backend sends 'Photo' property)
                    if (response && response.Photo) {
                        userInfo.photoURL = response.Photo;
                    }

                    localStorage.setItem('user', JSON.stringify(userInfo));

                    // Notify AuthService subscribers about the update
                    (this.authService as any)['currentUserSubject'].next(userInfo);
                }
            })
        );
    }

    /**
     * Add user preferences
     */
    addPreferences(data: PreferencesRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/user/complete-preferences`, data).pipe(
            tap(() => {
                // Update user info in localStorage after successful preferences completion
                const userInfo = this.authService.getUserInfo();
                if (userInfo) {
                    userInfo.isPreferenceCompleted = true;
                    localStorage.setItem('user', JSON.stringify(userInfo));
                }
            })
        );
    }
}
