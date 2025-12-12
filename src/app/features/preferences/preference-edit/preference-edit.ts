import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AllowOrNot,
  Gender,
  NoiseToleranceLevel,
  SleepSchedule,
  SocialLevel,
  UpdatePreferencesRequest,
} from '../../../core/models/user';
import { UserService } from '../../../core/services/user.service';
import { CITIES } from '../../../core/constants/cities';

@Component({
  selector: 'app-preference-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './preference-edit.html',
  styleUrl: './preference-edit.css',
})
export class PreferenceEdit implements OnInit {
  preferenceForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  // Enums for template
  AllowOrNot = AllowOrNot;
  SleepSchedule = SleepSchedule;
  SocialLevel = SocialLevel;
  NoiseToleranceLevel = NoiseToleranceLevel;
  Gender = Gender;

  // Enum options for dropdowns
  genderOptions = [
    { value: 0, label: 'ذكر' },
    { value: 1, label: 'أنثى' }
  ];

  sleepScheduleOptions = [
    { value: SleepSchedule.EarlyBird, label: 'طائر مبكر (قبل 9 مساءً)' },
    { value: SleepSchedule.NightOwl, label: 'بومة ليلية (بعد 12 صباحاً)' },
    { value: SleepSchedule.Flexible, label: 'مرن' },
  ];

  socialLevelOptions = [
    { value: SocialLevel.Introvert, label: 'انطوائي (أفضل الوقت الهادئ)' },
    { value: SocialLevel.Extrovert, label: 'اجتماعي (أحب التواصل)' },
    { value: SocialLevel.Ambivert, label: 'متوازن (بين الاثنين)' },
  ];

  noiseToleranceOptions = [
    { value: NoiseToleranceLevel.Low, label: 'منخفض (أحتاج الهدوء)' },
    { value: NoiseToleranceLevel.Medium, label: 'متوسط (أتحمل بعض الضوضاء)' },
    { value: NoiseToleranceLevel.High, label: 'عالي (الضوضاء لا تزعجني)' },
  ];

  allowOrNotOptions = [
    { value: AllowOrNot.Allowed, label: 'مسموح' },
    { value: AllowOrNot.NotAllowed, label: 'غير مسموح' },
    { value: AllowOrNot.Maybe, label: 'ربما' },
  ];

  cities = CITIES;

  openDropdown: string | null = null;

