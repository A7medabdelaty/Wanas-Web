import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReviewDto } from '../../listings/models/listing';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './review-card.html',
  styleUrl: './review-card.css',
})
export class ReviewCard {
  @Input() review!: ReviewDto;

  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }
}
