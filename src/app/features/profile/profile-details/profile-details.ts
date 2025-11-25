import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';



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
export class ProfileDetails {
  profile: UpdateProfileRequest = {
    fullName: 'أحمد محمد',
    bio: 'مصور شغوف ومحب للطبيعة. أبحث دائمًا عن مغامرات جديدة ومنزل هادئ في المدينة أو بجانب البحر. أقدر النظافة والتواصل المفتوح ومساحة المعيشة الهادئة خلال أيام الأسبوع. استمتع باستكشاف المقاهي الجديدة والمشي لمسافات طويلة واستضافة تجمعات عشاء صغيرة وحميمة من حين لآخر.',
    job: 'مصور حر',
    photo: 'assets/images/profile-placeholder.jpg' // Placeholder, user will need to provide actual image or I can use a placeholder service if needed, but for now local path is safer assumption or maybe a url
  };

  // Extended profile properties that were in the design but not in the simple DTO, mapping them here for UI
  university = 'جامعة القاهرة';

  preferences: UserPreferencesResponse = {
    id: 1,
    city: 'القاهرة',
    minimumAge: 20,
    maximumAge: 30,
    gender: Gender.Male,
    minimumBudget: 3000,
    maximumBudget: 5000,
    children: AllowOrNot.NotAllowed,
    visits: AllowOrNot.Allowed,
    overnightGuests: AllowOrNot.Maybe,
    smoking: AllowOrNot.NotAllowed,
    pets: AllowOrNot.Allowed,
    sleepSchedule: SleepSchedule.EarlyRiser,
    socialLevel: SocialLevel.Ambivert,
    noiseToleranceLevel: NoiseToleranceLevel.Medium,
    job: 'مصور حر',
    isStudent: false,
    university: 'جامعة القاهرة',
    major: 'فنون جميلة'
  };

  // Helper for lifestyle tags based on preferences
  get lifestyleTags(): string[] {
    const tags: string[] = [];
    if (this.preferences.smoking === AllowOrNot.NotAllowed) tags.push('غير مدخن');
    if (this.preferences.pets === AllowOrNot.Allowed) tags.push('محب للحيوانات الأليفة');
    if (this.preferences.sleepSchedule === SleepSchedule.EarlyRiser) tags.push('يستيقظ مبكراً');
    if (this.preferences.socialLevel === SocialLevel.Ambivert) tags.push('اجتماعي بحدود');
    tags.push('نظيف ومنظم'); // Hardcoded based on bio for now as example
    return tags;
  }
}
