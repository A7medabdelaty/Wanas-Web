import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-listing-add',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './listing-add.component.html',
    styleUrls: ['./listing-add.component.css']
})
export class ListingAddComponent implements OnInit {
    listingForm!: FormGroup;
    isGeneratingDescription = false;
    isSubmitting = false;
    selectedFiles: File[] = [];

    constructor(
        private fb: FormBuilder,
        private listingService: ListingService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.initForm();
    }

    private initForm(): void {
        this.listingForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            city: ['', Validators.required],
            address: ['', Validators.required],
            monthlyPrice: [null, [Validators.required, Validators.min(0)]],
            floor: ['', Validators.required],
            areaInSqMeters: [null, [Validators.required, Validators.min(0)]],
            totalBathrooms: [null, [Validators.required, Validators.min(0)]],
            hasElevator: [false],
            hasKitchen: [false],
            hasInternet: [false],
            hasAirConditioner: [false],
            hasFans: [false],
            isPetFriendly: [false],
            isSmokingAllowed: [false],
            rooms: this.fb.array([]),
            photos: this.fb.array([]) // Still used for preview
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
            pricePerBed: [null, Validators.required],
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
        }
    }

    removePhoto(index: number): void {
        this.photos.removeAt(index);
        this.selectedFiles.splice(index, 1); // Remove raw file
    }

    generateDescription(): void {
        this.isGeneratingDescription = true;
        const formData = this.listingForm.value;

        // Exclude description and photos from the payload
        const { description, photos, ...payload } = formData;

        this.listingService.generateDescription(payload).subscribe({
            next: (response: any) => {
                console.log('AI Response:', response);
                const generatedText = typeof response === 'string' ? response : response.description || response;

                this.listingForm.patchValue({
                    description: generatedText
                });
                this.isGeneratingDescription = false;
            },
            error: (error) => {
                console.error('Error generating description:', error);
                if (error.status === 0) {
                    console.error('Network error: Please check if the backend is running and CORS is configured.');
                }
                this.isGeneratingDescription = false;
                // Handle error (e.g., show notification)
            }
        });
    }

    onSubmit(): void {
        if (this.listingForm.valid) {
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
                        title: 'تمت الإضافة بنجاح!',
                        text: 'تم نشر وحدتك السكنية بنجاح.',
                        icon: 'success',
                        confirmButtonText: 'حسناً',
                        confirmButtonColor: '#0d6efd'
                    }).then((result: any) => {
                        if (result.isConfirmed) {
                            this.router.navigate(['/home']);
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
                        title: 'خطأ!',
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
                text: 'يرجى ملء جميع الحقول المطلوبة بشكل صحيح.',
                icon: 'warning',
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#ffc107'
            });
        }
    }
}
