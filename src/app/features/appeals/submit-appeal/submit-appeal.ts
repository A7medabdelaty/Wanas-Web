import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppealsService } from '../../../core/services/appeals.service';
import { AppealType } from '../enums/appeal-type.enum';



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
        // Translated Success Message
        this.successMessage = 'تم إرسال طلب الاستئناف بنجاح. سيقوم فريقنا بمراجعته قريباً.';
        this.appealForm.reset();
        this.isSubmitting = false;
      },
      error: (error) => {
        // Translated Error Message
        this.errorMessage = error.error?.message || 'فشل في إرسال طلب الاستئناف. يرجى المحاولة مرة أخرى.';
        this.isSubmitting = false;
      }
    });
  }

  get reason() {
    return this.appealForm.get('reason');
  }

  getAppealTypeLabel(): string {
    // Translated Labels
    return this.appealType === AppealType.Ban ? 'الحظر الدائم' : 'الإيقاف المؤقت';
  }
}