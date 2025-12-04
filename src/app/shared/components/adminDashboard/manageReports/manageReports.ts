import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../services/report-service';
import { ReportModel, ReportSeverity, ReportStatus } from '../models/report-model';


@Component({
  selector: 'app-manageReports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './manageReports.html',
  styleUrl: './manageReports.css',
})
export class ManageReports implements OnInit {
  reports: ReportModel[] = [];
  totalCount = 0;
  isLoading = false;
  isProcessing = false;

  // Filter state
  selectedStatus: ReportStatus | null = null;
  selectedEscalated: boolean | null = null;
  selectedSeverity: ReportSeverity | null = null;
  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
    this.fetchReports();
  }

  onFiltersChange(): void {
    this.fetchReports();
  }

  private fetchReports(): void {
    this.isLoading = true;
    // Coerce checkbox value: true -> true, false -> null (show all)
    const escalatedFilter = this.selectedEscalated ? true : null;
    this.reportService.getReports({
      status: this.selectedStatus,
      escalated: escalatedFilter,
      severity: this.selectedSeverity,
    }).subscribe({
      next: (res) => {
        this.totalCount = res.totalCount;
        this.reports = res.reports;
        this.isLoading = false;
      },
      error: (err) => { console.error(err); this.isLoading = false; }
    });
  }

  // ----- Label helpers for enums -----
  statusLabel(s: ReportStatus): string {
    switch (s) {
      case ReportStatus.Pending: return 'قيد الانتظار';
      case ReportStatus.Reviewed: return 'تمت المراجعة';
      case ReportStatus.Resolved: return 'تم الحل';
      case ReportStatus.Rejected: return 'مرفوض';
      default: return String(s);
    }
  }

  severityLabel(v: ReportSeverity): string {
    switch (v) {
      case ReportSeverity.Low: return 'منخفض';
      case ReportSeverity.Medium: return 'متوسط';
      case ReportSeverity.High: return 'عالٍ';
      case ReportSeverity.Critical: return 'حرِج';
      default: return String(v);
    }
  }

  categoryLabel(c: number): string {
    // ReportCategory enum mapping
    switch (c) {
      case 0: return 'رسائل مزعجة';
      case 1: return 'محتوى حساس';
      case 2: return 'تحرش';
      case 3: return 'عنف';
      case 4: return 'إساءة';
      case 5: return 'أخرى';
      default: return String(c);
    }
  }

  targetTypeLabel(t: number): string {
    switch (t) {
      case 0: return 'مستخدم';
      case 1: return 'إعلان';
      default: return String(t);
    }
  }



}
