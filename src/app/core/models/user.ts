export interface User {
    id: string;
    email: string;
    fullName: string;
    profileType: number;
    age?: number;
    city?: string;
    phoneNumber?: string;
    bio?: string;
    photo?: string;
    isFirstLogin: boolean;
    isProfileCompleted: boolean;
    isPreferenceCompleted: boolean;
}

export interface UserProfileResponse extends User { }

export interface UpdateProfileRequest {
    fullName?: string;
    age?: number;
    city?: string;
    phoneNumber?: string;
    bio?: string;
    photo?: string;
    photoFile?: File; // For file upload
}

export interface UserPreferencesResponse {
    id: string;
    city?: string;
    minimumAge?: number;
    maximumAge?: number;
    gender?: Gender;
    minimumBudget?: number;
    maximumBudget?: number;
    children?: AllowOrNot;
    visits?: AllowOrNot;
    overnightGuests?: AllowOrNot;
    smoking?: AllowOrNot;
    pets?: AllowOrNot;
    sleepSchedule?: SleepSchedule;
    socialLevel?: SocialLevel;
    noiseToleranceLevel?: NoiseToleranceLevel;
    job?: string;
    isStudent?: boolean;
    university?: string;
    major?: string;
}

export interface UpdatePreferencesRequest {
    city?: string;
    minimumAge?: number;
    maximumAge?: number;
    gender?: Gender;
    minimumBudget?: number;
    maximumBudget?: number;
    children?: AllowOrNot;
    visits?: AllowOrNot;
    overnightGuests?: AllowOrNot;
    smoking?: AllowOrNot;
    pets?: AllowOrNot;
    sleepSchedule?: SleepSchedule;
    socialLevel?: SocialLevel;
    noiseToleranceLevel?: NoiseToleranceLevel;
    job?: string;
    isStudent?: boolean;
    university?: string;
    major?: string;
}

export enum Gender {
    Male = 0,
    Female = 1,
}

export enum AllowOrNot {
    Allowed = 0,
    NotAllowed = 1,
    Maybe = 2,
}

export enum SleepSchedule {
    EarlyBird = 0,
    NightOwl = 1,
    Flexible = 2,
}

export enum SocialLevel {
    Introvert = 0,
    Extrovert = 1,
    Ambivert = 2,
}

export enum NoiseToleranceLevel {
    Low = 0,
    Medium = 1,
    High = 2,
}
