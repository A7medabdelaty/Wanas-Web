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

  constructor() {
    this.preferencesForm = this.fb.group({
      // Location
      city: ['', [Validators.required]],

      // Age Range
      minimumAge: [18, [Validators.required, Validators.min(18), Validators.max(100)]],
      maximumAge: [50, [Validators.required, Validators.min(18), Validators.max(100)]],

      // Gender (enum: 0, 1, etc.)
      gender: [0, [Validators.required]],

      // Budget Range
      minimumBudget: [0, [Validators.required, Validators.min(0)]],
      maximumBudget: [10000, [Validators.required, Validators.min(0)]],

      // Lifestyle Preferences (enums)
      children: [0, [Validators.required]],
      visits: [0, [Validators.required]],
      overnightGuests: [0, [Validators.required]],
      smoking: [0, [Validators.required]],
      pets: [0, [Validators.required]],

      // Levels (enums)
      sleepSchedule: [0, [Validators.required]],
      socialLevel: [0, [Validators.required]],
      noiseToleranceLevel: [0, [Validators.required]],

      // Job & Education
      job: ['', [Validators.required]],
      isStudent: [false],
      university: [''],
      major: [''],
    });

    // Add conditional validators for student fields
    this.preferencesForm.get('isStudent')?.valueChanges.subscribe((isStudent) => {
      const universityControl = this.preferencesForm.get('university');
      const majorControl = this.preferencesForm.get('major');

      if (isStudent) {
        universityControl?.setValidators([Validators.required]);
        majorControl?.setValidators([Validators.required]);
      } else {
        universityControl?.clearValidators();
        majorControl?.clearValidators();
      }

      universityControl?.updateValueAndValidity();
      majorControl?.updateValueAndValidity();
    });
  }

  get isStudent(): boolean {
    return this.preferencesForm.get('isStudent')?.value;
  }

  onSubmit() {
    if (this.preferencesForm.invalid) {
      this.preferencesForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.onboardingService.addPreferences(this.preferencesForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.preferencesCompleted.emit();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'حدث خطأ أثناء حفظ التفضيلات');
      },
    });
  }
}