  private preferencesExist = false;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.preferenceForm = this.fb.group({
      // Location - matches backend: NotEmpty, MinLength(2), MaxLength(50)
      city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],

      // Age Range - matches backend: GreaterThanOrEqualTo(18), LessThanOrEqualTo(100)
      minimumAge: [null, [Validators.required, Validators.min(18), Validators.max(100)]],
      maximumAge: [null, [Validators.required, Validators.min(18), Validators.max(100)]],

      // Gender (enum)
      gender: [null, [Validators.required]],

      // Budget Range - matches backend: GreaterThan(0)
      minimumBudget: [null, [Validators.required, Validators.min(1)]],
      maximumBudget: [null, [Validators.required, Validators.min(1)]],

      // Lifestyle Preferences (enums)
      children: [null, [Validators.required]],
      visits: [null, [Validators.required]],
      overnightGuests: [null, [Validators.required]],
      smoking: [null, [Validators.required]],
      pets: [null, [Validators.required]],

      // Levels (enums)
      sleepSchedule: [null, [Validators.required]],
      socialLevel: [null, [Validators.required]],
      noiseToleranceLevel: [null, [Validators.required]],

      // Job & Education - matches backend: MaxLength(100)
      job: ['', [Validators.required, Validators.maxLength(100)]],
      isStudent: [false],
      university: ['', [Validators.maxLength(100)]],
      major: ['', [Validators.maxLength(100)]],
    }, {
      validators: [this.ageRangeValidator, this.budgetRangeValidator]
    });

    // Add conditional validators for student fields
    this.preferenceForm.get('isStudent')?.valueChanges.subscribe((isStudent) => {
      const universityControl = this.preferenceForm.get('university');
      const majorControl = this.preferenceForm.get('major');

      if (isStudent) {
        universityControl?.setValidators([Validators.required, Validators.maxLength(100)]);
        majorControl?.setValidators([Validators.required, Validators.maxLength(100)]);
      } else {
        universityControl?.setValidators([Validators.maxLength(100)]);
        majorControl?.setValidators([Validators.maxLength(100)]);
      }

      universityControl?.updateValueAndValidity();
      majorControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadPreferences();
  }

  loadPreferences() {
    this.loading = true;
    this.userService.getPreferences().subscribe({
      next: (data) => {
        // Check if cached/legacy city is valid
        if (data.city && !this.cities.includes(data.city)) {
          data.city = 'السادات'; // Or 'السادات' if preferred as default
        }
        this.preferenceForm.patchValue(data);
        this.preferencesExist = true;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load preferences', err);
        this.loading = false;
        // Handle 404 if preferences not found (user hasn't completed them yet)
        if (err.status === 404) {
          this.preferencesExist = false;
        }
      },
    });
  }

  // Custom validator: MinimumAge <= MaximumAge
  ageRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const minAge = group.get('minimumAge')?.value;
    const maxAge = group.get('maximumAge')?.value;

    if (minAge && maxAge && minAge > maxAge) {
      return { ageRangeInvalid: true };
    }
    return null;
  }

  // Custom validator: MinimumBudget <= MaximumBudget
  budgetRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const minBudget = group.get('minimumBudget')?.value;
    const maxBudget = group.get('maximumBudget')?.value;

    if (minBudget && maxBudget && minBudget > maxBudget) {
      return { budgetRangeInvalid: true };
    }
    return null;
  }

  get isStudent(): boolean {
    return this.preferenceForm.get('isStudent')?.value;
  }

  toggleDropdown(name: string) {
    if (this.openDropdown === name) {
      this.openDropdown = null;
    } else {
      this.openDropdown = name;
    }
  }

  selectOption(controlName: string, value: any) {
    this.preferenceForm.patchValue({ [controlName]: value });
    this.preferenceForm.get(controlName)?.markAsTouched();
    this.openDropdown = null;
  }

  getLabel(controlName: string, options: { value: any, label: string }[]): string {
    const value = this.preferenceForm.get(controlName)?.value;
    const option = options.find(opt => opt.value === value);
    return option ? option.label : 'اختر...';
  }

  onSubmit() {
    // Mark all as touched to show any validation errors (like min/max)
    this.preferenceForm.markAllAsTouched();

    if (this.preferenceForm.invalid) {
      this.errorMessage = 'يرجى تصحيح الأخطاء في النموذج.';
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Convert form data and parse enums to integers
    const formData = this.preferenceForm.value;
    const request: UpdatePreferencesRequest = {
      ...formData,
      // Convert all enum fields from string/null to number (or keep null if empty)
      gender: formData.gender !== null ? parseInt(formData.gender) : null,
      children: formData.children !== null ? parseInt(formData.children) : null,
      visits: formData.visits !== null ? parseInt(formData.visits) : null,
      overnightGuests: formData.overnightGuests !== null ? parseInt(formData.overnightGuests) : null,
      smoking: formData.smoking !== null ? parseInt(formData.smoking) : null,
      pets: formData.pets !== null ? parseInt(formData.pets) : null,
      sleepSchedule: formData.sleepSchedule !== null ? parseInt(formData.sleepSchedule) : null,
      socialLevel: formData.socialLevel !== null ? parseInt(formData.socialLevel) : null,
      noiseToleranceLevel: formData.noiseToleranceLevel !== null ? parseInt(formData.noiseToleranceLevel) : null,
    };

    // Use completePreferences if preferences don't exist yet, otherwise update
    const request$ = this.preferencesExist
      ? this.userService.updatePreferences(request)
      : this.userService.completePreferences(request);

    request$.subscribe({
      next: (res) => {
        this.successMessage = 'تم حفظ التفضيلات بنجاح!';
        this.preferencesExist = true; // After first save, they exist
        this.loading = false;
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'فشل حفظ التفضيلات. يرجى المحاولة مرة أخرى.';
        this.loading = false;
      },
    });
  }
}
