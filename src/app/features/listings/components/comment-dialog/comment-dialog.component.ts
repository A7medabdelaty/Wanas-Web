
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../services/comment.service';

@Component({
    selector: 'app-comment-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="dialog-overlay" (click)="close()">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h5>إضافة تعليق</h5>
          <button class="btn-close" (click)="close()"></button>
        </div>
        <div class="dialog-body">
          <div class="mb-3">
            <label for="commentContent" class="form-label">التعليق</label>
            <textarea
              id="commentContent"
              class="form-control"
              rows="4"
              [(ngModel)]="content"
              placeholder="اكتب تعليقك هنا..."
            ></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary me-2" (click)="close()">إلغاء</button>
          <button class="btn btn-primary" (click)="submit()" [disabled]="!content.trim() || isSubmitting">
            {{ isSubmitting ? 'جاري الإرسال...' : 'إرسال' }}
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .dialog-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
    }
    .dialog-header {
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .dialog-body {
      padding: 1rem;
    }
    .dialog-footer {
      padding: 1rem;
      border-top: 1px solid #dee2e6;
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class CommentDialogComponent {
    @Input() listingId!: number;
    @Output() closeEvent = new EventEmitter<void>();
    @Output() commentAdded = new EventEmitter<void>();

    content: string = '';
    isSubmitting: boolean = false;

    constructor(private commentService: CommentService) { }

    close() {
        this.closeEvent.emit();
    }

    submit() {
        if (!this.content.trim()) return;

        this.isSubmitting = true;
        const comment = {
            content: this.content,
            listingId: this.listingId,
            parentCommentId: null
        };

        this.commentService.addComment(comment).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.commentAdded.emit();
                if ((this as any).commentAddedCallback) {
                    (this as any).commentAddedCallback();
                }
                this.close();
            },
            error: (err) => {
                console.error('Error adding comment:', err);
                this.isSubmitting = false;
                // Handle error (optional: show toast)
            }
        });
    }
}
