import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, ReportResponseDto, ReportStatus, ReportSeverity, ReportTarget, UpdateReportStatusDto } from '../../../core/services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {
  private adminService = inject(AdminService);

  reports: ReportResponseDto[] = [];
  totalCount = 0;
  selectedReport: ReportResponseDto | null = null;
  loading = false;
  error = '';

  // Filters
  filterStatus: ReportStatus | null = null;
  filterSeverity: ReportSeverity | null = null;

  // Enums for template
  ReportStatus = ReportStatus;
  ReportSeverity = ReportSeverity;
  ReportTarget = ReportTarget;

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    this.error = '';
    this.adminService.getReports(
      this.filterStatus ?? undefined,
      undefined, // Escalated filter removed from UI
      this.filterSeverity ?? undefined
    ).subscribe({
      next: (data) => {
        this.reports = data.reports;
        this.totalCount = data.totalCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load reports', err);
        this.error = 'فشل تحميل التقارير';
        this.loading = false;
      }
    });
  }

  selectReport(report: ReportResponseDto) {
    this.selectedReport = report;
  }

  trackByReport(index: number, report: ReportResponseDto): number {
    return report.reportId;
  }

  getStatusLabel(status: ReportStatus): string {
    const labels: { [key: number]: string } = {
      [ReportStatus.Pending]: 'قيد الانتظار',
      [ReportStatus.Reviewed]: 'تمت المراجعة',
      [ReportStatus.Resolved]: 'تم الحل',
      [ReportStatus.Rejected]: 'مرفوض'
    };
    return labels[status] || 'غير معروف';
  }

  getSeverityLabel(severity: ReportSeverity): string {
    const labels: { [key: number]: string } = {
      [ReportSeverity.Low]: 'منخفض',
      [ReportSeverity.Medium]: 'متوسط',
      [ReportSeverity.High]: 'عالي',
      [ReportSeverity.Critical]: 'حرج'
    };
    return labels[severity] || 'غير معروف';
  }

  openDetails(report: ReportResponseDto) {
    // For simplicity, we can show a SweetAlert with details and actions
    // Or navigate to a details page if we had one. 
    // Given the routes were reverted, I'll use SweetAlert for now to show details and actions.

    Swal.fire({
      title: `تقرير #${report.reportId}`,
      html: `
        <div class="text-start" dir="rtl">
          <p><strong>المبلغ:</strong> ${report.reporterId}</p>
          <p><strong>الهدف:</strong> ${report.targetType === ReportTarget.User ? 'مستخدم' : 'إعلان'} (${report.targetId})</p>
          <p><strong>السبب:</strong> ${report.reason}</p>
          <p><strong>الوصف:</strong> ${report.adminNote || 'لا توجد ملاحظات'}</p>
          ${report.photoUrls.length ? `<p><strong>الصور:</strong> <br>${report.photoUrls.map(url => `<a href="${url}" target="_blank">عرض الصورة</a>`).join(', ')}</p>` : ''}
        </div>
      `,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'الإجراءات',
      denyButtonText: 'تحديث الحالة',
      cancelButtonText: 'إغلاق'
    }).then((result) => {
      if (result.isConfirmed) {
        this.showActions(report);
      } else if (result.isDenied) {
        this.updateStatus(report);
      }
    });
  }

  updateStatus(report: ReportResponseDto) {
    Swal.fire({
      title: 'تحديث الحالة',
      input: 'select',
      inputOptions: {
        '0': 'قيد الانتظار',
        '1': 'تمت المراجعة',
        '2': 'تم الحل',
        '3': 'مرفوض'
      },
      inputValue: report.status.toString(),
      showCancelButton: true,
      cancelButtonText: 'إلغاء',
      confirmButtonText: 'تحديث',
      inputValidator: (value) => {
        return new Promise((resolve) => {
          resolve();
        });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newStatus = parseInt(result.value);
        const dto: UpdateReportStatusDto = { newStatus: newStatus };

        this.adminService.updateReportStatus(report.reportId, dto).subscribe(() => {
          Swal.fire('تم التحديث!', 'تم تحديث حالة التقرير بنجاح.', 'success');
          this.loadReports();
        });
      }
    });
  }

  showActions(report: ReportResponseDto) {
    Swal.fire({
      title: 'إجراءات الإدارة',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'حظر المستخدم',
      denyButtonText: 'تعليق المستخدم',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#d33',
      denyButtonColor: '#f0ad4e'
    }).then((result) => {
      if (result.isConfirmed) {
        this.banUser(report);
      } else if (result.isDenied) {
        this.suspendUser(report);
      }
    });
  }

  banUser(report: ReportResponseDto) {
    const targetId = report.targetType === ReportTarget.User ? report.targetId : report.reporterId; // Assuming we ban the target if user, or reporter? Usually target.
    // If target is Listing, maybe we ban the owner? For now let's assume targetId is the user ID if type is User.

    if (report.targetType !== ReportTarget.User) {
      Swal.fire('معلومة', 'الهدف ليس مستخدماً. قد تحتاج وظيفة الحظر إلى تعديل للعثور على المستخدم.', 'info');
      return;
    }

    Swal.fire({
      title: 'حظر المستخدم',
      input: 'text',
      inputLabel: 'السبب',
      showCancelButton: true,
      cancelButtonText: 'إلغاء',
      confirmButtonText: 'حظر'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.banUser(targetId, result.value).subscribe(() => {
          Swal.fire('تم الحظر!', 'تم حظر المستخدم بنجاح.', 'success');
        });
      }
    });
  }

  suspendUser(report: ReportResponseDto) {
    if (report.targetType !== ReportTarget.User) {
      Swal.fire('معلومة', 'الهدف ليس مستخدماً.', 'info');
      return;
    }

    Swal.fire({
      title: 'تعليق المستخدم',
      html: `
        <input id="swal-days" class="swal2-input" placeholder="عدد الأيام" type="number">
        <input id="swal-reason" class="swal2-input" placeholder="السبب">
      `,
      showCancelButton: true,
      cancelButtonText: 'إلغاء',
      confirmButtonText: 'تعليق',
      preConfirm: () => {
        return [
          (document.getElementById('swal-days') as HTMLInputElement).value,
          (document.getElementById('swal-reason') as HTMLInputElement).value
        ]
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const [days, reason] = result.value;
        this.adminService.suspendUser(report.targetId, +days, reason).subscribe(() => {
          Swal.fire('تم التعليق!', 'تم تعليق المستخدم بنجاح.', 'success');
        });
      }
    });
  }
}
