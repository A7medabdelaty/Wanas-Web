import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ProfileService } from '../services/profile.service';



export interface UpdateProfileRequest {
  fullName?: string;
  age?: number;
  city?: string;
  phoneNumber?: string;
  bio?: string;
  photo?: string;
  job?: string;
}

export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export enum AllowOrNot {
  Allowed = 'Allowed',
  NotAllowed = 'NotAllowed',
  Maybe = 'Maybe'
}

export enum SleepSchedule {
  EarlyRiser = 'EarlyRiser',
  NightOwl = 'NightOwl',
  Flexible = 'Flexible'
}

export enum SocialLevel {
  Introvert = 'Introvert',
  Extrovert = 'Extrovert',
  Ambivert = 'Ambivert'
}

export enum NoiseToleranceLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export interface UserPreferencesResponse {
  id: number;
  city: string;
  minimumAge: number;
  maximumAge: number;
  gender: Gender;
  minimumBudget: number;
  maximumBudget: number;
  children: AllowOrNot;
  visits: AllowOrNot;
  overnightGuests: AllowOrNot;
  smoking: AllowOrNot;
  pets: AllowOrNot;
  sleepSchedule: SleepSchedule;
  socialLevel: SocialLevel;
  noiseToleranceLevel: NoiseToleranceLevel;
  job?: string;
  isStudent?: boolean;
  university?: string;
  major?: string;
}

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-details.html',
  styleUrl: './profile-details.css',
})
export class ProfileDetails implements OnInit {
  private profileService = inject(ProfileService);

  profile: UpdateProfileRequest = {};
  university = '';

  preferences: UserPreferencesResponse = {
    id: 0,
    city: '',
    minimumAge: 0,
    maximumAge: 0,
    gender: Gender.Male,
    minimumBudget: 0,
    maximumBudget: 0,
    children: AllowOrNot.Allowed,
    visits: AllowOrNot.Allowed,
    overnightGuests: AllowOrNot.Allowed,
    smoking: AllowOrNot.Allowed,
    pets: AllowOrNot.Allowed,
    sleepSchedule: SleepSchedule.EarlyRiser,
    socialLevel: SocialLevel.Ambivert,
    noiseToleranceLevel: NoiseToleranceLevel.Medium,
    job: '',
    isStudent: false,
    university: '',
    major: ''
  };

  ngOnInit() {
    forkJoin({
      profile: this.profileService.getProfile(),
      preferences: this.profileService.getPreferences()
    }).subscribe({
      next: (data) => {
        this.mapProfile(data.profile);
        this.mapPreferences(data.preferences);
      },
      error: (err) => console.error('Error loading profile', err)
    });
  }

  private mapProfile(apiProfile: any) {
    this.profile = {
      fullName: apiProfile.fullName,
      age: apiProfile.age,
      city: apiProfile.city,
      phoneNumber: apiProfile.phoneNumber,
      bio: apiProfile.bio,
      photo: apiProfile.photo,
      job: apiProfile.job // Note: API response didn't explicitly show 'job' in profile but 'preferences' has it. Using what's available.
    };
  }

  private mapPreferences(apiPrefs: any) {
    this.preferences = {
      id: apiPrefs.id,
      city: apiPrefs.city,
      minimumAge: apiPrefs.minimumAge,
      maximumAge: apiPrefs.maximumAge,
      gender: this.mapGender(apiPrefs.gender),
      minimumBudget: apiPrefs.minimumBudget,
      maximumBudget: apiPrefs.maximumBudget,
      children: this.mapAllowOrNot(apiPrefs.children),
      visits: this.mapAllowOrNot(apiPrefs.visits),
      overnightGuests: this.mapAllowOrNot(apiPrefs.overnightGuests),
      smoking: this.mapAllowOrNot(apiPrefs.smoking),
      pets: this.mapAllowOrNot(apiPrefs.pets),
      sleepSchedule: this.mapSleepSchedule(apiPrefs.sleepSchedule),
      socialLevel: this.mapSocialLevel(apiPrefs.socialLevel),
      noiseToleranceLevel: this.mapNoiseTolerance(apiPrefs.noiseToleranceLevel),
      job: apiPrefs.job,
      isStudent: apiPrefs.isStudent,
      university: apiPrefs.university,
      major: apiPrefs.major
    };
    this.university = apiPrefs.university;

    // Update profile job if it was missing from profile endpoint but present in preferences
    if (!this.profile.job && apiPrefs.job) {
      this.profile.job = apiPrefs.job;
    }
  }

