import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import Swal from 'sweetalert2';
import { VerificationService } from '../../../../core/services/verification.service';
import { CITIES } from '../../../../core/constants/cities';

@Component({
    selector: 'app-listing-add',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './listing-add.component.html',
    styleUrls: ['./listing-add.component.css']
})
export class ListingAddComponent implements OnInit {
    listingForm!: FormGroup;
    isGeneratingDescription = false;
    isSubmitting = false;
    selectedFiles: File[] = [];
    private titlePattern = /^(?=.*\p{L})[\p{L}\d\s\-.,()'،]+$/u;
    private cityPattern = /^[\p{L}\s\-]+$/u;
    private addressPattern = /^[\p{L}\d\s\-.,#/()'،]+$/u;
    private textPattern = /^[\p{L}\d\s\-.,;:!؟!?()'"@&#/%+*=<>\[\]{}،]+$/u;
    numericTypingInvalid: Record<string, boolean> = {};
    roomNumericTypingInvalid: Record<number, Record<string, boolean>> = {};
    isVerified: boolean = false;

    cities = CITIES;
    openDropdown: string | null = null;

    constructor(
        private fb: FormBuilder,
        private listingService: ListingService,
        private router: Router,
        private verificationService: VerificationService
    ) { }

    toggleDropdown(name: string) {
        if (this.openDropdown === name) {
            this.openDropdown = null;
        } else {
            this.openDropdown = name;
        }
    }

    selectOption(controlName: string, value: any) {
        this.listingForm.patchValue({ [controlName]: value });
        this.listingForm.get(controlName)?.markAsTouched();
        this.openDropdown = null;
    }

    ngOnInit(): void {
        this.initForm();
        this.verificationService.getStatus().subscribe(
            {
                next: (status) => {
                    this.isVerified = status.isVerified;
                },
                error: (error) => {
                    console.error('Error verification status not fetched:', error);
                }
            }
        );
    }

    private initForm(): void {
        this.listingForm = this.fb.group({
            title: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(this.titlePattern)]],
            description: ['', [Validators.required, Validators.maxLength(2000)]],
            city: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(this.cityPattern)]],
            address: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(this.addressPattern)]],
            monthlyPrice: [null, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]],
            floor: [null, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]],
            areaInSqMeters: [null, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]],
            totalBathrooms: [null, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]],
            hasElevator: [false],
            hasKitchen: [false],
            hasInternet: [false],
            hasAirConditioner: [false],
            hasFans: [false],
            isPetFriendly: [false],
            isSmokingAllowed: [false],
            rooms: this.fb.array([]),
            photos: this.fb.array([], Validators.minLength(1))
        });

        // Add initial room
        this.addRoom();
    }

    get rooms(): FormArray {
        return this.listingForm.get('rooms') as FormArray;
    }

    get photos(): FormArray {
        return this.listingForm.get('photos') as FormArray;
    }

    getBeds(roomIndex: number): FormArray {
        return this.rooms.at(roomIndex).get('beds') as FormArray;
    }

    addRoom(): void {
        const roomGroup = this.fb.group({
            roomNumber: [this.rooms.length + 1],
            pricePerBed: [null, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]],
            hasAirConditioner: [false],
            beds: this.fb.array([])
        });

        this.rooms.push(roomGroup);
        // Add initial bed
        this.addBed(this.rooms.length - 1);
    }

    removeRoom(index: number): void {
        this.rooms.removeAt(index);
        // Re-index rooms
        this.updateRoomNumbers();
    }

    private updateRoomNumbers(): void {
        this.rooms.controls.forEach((control, index) => {
            control.patchValue({ roomNumber: index + 1 });
        });
    }

    addBed(roomIndex: number): void {
        const beds = this.getBeds(roomIndex);
        const bedGroup = this.fb.group({
            isAvailable: [true]
        });
        beds.push(bedGroup);
    }

    removeBed(roomIndex: number, bedIndex: number): void {
        const beds = this.getBeds(roomIndex);
        beds.removeAt(bedIndex);
    }

    onFileSelected(event: any): void {
        const files = event.target.files;
        if (files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                this.selectedFiles.push(file); // Store raw file

                // Generate preview
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.photos.push(this.fb.control(e.target.result));
                };
                reader.readAsDataURL(file);
            }
            this.photos.markAsDirty();
            this.photos.markAsTouched();
        }
    }

    removePhoto(index: number): void {
        this.photos.removeAt(index);
        this.selectedFiles.splice(index, 1); // Remove raw file
    }

    onNumericTyping(event: Event, controlName: string): void {
        const v = (event.target as HTMLInputElement).value || '';
        this.numericTypingInvalid[controlName] = v.length > 0 && !/^[1-9]\d*$/.test(v);
    }

    onRoomNumericTyping(event: Event, roomIndex: number, controlName: string): void {
        const v = (event.target as HTMLInputElement).value || '';
        if (!this.roomNumericTypingInvalid[roomIndex]) this.roomNumericTypingInvalid[roomIndex] = {};
        this.roomNumericTypingInvalid[roomIndex][controlName] = v.length > 0 && !/^[1-9]\d*$/.test(v);
    }

    onNumericKeydown(event: KeyboardEvent, controlName: string): void {
        const key = event.key;
        const allowedSpecial = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End', 'Enter'];
        const isDigit = /[0-9]/.test(key);
        const isAllowed = isDigit || allowedSpecial.includes(key);
        if (!isAllowed) {
            this.numericTypingInvalid[controlName] = true;
        } else {
            this.numericTypingInvalid[controlName] = false;
        }
    }

    onRoomNumericKeydown(event: KeyboardEvent, roomIndex: number, controlName: string): void {
        const key = event.key;
        const allowedSpecial = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End', 'Enter'];
        const isDigit = /[0-9]/.test(key);
        const isAllowed = isDigit || allowedSpecial.includes(key);
        if (!this.roomNumericTypingInvalid[roomIndex]) this.roomNumericTypingInvalid[roomIndex] = {};
        if (!isAllowed) {
            this.roomNumericTypingInvalid[roomIndex][controlName] = true;
        } else {
            this.roomNumericTypingInvalid[roomIndex][controlName] = false;
        }
    }

    scrollTextToEnd(event: Event): void {
        const el = event.target as HTMLInputElement | HTMLTextAreaElement;
        const len = el.value.length;
        if (typeof (el as any).selectionStart === 'number') {
            (el as any).selectionStart = len;
            (el as any).selectionEnd = len;
        }
        if (el instanceof HTMLTextAreaElement) {
            el.scrollTop = el.scrollHeight;
        } else {
            (el as HTMLInputElement).scrollLeft = (el as HTMLInputElement).scrollWidth;
        }
    }

    generateDescription(): void {
        const v = this.listingForm.value;
        const ready = (
            (v.title && String(v.title).trim().length > 0) &&
            (v.city && String(v.city).trim().length > 0) &&
            (v.address && String(v.address).trim().length > 0) &&
            (v.monthlyPrice !== null && v.monthlyPrice !== undefined && Number(v.monthlyPrice) > 0) &&
            (v.floor !== null && v.floor !== undefined && Number(v.floor) > 0) &&
            (v.areaInSqMeters !== null && v.areaInSqMeters !== undefined && Number(v.areaInSqMeters) > 0) &&
            (v.totalBathrooms !== null && v.totalBathrooms !== undefined && Number(v.totalBathrooms) > 0) &&
            this.rooms.length > 0 &&
            this.rooms.controls.every(r => {
                const val = r.get('pricePerBed')?.value;
                return val !== null && val !== undefined && Number(val) > 0;
            })
        );

        if (!ready) {
            this.listingForm.markAllAsTouched();
            Swal.fire({
                title: 'بيانات غير مكتملة',
                text: '.يرجى إكمال البيانات الأساسية قبل توليد الوصف',
                icon: 'warning',
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#ffc107'
            });
            return;
        }

        this.isGeneratingDescription = true;
        const { description, photos, ...rest } = v;
        const payload = {
            title: String(rest.title || '').trim(),
            city: String(rest.city || '').trim(),
            address: String(rest.address || '').trim(),
            monthlyPrice: Number(rest.monthlyPrice),
            hasElevator: !!rest.hasElevator,
            floor: String(rest.floor ?? ''),
            areaInSqMeters: Number(rest.areaInSqMeters),
            totalBathrooms: Number(rest.totalBathrooms),
            hasKitchen: !!rest.hasKitchen,
            hasInternet: !!rest.hasInternet,
            hasAirConditioner: !!rest.hasAirConditioner,
            isPetFriendly: !!rest.isPetFriendly,
            isSmokingAllowed: !!rest.isSmokingAllowed,
            rooms: (rest.rooms || []).map((room: any) => ({
                roomNumber: Number(room.roomNumber),
                bedsCount: (room.beds || []).length,
                availableBeds: (room.beds || []).filter((b: any) => b.isAvailable).length,
                pricePerBed: Number(room.pricePerBed),
                hasAirConditioner: !!room.hasAirConditioner,
                hasFan: false,
                beds: (room.beds || []).map((bed: any) => ({ isAvailable: !!bed.isAvailable }))
            }))
        };

        this.listingService.generateDescription(payload).subscribe({
            next: (response: any) => {
                const generatedText = typeof response === 'string' ? response : response.description || response;
                this.listingForm.patchValue({ description: generatedText });
                this.isGeneratingDescription = false;
            },
            error: (error) => {
                this.isGeneratingDescription = false;
                const msg = error?.error?.message || 'فشل توليد الوصف. يرجى المحاولة مرة أخرى.';
                Swal.fire({ title: 'خطأ', text: msg, icon: 'error', confirmButtonText: 'حسناً', confirmButtonColor: '#dc3545' });
            }
        });
    }

    onSubmit(): void {
        if (this.listingForm.valid) {
            if (this.selectedFiles.length === 0) {
                Swal.fire({
                    title: 'الصور مطلوبة',
                    text: '.يرجى إضافة صورة واحدة على الأقل قبل النشر',
                    icon: 'warning',
                    confirmButtonText: 'حسناً',
                    confirmButtonColor: '#ffc107'
                });
                return;
            }
            this.isSubmitting = true;
            const formValue = this.listingForm.value;
            const formData = new FormData();

            // Append simple fields with PascalCase keys
            formData.append('Title', formValue.title);
            formData.append('Description', formValue.description);
            formData.append('City', formValue.city);
            formData.append('Address', formValue.address);
            formData.append('MonthlyPrice', formValue.monthlyPrice);
            formData.append('Floor', formValue.floor);
            formData.append('AreaInSqMeters', formValue.areaInSqMeters);
            formData.append('TotalBathrooms', formValue.totalBathrooms);
            formData.append('HasElevator', formValue.hasElevator);
            formData.append('HasKitchen', formValue.hasKitchen);
            formData.append('HasInternet', formValue.hasInternet);
            formData.append('HasAirConditioner', formValue.hasAirConditioner);
            formData.append('HasFans', formValue.hasFans);
            formData.append('IsPetFriendly', formValue.isPetFriendly);
            formData.append('IsSmokingAllowed', formValue.isSmokingAllowed);

            // Append Photos
            this.selectedFiles.forEach(file => {
                formData.append('Photos', file);
            });

            // Prepare Rooms data
            const roomsData = formValue.rooms.map((room: any) => {
                return {
                    RoomNumber: room.roomNumber,
                    PricePerBed: room.pricePerBed,
                    HasAirConditioner: room.hasAirConditioner,
                    HasFan: false, // Default
                    BedsCount: room.beds.length,
                    AvailableBeds: room.beds.filter((b: any) => b.isAvailable).length,
                    Beds: room.beds.map((bed: any) => ({
                        IsAvailable: bed.isAvailable
                    }))
                };
            });

            // Append Rooms as JSON string
            formData.append('rooms', JSON.stringify(roomsData));

            console.log('Submitting FormData...');
            formData.forEach((value, key) => {
                console.log(key + ': ' + value);
            });

            this.listingService.addListing(formData).subscribe({
                next: (response) => {
                    console.log('Listing added successfully:', response);
                    this.isSubmitting = false;

                    Swal.fire({
                        title: 'تم استلام طلبك!',
                        text: 'إعلانك قيد المراجعة حالياً. سيتم إشعارك عند الموافقة عليه.',
                        icon: 'success',
                        confirmButtonText: 'عرض إعلاناتي',
                        confirmButtonColor: '#0d6efd'
                    }).then((result: any) => {
                        if (result.isConfirmed) {
                            this.router.navigate(['/listings/my-listings']);
                        }
                    });
                },
                error: (error) => {
                    console.error('Error adding listing:', error);
                    let errorMessage = 'حدث خطأ أثناء إضافة الإعلان. يرجى المحاولة مرة أخرى.';

                    if (error.error && error.error.errors) {
                        console.error('Validation errors:', error.error.errors);
                        errorMessage = 'يرجى التحقق من البيانات المدخلة.';
                    }
                    if (error.status === 0) {
                        errorMessage = 'خطأ في الاتصال. يرجى التأكد من تشغيل الخادم.';
                    }

                    Swal.fire({
                        title: '!خطأ',
                        text: errorMessage,
                        icon: 'error',
                        confirmButtonText: 'حسناً',
                        confirmButtonColor: '#dc3545'
                    });

                    this.isSubmitting = false;
                }
            });
        } else {
            this.listingForm.markAllAsTouched();
            Swal.fire({
                title: 'بيانات غير مكتملة',
                text: '.يرجى ملء جميع الحقول المطلوبة بشكل صحيح',
                icon: 'warning',
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#ffc107'
            });
        }
    }
}
