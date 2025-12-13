import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppealsService } from '../../../core/services/appeals.service';
import { Appeal } from '../../../core/models/appeal.model';
import { AppealType } from '../appeal-type.enum';
import { DateFormatPipe } from '../../../shared/pipes/date-format-pipe';

@Component({
  selector: 'app-my-appeals',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, DateFormatPipe],
  templateUrl: './my-appeals.html',
  styleUrls: ['./my-appeals.css']
})
export class MyAppealsComponent implements OnInit {
  appeals: Appeal[] = [];
  totalCount = 0;
  isLoading = true;
  errorMessage = '';

  constructor(private appealsService: AppealsService) { }

  ngOnInit(): void {
    this.loadAppeals();
  }

  loadAppeals(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.appealsService.getMyAppeals().subscribe({
      next: (response) => {
        this.appeals = response.appeals;
        this.totalCount = response.totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'فشل تحميل بيانات الاستئناف.';
        this.isLoading = false;
      }
    });
  }

  getAppealTypeLabel(type: AppealType): string {
    // Translated Labels
    return type === AppealType.Ban ? 'حظر دائم' : 'إيقاف مؤقت';
  }

  // Returns CSS class based on status
  getStatusClass(status: any): string {
    // Convert to string and handle null/undefined
    const statusStr = String(status || '').toLowerCase();

    switch (statusStr) {
      case 'approved':
        return 'bg-success-soft text-success';
      case 'rejected':
        return 'bg-danger-soft text-danger';
      case 'pending':
      default:
        return 'bg-warning-soft text-warning';
    }
  }

  // New helper to display Arabic status text
  getStatusLabel(status: any): string {
    // Convert to string and handle null/undefined
    const statusStr = String(status || '').toLowerCase();

    switch (statusStr) {
      case 'approved':
        return 'تم القبول';
      case 'rejected':
        return 'مرفوض';
      case 'pending':
        return 'قيد المراجعة';
      default:
        return statusStr || 'غير معروف';
    }
  }


}