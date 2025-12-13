// src/app/features/account-status/submit-appeal/submit-appeal.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppealsService } from '../../../core/services/appeals.service';
import { AppealType } from '../appeal-type.enum';

@Component({
  selector: 'app-submit-appeal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './submit-appeal.html',
  styleUrls: ['./submit-appeal.css']
})
export class SubmitAppealComponent implements OnInit {
  appealForm!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  appealType: AppealType = AppealType.Suspension;

  constructor(
    private fb: FormBuilder,
    private appealsService: AppealsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get appeal type from query params (e.g., ?type=ban or ?type=suspension)
    const typeParam = this.route.snapshot.queryParamMap.get('type');
    this.appealType = typeParam === 'ban' ? AppealType.Ban : AppealType.Suspension;

    this.appealForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]]
    });
  }

  onSubmit(): void {
    if (this.appealForm.invalid) {
      this.appealForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.appealsService.submitAppeal({
      appealType: this.appealType,
      reason: this.appealForm.value.reason
    }).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.appealForm.reset();
        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to submit appeal. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  get reason() {
    return this.appealForm.get('reason');
  }

  getAppealTypeLabel(): string {
    return this.appealType === AppealType.Ban ? 'Ban' : 'Suspension';
  }
}