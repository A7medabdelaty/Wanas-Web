import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportService } from '../report.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-report-add',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './report-add.component.html',
    styleUrls: ['./report-add.component.scss']
})
export class ReportAddComponent implements OnInit {
    @Input() targetId!: string;
    @Input() targetType!: number;
    @Output() closeEvent = new EventEmitter<void>();

    reportForm!: FormGroup;
    isSubmitting = false;
    selectedFiles: File[] = [];

    categories = [
        { value: 0, label: 'محتوى عشوائي (Spam)' },
        { value: 1, label: 'محتوى حساس' },
        { value: 2, label: 'مضايقة أو تحرش' },
        { value: 3, label: 'عنف' },
        { value: 4, label: 'محتوى مسيء' },
        { value: 5, label: 'أخرى' }
    ];

    constructor(
        private fb: FormBuilder,
        private reportService: ReportService
    ) { }

    ngOnInit(): void {
        this.initForm();
    }

    private initForm(): void {
        this.reportForm = this.fb.group({
            category: [null, Validators.required],
            reason: ['', [Validators.required, Validators.minLength(10)]],
            photos: this.fb.array([]) // For previews
        });
    }

    get photos(): FormArray {
        return this.reportForm.get('photos') as FormArray;
    }

    onFileSelected(event: any): void {
        const files = event.target.files;
        if (files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                this.selectedFiles.push(file);

                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.photos.push(this.fb.control(e.target.result));
                };
                reader.readAsDataURL(file);
            }
        }
    }

    removePhoto(index: number): void {
        this.photos.removeAt(index);
        this.selectedFiles.splice(index, 1);
    }

    onSubmit(): void {
        if (this.reportForm.valid) {
            this.isSubmitting = true;
            const formValue = this.reportForm.value;
            const formData = new FormData();

            formData.append('TargetType', this.targetType.toString());
            formData.append('TargetId', this.targetId);
            formData.append('Category', formValue.category);
            formData.append('Reason', formValue.reason);

            this.selectedFiles.forEach(file => {
                formData.append('Photos', file);
            });

            this.reportService.submitReport(formData).subscribe({
                next: () => {
                    this.isSubmitting = false;
                    Swal.fire({
                        title: 'تم الإرسال',
                        text: 'شكراً لك، تم استلام بلاغك وسيتم مراجعته.',
                        icon: 'success',
                        confirmButtonText: 'حسناً',
                        confirmButtonColor: '#0d6efd'
                    }).then(() => {
                        this.close();
                    });
                },
                error: (error) => {
                    console.error('Report error:', error);
                    this.isSubmitting = false;
                    Swal.fire({
                        title: 'خطأ',
                        text: 'حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة لاحقاً.',
                        icon: 'error',
                        confirmButtonText: 'حسناً',
                        confirmButtonColor: '#dc3545'
                    });
                }
            });
        } else {
            this.reportForm.markAllAsTouched();
        }
    }

    close(): void {
        this.closeEvent.emit();
    }
}
