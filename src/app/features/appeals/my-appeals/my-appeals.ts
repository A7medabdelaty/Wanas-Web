import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppealsService } from '../../../core/services/appeals.service';
import { Appeal, AppealStatus } from '../../../core/models/appeal.model';

import { DateFormatPipe } from '../../../shared/pipes/date-format-pipe';
import { AppealType } from '../enums/appeal-type.enum';


@Component({
  selector: 'app-my-appeals',
  standalone: true,
  imports: [CommonModule, RouterModule, DateFormatPipe],
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
    switch (status) {
      case AppealStatus.Approved:
        return 'bg-success-soft text-success';
      
      case AppealStatus.Rejected:
        return 'bg-danger-soft text-danger';
      
      case AppealStatus.Pending:
      default:
        return 'bg-warning-soft text-warning';
    }
  }

  // Returns Arabic label
  getStatusLabel(status: any): string {
    switch (status) {
      case AppealStatus.Approved:
        return 'تم القبول';
      
      case AppealStatus.Rejected:
        return 'مرفوض';
      
      case AppealStatus.Pending:
        return 'قيد المراجعة';
      
      default:
        return 'غير معروف';
    }
  }


}