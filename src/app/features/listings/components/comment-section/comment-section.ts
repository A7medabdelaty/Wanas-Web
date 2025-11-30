import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CommentDto } from '../../models/listing';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './comment-section.html',
  styleUrl: './comment-section.css',
})
export class CommentSection {
  @Input() comments: CommentDto[] = [];

  getTopLevelComments(): CommentDto[] {
    return this.comments || [];
  }
}
