import { VerificationService } from './../../../core/services/verification.service';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProfileService } from '../services/profile.service';
import { AuthService } from '../../../core/services/auth';
import { ListingService } from '../../../core/services/listingService';
import { ListingModel } from '../../../core/models/listingModel';
import { SafeImageUrlPipe } from '../../../shared/pipes/safe-image-url-pipe';
import { environment } from '../../../../environments/environment';
import { DialogService } from '../../../core/services/dialog.service';
import { ReportAddComponent } from '../../report/report-add/report-add.component';
import { ModerationStatus } from '../../../core/models/moderation';
import { UserRole } from '../../../layout/appbar/user-role.enum';
import { RatingPipe } from "../../../shared/pipes/rating-pipe";
import { ChatService } from '../../chat/services/chat';
import { CreateChatRequest } from '../../../core/models/chat.model';





export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  age?: number;
  city?: string;
  phoneNumber?: string;
  bio?: string;
  photo?: string;
  job?: string;
  role?: UserRole;
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
  imports: [CommonModule, RouterLink, RatingPipe],
  templateUrl: './profile-details.html',
  styleUrl: './profile-details.css',
})
export class ProfileDetails implements OnInit {
  private profileService = inject(ProfileService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private listingService = inject(ListingService);
  private dialog = inject(DialogService);
  private chatService = inject(ChatService);

  ModerationStatus = ModerationStatus;
  UserRole = UserRole;

  isOwnProfile = false;
  listings: ListingModel[] = [];
  profileId: string | null = null;
  userRole: UserRole | null = null;


  profile: UpdateProfileRequest = {};
  university = '';
  major = '';

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

  hasPreferences = false;
  showVerificationCta = false;
  isVerified: boolean = false;

  constructor(private verificationService: VerificationService) { }











  ngOnInit() {

    //load Verification Status

    this.verificationService.getStatus().subscribe(
      {
        next: (status) => {
          this.isVerified = status.isVerified;
        },
        error: (error) => {
          console.error('Error fetching verification status on appbar init:', error);
        }
      }
    );





    this.route.paramMap.subscribe(params => {
      const viewedUserId = params.get('id');
      const currentUser = this.authService.getUserInfo();
      const loggedInUserId = currentUser ? currentUser.id : null;
      this.userRole = currentUser ? currentUser.role : null;

      console.log('ProfileDetails: params.id:', viewedUserId);
      console.log('ProfileDetails: loggedInUserId:', loggedInUserId);
      console.log('ProfileDetails: userRole:', this.userRole);

      // Determine if it's the user's own profile
      // Case 1: No ID in route -> My profile
      // Case 2: ID in route matches my ID -> My profile
      this.isOwnProfile = !viewedUserId || viewedUserId === loggedInUserId;
      console.log('ProfileDetails: isOwnProfile:', this.isOwnProfile);

      if (this.isOwnProfile) {
        this.profileId = loggedInUserId; // Although for own profile we might not need to report, but good to have consistent ID
        this.loadMyProfile();
        if (loggedInUserId) {
          console.log('ProfileDetails: Loading own listings for:', loggedInUserId);
          this.loadUserListings(loggedInUserId);
        } else {
          console.warn('ProfileDetails: No loggedInUserId found for own profile listings');
        }
      } else {
        if (viewedUserId) {
          this.profileId = viewedUserId;
          this.loadUserProfile(viewedUserId);
          console.log('ProfileDetails: Loading other user listings for:', viewedUserId);
          this.loadUserListings(viewedUserId);
        }
      }
    });
  }















  loadUserListings(userId: string) {
    console.log('ProfileDetails: calling getListingsByUserId with', userId);
    this.listingService.getListingsByUserId(userId).subscribe({
      next: res => {
        console.log('ProfileDetails: listings loaded:', res);
        this.listings = res;
      },
      error: err => console.error('ProfileDetails: Error loading listings:', err)
    });
  }

  private loadMyProfile() {
    forkJoin({
      profile: this.profileService.getProfile(),
      preferences: this.profileService.getPreferences().pipe(
        catchError(err => {
          console.log('Preferences not found or error:', err);
          return of(null);
        })
      )
    }).subscribe({
      next: (data) => {
        this.mapProfile(data.profile);
        if (data.preferences) {
          this.hasPreferences = true;
          this.mapPreferences(data.preferences);
        } else {
          this.hasPreferences = false;
        }
      },
      error: (err) => console.error('Error loading profile', err)
    });
  }

  private loadUserProfile(userId: string) {
    forkJoin({
      profile: this.profileService.getProfileById(userId),
      preferences: this.profileService.getPreferencesById(userId).pipe(
        catchError(err => {
          console.log('Preferences not found or error:', err);
          return of(null);
        })
      )
    }).subscribe({
      next: (data) => {
        this.mapProfile(data.profile);
        if (data.preferences) {
          this.hasPreferences = true;
          this.mapPreferences(data.preferences);
        } else {
          this.hasPreferences = false;
        }
      },
      error: (err) => console.error('Error loading user profile', err)
    });
  }

  private mapProfile(apiProfile: any) {
    let role = UserRole.Guest;
    if (apiProfile.profileType === 1) role = UserRole.Owner;
    else if (apiProfile.profileType === 2) role = UserRole.Renter;
    else if (apiProfile.role === 'Admin' || apiProfile.profileType === 0) role = UserRole.Admin;

    this.profile = {
      fullName: apiProfile.fullName,
      email: apiProfile.email,
      age: apiProfile.age,
      city: apiProfile.city,
      phoneNumber: apiProfile.phoneNumber,
      bio: apiProfile.bio,
      photo: apiProfile.photo,
      job: apiProfile.job, // Note: API response didn't explicitly show 'job' in profile but 'preferences' has it. Using what's available.
      role: role
    };
  }

  getRoleLabel(role?: UserRole): string {
    if (!role) return '';
    switch (role) {
      case UserRole.Admin: return 'مدير النظام';
      case UserRole.Owner: return 'مالك';
      case UserRole.Renter: return 'مستأجر';
      case UserRole.Guest: return 'زائر';
      default: return '';
    }
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
    this.major = apiPrefs.major;

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



  getSafeImageUrl(url: string | undefined | null): string {
    if (!url) {
      return '/assets/images/placeholder.jpg';
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const baseUrl = 'https://localhost:7279';
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
  }

  openReportModal() {
    if (this.profileId) {
      this.dialog.open(ReportAddComponent, {
        data: {
          targetType: 0, // 0 for User
          targetId: this.profileId
        }
      });
    }
  }

  getStatusLabel(status: number | undefined): string {
    if (status === undefined) return '';
    switch (status) {
      case ModerationStatus.Pending: return 'قيد المراجعة';
      case ModerationStatus.Approved: return 'منشور';
      case ModerationStatus.Rejected: return 'مرفوض';
      case ModerationStatus.Removed: return 'محذوف';
      default: return 'غير معروف';
    }
  }

  getStatusBadgeClass(status: number | undefined): string {
    if (status === undefined) return '';
    switch (status) {
      case ModerationStatus.Pending: return 'badge-pending';
      case ModerationStatus.Approved: return 'badge-approved';
      case ModerationStatus.Rejected: return 'badge-rejected';
      case ModerationStatus.Removed: return 'badge-removed';
      default: return 'badge-unknown';
    }
  }

  getStatusIconClass(status: number | undefined): string {
    if (status === undefined) return '';
    switch (status) {
      case ModerationStatus.Pending: return 'fa-solid fa-hourglass';
      case ModerationStatus.Approved: return 'fa-solid fa-check';
      case ModerationStatus.Rejected: return 'fa-solid fa-x';
      case ModerationStatus.Removed: return 'fa-solid fa-trash';
      default: return '';
    }
  }

  navigateToReservations(): void {
    if (this.userRole === UserRole.Owner) {
      this.router.navigate(['/owner/requests']);
    } else if (this.userRole === UserRole.Renter) {
      this.router.navigate(['/renter/requests']);
    }
  }

  selectedListing: ListingModel | null = null;

  showModerationDetails(listing: ListingModel): void {
    if (listing.moderationStatus === ModerationStatus.Rejected ||
      listing.moderationStatus === ModerationStatus.Removed ||
      listing.isFlagged) {
      this.selectedListing = listing;
    }
  }

  openChat(): void {
    if (!this.profileId) {
      console.error('No profile ID available for chat');
      return;
    }

    const request: CreateChatRequest = {
      participantId: this.profileId,
      isGroup: false
    };

    this.chatService.createChat(request).subscribe({
      next: (response) => {
        console.log('Chat created successfully:', response);
        // Navigate to chat page
        this.router.navigate(['/chat'], { queryParams: { chatId: response.id } });
      },
      error: (error) => {
        console.error('Error creating chat:', error);
        // You might want to show a user-friendly error message here
      }
    });
  }
}
