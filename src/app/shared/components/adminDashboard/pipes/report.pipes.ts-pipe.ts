import { Pipe, PipeTransform } from '@angular/core';
import { ReportTarget, ReportCategory, ReportStatus, ReportSeverity } from '../models/report-model';


// 1. Target Type Pipe
@Pipe({ name: 'reportTarget', standalone: true })
export class ReportTargetPipe implements PipeTransform {
  transform(type: ReportTarget): string {
    const mapping: Record<any, string> = {
      [ReportTarget.User]: "مستخدم",
      [ReportTarget.Listing]: "إعلان"
    };
    return mapping[type] || '—';
  }
}

// 2. Category Pipe
@Pipe({ name: 'reportCategory', standalone: true })
export class ReportCategoryPipe implements PipeTransform {
  transform(cat: ReportCategory): string {
    const mapping: Record<any, string> = {
      [ReportCategory.Spam]: "سبام",
      [ReportCategory.SensitiveContent]: "محتوى حساس",
      [ReportCategory.Harassment]: "مضايقات",
      [ReportCategory.Violence]: "عنف",
      [ReportCategory.Offense]: "إساءة",
      [ReportCategory.Other]: "أخرى"
    };
    return mapping[cat] || '—';
  }
}

// 3. Status Pipe
@Pipe({ name: 'reportStatus', standalone: true })
export class ReportStatusPipe implements PipeTransform {
  transform(status: ReportStatus): string {
    const mapping: Record<any, string> = {
      [ReportStatus.Pending]: "قيد المراجعة",
      [ReportStatus.Reviewed]: "تمت المراجعة",
      [ReportStatus.Resolved]: "تم الحل",
      [ReportStatus.Rejected]: "مرفوض"
    };
    return mapping[status] || '—';
  }
}

// 4. Severity Pipe
@Pipe({ name: 'reportSeverity', standalone: true })
export class ReportSeverityPipe implements PipeTransform {
  transform(level: ReportSeverity): string {
    const mapping: Record<any, string> = {
      [ReportSeverity.Low]: "منخفض",
      [ReportSeverity.Medium]: "متوسط",
      [ReportSeverity.High]: "مرتفع",
      [ReportSeverity.Critical]: "حرج"
    };
    return mapping[level] || '—';
  }
}