import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompleteProfile } from '../../profile/complete-profile/complete-profile';
import { PreferenceAdd } from '../../preferences/preference-add/preference-add';
import { OnboardingService } from '../services/onboarding.service';

@Component({
    selector: 'app-onboarding-container',
    imports: [CommonModule, CompleteProfile, PreferenceAdd],
    templateUrl: './onboarding-container.html',
    styleUrl: './onboarding-container.css',
})
export class OnboardingContainer {
    currentStep = signal(0);
    isProfileCompleted = signal(false);
    isLoading = signal(false);

    steps = [
        { label: 'إكمال الملف الشخصي', icon: '👤', completed: false },
        { label: 'إضافة التفضيلات', icon: '⚙️', completed: false },
    ];

    constructor(
        private onboardingService: OnboardingService,
        private router: Router
    ) {
        // Check if profile is already completed
        if (this.onboardingService.isProfileCompleted()) {
            this.isProfileCompleted.set(true);
            this.steps[0].completed = true;
            this.currentStep.set(1);
        }
    }

    onProfileCompleted() {
        this.isProfileCompleted.set(true);
        this.steps[0].completed = true;
        this.onboardingService.markProfileCompleted();
        // Auto-advance to next step
        this.nextStep();
    }

    onPreferencesCompleted() {
        this.steps[1].completed = true;
        this.onboardingService.markPreferencesCompleted();
        this.finish();
    }

    nextStep() {
        if (this.currentStep() < this.steps.length - 1) {
            this.currentStep.update((step) => step + 1);
        }
    }

    previousStep() {
        if (this.currentStep() > 0) {
            this.currentStep.update((step) => step - 1);
        }
    }

    skipPreferences() {
        // User can skip preferences
        this.finish();
    }

    finish() {
        // Redirect to home page
        this.router.navigate(['/']);
    }

    canAccessStep(stepIndex: number): boolean {
        // Step 0 (profile) is always accessible
        if (stepIndex === 0) return true;
        // Step 1 (preferences) requires profile completion
        if (stepIndex === 1) return this.isProfileCompleted();
        return false;
    }

    getStepClass(stepIndex: number): string {
        if (this.steps[stepIndex].completed) return 'completed';
        if (this.currentStep() === stepIndex) return 'active';
        if (!this.canAccessStep(stepIndex)) return 'disabled';
        return 'pending';
    }
}
