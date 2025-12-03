import { Component, EventEmitter, Output } from '@angular/core';
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
  targetId: string = '';
  rating: number = 0;
  comment: string = '';
  isSubmitting: boolean = false;

  @Output() closeEvent = new EventEmitter<void>();

  constructor(private reviewService: ReviewService) { }

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

    this.reviewService.addReview(review).subscribe({
      next: () => {
        this.isSubmitting = false;
        Swal.fire({
          title: 'تم بنجاح',
          text: 'تم إضافة التقييم بنجاح',
          icon: 'success',
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#0d6efd'
        }).then(() => {
          this.close();
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error adding review:', err);
        Swal.fire('خطأ', 'حدث خطأ أثناء إضافة التقييم', 'error');
      }
    });
  }
}
