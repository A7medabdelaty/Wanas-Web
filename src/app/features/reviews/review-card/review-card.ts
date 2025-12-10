import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReviewDto } from '../../listings/models/listing';
import { RatingPipe } from '../../../shared/pipes/rating-pipe';
import { ReviewService } from '../services/review.service';
import { DialogService } from '../../../core/services/dialog.service';
import { ReviewAdd } from '../review-add/review-add';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule, DatePipe, RatingPipe, RouterModule],
  templateUrl: './review-card.html',
  styleUrl: './review-card.css',
})
export class ReviewCard {
  @Input() review!: ReviewDto;
  @Input() currentUserId: string | null = null;
  @Output() refresh = new EventEmitter<void>();

  constructor(
    private dialogService: DialogService,
    private reviewService: ReviewService
  ) { }

  onEdit() {
    this.dialogService.open(ReviewAdd, {
      data: {
        targetId: this.review.targetId,
        reviewId: this.review.reviewId,
        initialRating: this.review.rating,
        initialComment: this.review.comment,
        onSuccess: () => this.refresh.emit()
      }
    });
  }
  onDelete() {
    Swal.fire({
      title: 'حذف التقييم',
      text: 'هل أنت متأكد أنك تريد حذف هذا التقييم؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، حذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reviewService.deleteReview(this.review.reviewId).subscribe({
          next: () => {
            Swal.fire({
              title: 'تم الحذف',
              text: 'تم حذف التقييم بنجاح',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            this.refresh.emit();
          },
          error: (err) => {
            console.error('Error deleting review:', err);
            Swal.fire('خطأ', 'حدث خطأ أثناء حذف التقييم', 'error');
          }
        });
      }
    });
  }
}
