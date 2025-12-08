import { Component, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OnboardingService } from '../../onboarding/services/onboarding.service';

@Component({
  selector: 'app-preference-add',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './preference-add.html',
  styleUrl: './preference-add.css',
})
export class PreferenceAdd {
  @Output() preferencesCompleted = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private onboardingService = inject(OnboardingService);

  preferencesForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  
  openDropdown: string | null = null;

  genderOptions = [
    { value: 0, label: 'ذكر' },
    { value: 1, label: 'أنثى' }
  ];

  yesNoOptions = [
    { value: 0, label: 'نعم' },
    { value: 1, label: 'لا' },
    { value: 2, label: 'لا يهم' }
  ];

  allowedOptions = [
    { value: 0, label: 'مسموح' },
    { value: 1, label: 'غير مسموح' },
    { value: 2, label: 'لا يهم' }
  ];

  sleepOptions = [
    { value: 0, label: 'مبكر (قبل 10 مساءً)' },
    { value: 1, label: 'متوسط (10-12 مساءً)' },
    { value: 2, label: 'متأخر (بعد 12 مساءً)' }
  ];

  socialOptions = [
    { value: 0, label: 'انطوائي' },
    { value: 1, label: 'متوسط' },
    { value: 2, label: 'اجتماعي' }
  ];

  noiseOptions = [
    { value: 1, label: 'منخفض' },
    { value: 2, label: 'متوسط' },
    { value: 3, label: 'عالي' }
  ];

  constructor() {
    this.preferencesForm = this.fb.group({
      // Location - matches backend: NotEmpty, MinLength(2), MaxLength(50)
      city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],

      // Age Range - matches backend: GreaterThanOrEqualTo(18), LessThanOrEqualTo(100)
      minimumAge: [18, [Validators.required, Validators.min(18), Validators.max(100)]],
      maximumAge: [50, [Validators.required, Validators.min(18), Validators.max(100)]],

      // Gender (enum)
      gender: [0, [Validators.required]],

      // Budget Range - matches backend: GreaterThan(0) - MUST be > 0, not >= 0
      minimumBudget: [1, [Validators.required, Validators.min(1)]],
      maximumBudget: [10000, [Validators.required, Validators.min(1)]],

      // Lifestyle Preferences (enums)
      children: [0, [Validators.required]],
      visits: [0, [Validators.required]],
      overnightGuests: [0, [Validators.required]],
      smoking: [0, [Validators.required]],
      pets: [0, [Validators.required]],

      // Levels (enums)
      sleepSchedule: [0, [Validators.required]],
      socialLevel: [0, [Validators.required]],
      noiseToleranceLevel: [1, [Validators.required]],

      // Job & Education - matches backend: MaxLength(100) when not null
      job: ['', [Validators.required, Validators.maxLength(100)]],
      isStudent: [false],
      university: ['', [Validators.maxLength(100)]],
      major: ['', [Validators.maxLength(100)]],
    }, {
      validators: [this.ageRangeValidator, this.budgetRangeValidator]
    });

    // Add conditional validators for student fields
    this.preferencesForm.get('isStudent')?.valueChanges.subscribe((isStudent) => {
      const universityControl = this.preferencesForm.get('university');
      const majorControl = this.preferencesForm.get('major');

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
    return this.preferencesForm.get('isStudent')?.value;
  }

  toggleDropdown(name: string) {
    if (this.openDropdown === name) {
      this.openDropdown = null;
    } else {
      this.openDropdown = name;
    }
  }

  selectOption(controlName: string, value: any) {
    this.preferencesForm.patchValue({ [controlName]: value });
    this.preferencesForm.get(controlName)?.markAsTouched();
    this.openDropdown = null;
  }

  getLabel(controlName: string, options: { value: any, label: string }[]): string {
    const value = this.preferencesForm.get(controlName)?.value;
    const option = options.find(opt => opt.value === value);
    return option ? option.label : 'اختر...';
  }

  onSubmit() {
    if (this.preferencesForm.invalid) {
      this.preferencesForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Convert string values to integers for enum fields
    const formData = this.preferencesForm.value;
    const payload = {
      ...formData,
      // Convert all enum fields from string to number
      gender: parseInt(formData.gender),
      children: parseInt(formData.children),
      visits: parseInt(formData.visits),
      overnightGuests: parseInt(formData.overnightGuests),
      smoking: parseInt(formData.smoking),
      pets: parseInt(formData.pets),
      sleepSchedule: parseInt(formData.sleepSchedule),
      socialLevel: parseInt(formData.socialLevel),
      noiseToleranceLevel: parseInt(formData.noiseToleranceLevel),
    };

    this.onboardingService.addPreferences(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.preferencesCompleted.emit();
      },
      error: (error) => {
        this.isLoading.set(false);

        // Parse API validation errors
        if (error.error?.errors) {
          const errorMessages: string[] = [];
          const errors = error.error.errors;

          // Loop through all error fields
          for (const field in errors) {
            if (errors[field] && Array.isArray(errors[field])) {
              // Add all error messages for this field
              errorMessages.push(...errors[field]);
            }
          }

          // Join all error messages with line breaks
          this.errorMessage.set(errorMessages.join('\n'));
        } else {
          // Fallback to generic error message
          this.errorMessage.set(error.error?.message || 'حدث خطأ أثناء حفظ التفضيلات');
        }
      },
    });
  }
}