  // Mapping helpers - assuming standard 0-based index matches enum order or specific values
  // Adjust these based on actual backend enum definitions if different
  private mapGender(val: number): Gender {
    const map = [Gender.Male, Gender.Female];
    return map[val] || Gender.Male;
  }

  private mapAllowOrNot(val: number): AllowOrNot {
    // Assuming: 0=Allowed, 1=NotAllowed, 2=Maybe (or similar)
    // User example: smoking: 2. 
    // Let's assume: 0=Allowed, 1=NotAllowed, 2=Maybe
    const map = [AllowOrNot.Allowed, AllowOrNot.NotAllowed, AllowOrNot.Maybe];
    return map[val] || AllowOrNot.Allowed;
  }

  private mapSleepSchedule(val: number): SleepSchedule {
    const map = [SleepSchedule.EarlyRiser, SleepSchedule.NightOwl, SleepSchedule.Flexible];
    return map[val] || SleepSchedule.Flexible;
  }

  private mapSocialLevel(val: number): SocialLevel {
    const map = [SocialLevel.Introvert, SocialLevel.Extrovert, SocialLevel.Ambivert];
    return map[val] || SocialLevel.Ambivert;
  }

  private mapNoiseTolerance(val: number): NoiseToleranceLevel {
    const map = [NoiseToleranceLevel.Low, NoiseToleranceLevel.Medium, NoiseToleranceLevel.High];
    return map[val] || NoiseToleranceLevel.Medium;
  }

  // Helper for lifestyle tags based on preferences
  get lifestyleTags(): string[] {
    const tags: string[] = [];

    // Social Level
    if (this.preferences.socialLevel === SocialLevel.Introvert) tags.push('انطوائي');
    else if (this.preferences.socialLevel === SocialLevel.Extrovert) tags.push('اجتماعي');
    else if (this.preferences.socialLevel === SocialLevel.Ambivert) tags.push('متوسط');

    // Noise Tolerance
    if (this.preferences.noiseToleranceLevel === NoiseToleranceLevel.Low) tags.push('يحب الهدوء');
    else if (this.preferences.noiseToleranceLevel === NoiseToleranceLevel.Medium) tags.push('تحمل متوسط للضوضاء');
    else if (this.preferences.noiseToleranceLevel === NoiseToleranceLevel.High) tags.push('لا يمانع الضوضاء');

    // Sleep Schedule
    if (this.preferences.sleepSchedule === SleepSchedule.EarlyRiser) tags.push('يستيقظ مبكراً');
    else if (this.preferences.sleepSchedule === SleepSchedule.NightOwl) tags.push('يسهر ليلاً');
    else if (this.preferences.sleepSchedule === SleepSchedule.Flexible) tags.push('نوم مرن');

    // Smoking
    if (this.preferences.smoking === AllowOrNot.Allowed) tags.push('تدخين مسموح');
    else if (this.preferences.smoking === AllowOrNot.NotAllowed) tags.push('غير مدخن');

    // Pets
    if (this.preferences.pets === AllowOrNot.Allowed) tags.push('محب للحيوانات الأليفة');
    else if (this.preferences.pets === AllowOrNot.NotAllowed) tags.push('لا يفضل الحيوانات');

    // Visits
    if (this.preferences.visits === AllowOrNot.Allowed) tags.push('زيارات مسموحة');
    else if (this.preferences.visits === AllowOrNot.NotAllowed) tags.push('لا يفضل الزيارات');

    // Overnight Guests
    if (this.preferences.overnightGuests === AllowOrNot.Allowed) tags.push('ضيوف ليلاً مسموح');
    else if (this.preferences.overnightGuests === AllowOrNot.NotAllowed) tags.push('لا يفضل ضيوف ليلاً');

    // Children
    if (this.preferences.children === AllowOrNot.Allowed) tags.push('يحب الأطفال');
    else if (this.preferences.children === AllowOrNot.NotAllowed) tags.push('لا يفضل الأطفال');

    return tags;
  }

  // Lightbox Modal State
  isImageModalOpen = false;

  openImageModal() {
    if (this.profile.photo) {
      this.isImageModalOpen = true;
    }
  }

  closeImageModal() {
    this.isImageModalOpen = false;
  }
}
