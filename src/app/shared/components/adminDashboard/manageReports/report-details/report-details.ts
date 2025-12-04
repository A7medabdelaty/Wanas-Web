import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../services/report-service';
import { ReportModel, ReportStatus } from '../../models/report-model';
import { CommonModule, DatePipe } from '@angular/common';
import { ListingDetailsDto } from '../../../../../features/listings/models/listing';
import { ListingService } from '../../../../../features/listings/services/listing.service';
import { AdminListingDetails } from "./listing-details/listing-details";
import { ReportCategoryPipe, ReportSeverityPipe, ReportStatusPipe, ReportTargetPipe } from '../../pipes/report.pipes.ts-pipe';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [CommonModule, DatePipe, AdminListingDetails, ReportTargetPipe,
    ReportCategoryPipe,
    ReportStatusPipe,
    ReportSeverityPipe, RouterLink],
  templateUrl: './report-details.html',
  styleUrl: './report-details.css',
})
export class ReportDetails implements OnInit {
  report!: ReportModel;
  reportId!: number;
  listing!: ListingDetailsDto | undefined;

  constructor(private router: Router, private reportService: ReportService, private activatedRoute: ActivatedRoute
    , private listingService: ListingService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: (params) => {
        // Get Report ID
        this.reportId = +params['id'];

        // get the report first
        this.reportService.getReportById(this.reportId).subscribe({
          next: (report: ReportModel) => {
            this.report = report;
            console.log("Report:", report);

            // When the report arrives, now we can check target type
            if (this.report.targetType === 1) {
              // Target is Listing
              this.listingService.getListingById(+this.report.targetId).subscribe({
                next: (listing: ListingDetailsDto) => {
                  this.listing = listing;
                  console.log("Listing:", listing);
                },
                error: (err) => console.log(err)
              });
            }

            // Target is User (you can add user service here)
            // this.userService.getUserById(...)
          },
          error: (err) => console.log(err)
        });
      },
      error: (err) => console.log(err)
    });
  }



  isLoading = false;
  isProcessing = false;
  eReportStatus = ReportStatus;

  loadReport(): void {
    this.isLoading = true;
    this.reportService.getReportById(this.reportId).subscribe({
      next: (report: ReportModel) => {
        this.report = report;
        // reset this.listing to undefined first to clear old data
        this.listing = undefined;

        if (this.report.targetType === 1) {
          this.loadListingDetails(+this.report.targetId);
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading report', err);
        this.isLoading = false;
      }
    });
  }

  private loadListingDetails(listingId: number): void {
    this.listingService.getListingById(listingId).subscribe({
      next: (listing) => {
        this.listing = listing;
      },
      error: (err) => {
        console.warn('Listing not found or deleted:', err);
        this.listing = undefined;
      }
    });
  }


  banUser(userId: string): void {
    if (!userId || this.isProcessing) return;

    Swal.fire({
      title: 'حظر المستخدم',
      text: 'يرجى إدخال سبب الحظر (إلزامي)',
      input: 'text',
      inputPlaceholder: 'سبب الحظر...',
      inputAttributes: {
        'dir': 'rtl',
        'maxlength': '100'
      },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'حظر نهائي',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      inputValidator: (value) => {
        if (!value) return 'يجب كتابة سبب الحظر للمتابعة!';
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const reason = result.value;
        this.isProcessing = true;
        //  2. API Request
        this.reportService.banUser(userId, reason)
          .pipe(finalize(() => this.isProcessing = false))
          .subscribe({

            // HTTP 200 (Success Case)
            next: (res: any) => {
              Swal.fire({
                icon: 'success',
                title: 'تم الحظر',
                text: res.message || 'تم حظر المستخدم بنجاح',
                timer: 2000,
                showConfirmButton: false
              });

              this.loadReport(); // Refresh after success
            },

            // HTTP Errors
            error: (err) => {
              console.error(err);

              // 409 — User already banned
              if (err.status === 409) {
                Swal.fire({
                  icon: 'info',
                  title: 'محظور بالفعل',
                  text: err.error?.message || 'هذا المستخدم محظور بالفعل',
                  confirmButtonText: 'حسناً'
                });
              }

              // Other errors (400, 404, 500…)
              else {
                Swal.fire({
                  icon: 'error',
                  title: 'خطأ',
                  text: err.error?.message || 'حدث خطأ أثناء محاولة حظر المستخدم',
                  confirmButtonText: 'إغلاق'
                });
              }
            }
          });
      }
    });
  }

  suspendUser(userId: string): void {
    if (!userId || this.isProcessing) return;

    // 1. Input Form
    Swal.fire({
      title: 'تعليق المستخدم',
      html: `
      <div dir="rtl" class="text-end">
        <div class="mb-3">
          <label class="form-label fw-bold">مدة التعليق (بالأيام)</label>
          <input type="number" id="swal-duration" class="form-control" placeholder="مثال: 7" min="1">
        </div>
        <div class="mb-3">
          <label class="form-label fw-bold">سبب التعليق</label>
          <input type="text" id="swal-reason" class="form-control" placeholder="اكتب سبب المخالفة...">
        </div>
      </div>
    `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'تأكيد التعليق',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const durationInput = document.getElementById('swal-duration') as HTMLInputElement;
        const reasonInput = document.getElementById('swal-reason') as HTMLInputElement;

        const duration = parseInt(durationInput.value, 10);
        const reason = reasonInput.value;

        if (!duration || duration <= 0) {
          Swal.showValidationMessage('يرجى إدخال مدة صحيحة بالأيام');
          return false;
        }
        if (!reason) {
          Swal.showValidationMessage('يرجى كتابة سبب التعليق');
          return false;
        }

        return { duration, reason };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { duration, reason } = result.value;

        // 3. API Request
        this.reportService.suspendUser(userId, duration, reason)
          .pipe(finalize(() => this.isProcessing = false))
          .subscribe({
            next: (res: any) => {

              // Case A: already suspended
              if (res.alreadySuspended) {
                const dateMsg = res.suspendedUntil
                  ? `حتى ${new Date(res.suspendedUntil).toLocaleString('ar-EG')}`
                  : 'لأجل غير مسمى';

                Swal.fire({
                  icon: 'info',
                  title: 'المستخدم معلق بالفعل',
                  text: `هذا المستخدم معلق بالفعل ${dateMsg}`,
                  confirmButtonText: 'حسناً'
                });
                return;
              }

              // Case B: success (normal 200 OK)
              Swal.fire({
                icon: 'success',
                title: 'تم بنجاح',
                text: `تم تعليق المستخدم لمدة ${duration} يوم`,
                timer: 2000,
                showConfirmButton: false
              });

              this.loadReport(); // refresh UI
            },

            // Case C: API error (404, 400, 500...)
            error: (err) => {
              console.error(err);

              Swal.fire({
                icon: 'error',
                title: 'خطأ',
                text: err?.error?.message || 'حدث خطأ أثناء محاولة تعليق المستخدم',
                confirmButtonText: 'إغلاق'
              });
            }
          });
      }
    });
  }



  deleteListing(listingId: string): void {
    if (!listingId || this.isProcessing) return;

    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "لن تتمكن من استعادة هذا الإعلان بعد الحذف!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545', // Red color for danger
      cancelButtonColor: '#6c757d', // Grey color for cancel
      confirmButtonText: 'نعم، احذف الإعلان',
      cancelButtonText: 'إلغاء',
      focusCancel: true // Focus on "Cancel" by default for safety
    }).then((result) => {
      if (result.isConfirmed) {

        // 1. Show Loading
        this.isProcessing = true;
        Swal.fire({
          title: 'جارِ الحذف...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        // 2. Call API
        this.reportService.deleteListing(listingId).subscribe({
          next: () => {
            this.isProcessing = false;

            Swal.fire(
              'تم الحذف!',
              'تم حذف الإعلان بنجاح.',
              'success'
            );

            this.loadReport(); // Refresh view to show listing is gone
          },
          error: (err) => {
            this.isProcessing = false;
            console.error(err);
            Swal.fire(
              'خطأ!',
              'حدث خطأ أثناء محاولة حذف الإعلان.',
              'error'
            );
          }
        });
      }
    });
  }

  updateStatus(r: ReportModel, newStatus: ReportStatus): void {
    if (!r || r.status === newStatus || this.isProcessing) return;

    Swal.fire({
      title: 'تحديث حالة البلاغ',
      text: 'هل تريد إضافة ملاحظة إدارية؟ (اختياري)',
      input: 'textarea', // Allows multi-line notes
      inputPlaceholder: 'اكتب ملاحظة هنا...',
      inputAttributes: {
        'dir': 'rtl',       // Ensures typing is RTL
        'maxlength': '500'  // Safety limit
      },
      showCancelButton: true,
      confirmButtonText: 'تحديث الحالة',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
    }).then((result) => {
      if (result.isConfirmed) {
        // Get the note (convert empty string to undefined if needed)
        const adminNote = result.value ? result.value : undefined;

        // 1. Show Loading
        this.isProcessing = true;
        Swal.fire({
          title: 'جارِ التحديث...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        // 2. Call API
        this.reportService.updateReportStatus(r.reportId, { newStatus, adminNote }).subscribe({
          next: () => {
            this.isProcessing = false;

            // Show quick success message (Timer: 1.5s)
            Swal.fire({
              icon: 'success',
              title: 'تم التحديث',
              text: 'تم تغيير حالة البلاغ بنجاح',
              timer: 1500,
              showConfirmButton: false
            });

            this.loadReport(); // Refresh the badge/status on UI
          },
          error: (err) => {
            this.isProcessing = false;
            console.error(err);
            Swal.fire(
              'خطأ',
              'حدث خطأ أثناء تحديث الحالة',
              'error'
            );
          }
        });
      }
    });
  }


  unbanUser(userId: string): void {
    if (!userId || this.isProcessing) return;

    Swal.fire({
      title: 'إلغاء الحظر',
      text: 'يرجى كتابة سبب إلغاء الحظر',
      input: 'text',
      inputPlaceholder: 'سبب إلغاء الحظر...',
      inputAttributes: { dir: 'rtl' },
      showCancelButton: true,
      confirmButtonText: 'إلغاء الحظر',
      cancelButtonText: 'إلغاء',
      inputValidator: (value) => !value ? 'يجب كتابة السبب' : null
    }).then(result => {
      if (!result.isConfirmed) return;

      const reason = result.value;
      this.isProcessing = true;

      let spinnerShown = false;

      const spinnerTimeout = setTimeout(() => {
        spinnerShown = true;
        Swal.fire({
          title: 'جارِ التنفيذ...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
      }, 250);

      this.reportService.unbanUser(userId, reason).subscribe({
        next: (res: any) => {
          clearTimeout(spinnerTimeout);
          if (spinnerShown) Swal.close();

          Swal.fire({
            icon: 'success',
            title: 'تم إلغاء الحظر',
            text: res.message || 'تم إلغاء الحظر عن المستخدم بنجاح',
            timer: 1800,
            showConfirmButton: false
          });

          this.loadReport();
          this.isProcessing = false; //  IMPORTANT
        },
        error: (err) => {
          clearTimeout(spinnerTimeout);
          if (spinnerShown) Swal.close();

          Swal.fire({
            icon: 'error',
            title: 'خطأ',
            text: err.error?.message || 'حدث خطأ أثناء محاولة إلغاء الحظر'
          });

          this.isProcessing = false;  // MUST BE HERE
        }
      });
    });
  }



  unsuspendUser(userId: string): void {
    if (!userId || this.isProcessing) return;

    Swal.fire({
      title: 'رفع الإيقاف',
      text: 'يرجى كتابة سبب رفع الإيقاف (إلزامي)',
      input: 'text',
      inputPlaceholder: 'سبب رفع الإيقاف...',
      inputAttributes: { dir: 'rtl', maxlength: '200' },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'رفع الإيقاف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d',
      inputValidator: (value) => {
        if (!value) return 'يجب كتابة سبب رفع الإيقاف!';
        return null;
      }
    }).then(result => {
      if (!result.isConfirmed) return;

      const reason = result.value;
      this.isProcessing = true;

      let spinnerShown = false;

      /** Show spinner only after 250 ms to prevent flashing */
      const spinnerTimeout = setTimeout(() => {
        spinnerShown = true;
        Swal.fire({
          title: 'جارِ التنفيذ...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
      }, 250);

      this.reportService.unsuspendUser(userId, reason).subscribe({
        next: (res: any) => {
          clearTimeout(spinnerTimeout);

          if (spinnerShown) Swal.close();

          Swal.fire({
            icon: 'success',
            title: 'تم رفع الإيقاف',
            text: res.message || 'تم رفع إيقاف المستخدم بنجاح',
            timer: 1800,
            showConfirmButton: false
          });

          this.loadReport(); // Refresh UI
          this.isProcessing = false;
        },
        error: (err) => {
          clearTimeout(spinnerTimeout);

          if (spinnerShown) Swal.close();

          Swal.fire({
            icon: 'error',
            title: 'خطأ',
            text: err.error?.message || 'حدث خطأ أثناء محاولة رفع الإيقاف',
            confirmButtonText: 'إغلاق'
          });

          this.isProcessing = false; // Always reset so buttons are clickable
        }
      });
    });
  }







}