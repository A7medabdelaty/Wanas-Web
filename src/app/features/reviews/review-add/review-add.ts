import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, ReviewRequest } from '../services/review.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-review-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-add.html',
  styleUrl: './review-add.css',
})
export class ReviewAdd {
  @Input() targetId: string = '';
  @Input() reviewId?: number;
  @Input() initialRating: number = 0;
  @Input() initialComment: string = '';

  onSuccess?: () => void;

  rating: number = 0;
  comment: string = '';
  isSubmitting: boolean = false;
  isEditMode: boolean = false;

  @Output() closeEvent = new EventEmitter<void>();

  constructor(private reviewService: ReviewService) { }

  ngOnInit() {
    if (this.reviewId) {
      this.isEditMode = true;
      this.rating = this.initialRating;
      this.comment = this.initialComment;
    }
  }

  setRating(value: number) {
    this.rating = value;
  }

  close() {
    this.closeEvent.emit();
  }

  submit() {
    if (this.rating === 0) {
      Swal.fire('تنبيه', 'يرجى اختيار التقييم', 'warning');
      return;
    }

    if (!this.comment.trim()) {
      Swal.fire('تنبيه', 'يرجى كتابة تعليق', 'warning');
      return;
    }

    this.isSubmitting = true;

    const review: ReviewRequest = {
      targetType: 1, // Listing
      targetId: this.targetId,
      rating: this.rating,
      comment: this.comment
    };

    const request$ = this.isEditMode && this.reviewId
      ? this.reviewService.updateReview(this.reviewId, review)
      : this.reviewService.addReview(review);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        Swal.fire({
          title: 'تم بنجاح',
          text: this.isEditMode ? 'تم تعديل التقييم بنجاح' : 'تم إضافة التقييم بنجاح',
          icon: 'success',
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#0d6efd'
        }).then(() => {
          if (this.onSuccess) this.onSuccess();
          this.close();
        });
      },
      error: (err) => {
        this.isSubmitting = false;

        // Check for specific duplicate review error (only for add mode)
        const errorMessage = err.error?.message || err.error || '';

        if (!this.isEditMode && errorMessage.toString().includes('لقد قمت بتقييم هذا العنصر من قبل')) {
          Swal.fire({
            title: 'تنبيه',
            text: 'لقد قمت بتقييم هذا العنصر من قبل.',
            icon: 'warning',
            confirmButtonText: 'حسناً',
            confirmButtonColor: '#f0ad4e'
          });
        } else {
          console.error('Error saving review:', err);
          Swal.fire('خطأ', 'حدث خطأ أثناء حفظ التقييم', 'error');
        }
      }
    });
  }
}
