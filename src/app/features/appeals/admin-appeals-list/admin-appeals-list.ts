import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminAppeal } from '../../../core/models/admin-appeal.model';
import { AdminAppealsService } from '../../../core/services/admin-appeals.service';
import { AppealStatus } from '../enums/appeal-status.enum';
import { AppealType } from '../enums/appeal-type.enum';

@Component({
  selector: 'app-admin-appeals-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-appeals-list.html',
  styleUrls: ['./admin-appeals-list.css']
})
export class AdminAppealsListComponent implements OnInit {
  appeals: AdminAppeal[] = [];
  filteredAppeals: AdminAppeal[] = [];
  totalCount = 0;
  isLoading = true;
  selectedStatus: AppealStatus | null = null;

  AppealStatus = AppealStatus;
  AppealType = AppealType;

  statusOptions = [
    { value: null, label: 'الكل' },
    { value: AppealStatus.Pending, label: 'قيد المراجعة' },
    { value: AppealStatus.Approved, label: 'مقبول' },
    { value: AppealStatus.Rejected, label: 'مرفوض' }
  ];

  constructor(private adminAppealsService: AdminAppealsService) { }

  ngOnInit(): void {
    this.loadAppeals();
  }

  loadAppeals(): void {
    this.isLoading = true;
    const status = this.selectedStatus !== null ? this.selectedStatus : undefined;

    this.adminAppealsService.getAppeals(status).subscribe({
      next: (response) => {
        this.appeals = response.appeals;
        this.filteredAppeals = response.appeals;
        this.totalCount = response.totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: error.error?.message || 'فشل تحميل البيانات',
          confirmButtonText: 'إغلاق',
          customClass: { popup: 'font-cairo' }
        });
      }
    });
  }

  onStatusFilterChange(): void {
    this.loadAppeals();
  }

  getAppealTypeLabel(type: AppealType): string {
    return type === AppealType.Ban ? 'حظر دائم' : 'إيقاف مؤقت';
  }

  getStatusLabel(status: AppealStatus): string {
    switch (status) {
      case AppealStatus.Pending: return 'قيد المراجعة';
      case AppealStatus.Approved: return 'تم القبول';
      case AppealStatus.Rejected: return 'مرفوض';
      default: return 'غير معروف';
    }
  }

  getStatusClass(status: AppealStatus): string {
    switch (status) {
      case AppealStatus.Pending: return 'bg-warning-soft text-warning';
      case AppealStatus.Approved: return 'bg-success-soft text-success';
      case AppealStatus.Rejected: return 'bg-danger-soft text-danger';
      default: return '';
    }
  }

  // --- Improved Approve Appeal (RTL) ---
  async approveAppeal(appeal: AdminAppeal): Promise<void> {
    const actionText = appeal.appealType === AppealType.Ban ? 'إلغاء الحظر' : 'إلغاء الإيقاف';

    const { value: formValues } = await Swal.fire({
      title: `<div class="font-cairo fw-bold">قبول الاستئناف</div>`,
      html: `
        <div class="text-end font-cairo" dir="rtl">
          <p class="mb-3">أنت على وشك قبول الطلب لـ: <strong class="text-brand">${appeal.userFullName}</strong></p>
          <div class="alert alert-success d-flex align-items-center gap-2 border-0 shadow-sm">
            <i class="bi bi-check-circle-fill fs-5"></i>
            <small>سيتم <strong>${actionText}</strong> وتفعيل الحساب فوراً.</small>
          </div>
          <div class="mt-3">
            <label class="form-label fw-bold small">رسالة للمستخدم (ستظهر في إشعار القبول):</label>
            <textarea id="swal-response" class="form-control border-secondary-subtle" rows="3" placeholder="مثال: تم قبول طلبك بعد مراجعة البيانات..."></textarea>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'تأكيد القبول',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#172351', // Wanas Blue
      cancelButtonColor: '#94a3b8',
      reverseButtons: true,
      customClass: { popup: 'font-cairo rounded-4' },
      preConfirm: () => {
        const response = (document.getElementById('swal-response') as HTMLTextAreaElement).value;
        if (!response.trim()) {
          Swal.showValidationMessage('يرجى كتابة رسالة للمستخدم');
          return false;
        }
        return { adminResponse: response };
      }
    });

    if (formValues) {
      this.processApproval(appeal, formValues.adminResponse);
    }
  }

  private processApproval(appeal: AdminAppeal, adminResponse: string): void {
    Swal.fire({
      title: 'جاري المعالجة...',
      html: '<span class="font-cairo">يرجى الانتظار لحظات</span>',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      customClass: { popup: 'font-cairo rounded-4' }
    });

    this.adminAppealsService.reviewAppeal(appeal.id, {
      isApproved: true,
      adminResponse: adminResponse
    }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'تمت العملية بنجاح',
          text: 'تم قبول الاستئناف وتفعيل حساب المستخدم.',
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#172351',
          customClass: { popup: 'font-cairo rounded-4' }
        });
        this.loadAppeals();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'حدث خطأ',
          text: error.error?.message || 'فشل تنفيذ العملية',
          confirmButtonText: 'إغلاق',
          customClass: { popup: 'font-cairo rounded-4' }
        });
      }
    });
  }

  // --- Improved Reject Appeal (RTL) ---
  async rejectAppeal(appeal: AdminAppeal): Promise<void> {
    const { value: formValues } = await Swal.fire({
      title: `<div class="font-cairo fw-bold text-danger">رفض الاستئناف</div>`,
      html: `
        <div class="text-end font-cairo" dir="rtl">
          <p class="mb-3">سيتم رفض الطلب المقدم من: <strong>${appeal.userFullName}</strong></p>
          <div class="alert alert-danger d-flex align-items-center gap-2 border-0 shadow-sm bg-danger-subtle text-danger">
            <i class="bi bi-exclamation-triangle-fill fs-5"></i>
            <small>سيبقى الحساب <strong>محظوراً/موقوفاً</strong> كما هو.</small>
          </div>
          <div class="mt-3">
            <label class="form-label fw-bold small text-danger">سبب الرفض (مطلوب):</label>
            <textarea id="swal-response" class="form-control border-danger" rows="3" placeholder="وضح سبب رفض الاستئناف..."></textarea>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'تأكيد الرفض',
      cancelButtonText: 'تراجع',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      reverseButtons: true,
      customClass: { popup: 'font-cairo rounded-4' },
      preConfirm: () => {
        const response = (document.getElementById('swal-response') as HTMLTextAreaElement).value;
        if (!response.trim()) {
          Swal.showValidationMessage('يجب كتابة سبب الرفض');
          return false;
        }
        return { adminResponse: response };
      }
    });

    if (formValues) {
      Swal.fire({
        title: 'جاري الرفض...',
        html: '<span class="font-cairo">يرجى الانتظار</span>',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        customClass: { popup: 'font-cairo rounded-4' }
      });

      this.adminAppealsService.reviewAppeal(appeal.id, {
        isApproved: false,
        adminResponse: formValues.adminResponse
      }).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'تم الرفض',
            text: 'تم رفض الاستئناف بنجاح.',
            confirmButtonText: 'تم',
            confirmButtonColor: '#172351',
            customClass: { popup: 'font-cairo rounded-4' }
          });
          this.loadAppeals();
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'خطأ',
            text: error.error?.message || 'فشل عملية الرفض',
            customClass: { popup: 'font-cairo rounded-4' }
          });
        }
      });
    }
  }

  // --- Improved View Details (RTL) ---
  viewAppealDetails(appeal: AdminAppeal): void {
    Swal.fire({
      title: `<div class="font-cairo fw-bold pb-2 border-bottom">تفاصيل الاستئناف</div>`,
      html: `
        <div class="text-end font-cairo" dir="rtl">
          
          <div class="row g-2 mb-3">
            <div class="col-6">
              <small class="text-muted d-block">المستخدم</small>
              <span class="fw-bold text-dark">${appeal.userFullName}</span>
            </div>
             <div class="col-6">
              <small class="text-muted d-block">نوع الطلب</small>
              <span class="badge bg-light text-dark border">${this.getAppealTypeLabel(appeal.appealType)}</span>
            </div>
          </div>

          <div class="bg-light rounded-3 p-3 mb-3 border">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong class="text-brand small"><i class="bi bi-text-paragraph me-1"></i> نص الاستئناف:</strong>
              <small class="text-muted">${new Date(appeal.createdAt).toLocaleDateString('ar-EG')}</small>
            </div>
            <p class="mb-0 small text-secondary" style="line-height: 1.6;">${appeal.reason}</p>
          </div>

          ${appeal.adminResponse ? `
            <div class="bg-white rounded-3 p-3 border border-success-subtle shadow-sm">
              <strong class="d-block text-success small mb-1"><i class="bi bi-reply-fill me-1"></i> رد الإدارة:</strong>
              <p class="mb-0 small text-dark">${appeal.adminResponse}</p>
            </div>
          ` : ''}

        </div>
      `,
      width: '600px',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: { popup: 'font-cairo rounded-4' }
    });
  }
}