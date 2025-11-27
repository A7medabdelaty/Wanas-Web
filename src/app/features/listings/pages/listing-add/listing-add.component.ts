import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

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

    constructor(private fb: FormBuilder) { }

    ngOnInit(): void {
        this.initForm();
    }

    private initForm(): void {
        this.listingForm = this.fb.group({
            title: ['', Validators.required],
            city: ['', Validators.required],
            address: ['', Validators.required],
            monthlyPrice: [0, [Validators.required, Validators.min(0)]],
            hasElevator: [false],
            floor: ['', Validators.required],
            areaInSqMeters: [0, [Validators.required, Validators.min(0)]],
            totalBathrooms: [0, [Validators.required, Validators.min(0)]],
            hasKitchen: [false],
            hasInternet: [false],
            hasAirConditioner: [false],
            isPetFriendly: [false],
            isSmokingAllowed: [false],
            rooms: this.fb.array([]),
            description: [''],
            photos: this.fb.array([]) // Placeholder for photos
        });

        // Add one initial room
        this.addRoom();
    }

    get rooms(): FormArray {
        return this.listingForm.get('rooms') as FormArray;
    }

    getBeds(roomIndex: number): FormArray {
        return this.rooms.at(roomIndex).get('beds') as FormArray;
    }

    createRoom(): FormGroup {
        return this.fb.group({
            roomNumber: [this.rooms.length + 1, Validators.required],
            bedsCount: [0, [Validators.required, Validators.min(0)]],
            availableBeds: [0, [Validators.required, Validators.min(0)]],
            pricePerBed: [0, [Validators.required, Validators.min(0)]],
            hasAirConditioner: [false],
            beds: this.fb.array([])
        });
    }

    createBed(): FormGroup {
        return this.fb.group({
            isAvailable: [true]
        });
    }

    addRoom(): void {
        this.rooms.push(this.createRoom());
    }

    removeRoom(index: number): void {
        this.rooms.removeAt(index);
        // Re-index room numbers if needed
        this.rooms.controls.forEach((control, i) => {
            control.get('roomNumber')?.setValue(i + 1);
        });
    }

    addBed(roomIndex: number): void {
        const beds = this.getBeds(roomIndex);
        beds.push(this.createBed());

        // Update beds count automatically
        const room = this.rooms.at(roomIndex);
        room.patchValue({
            bedsCount: beds.length,
            availableBeds: beds.controls.filter(b => b.get('isAvailable')?.value).length
        });
    }

    removeBed(roomIndex: number, bedIndex: number): void {
        const beds = this.getBeds(roomIndex);
        beds.removeAt(bedIndex);

        // Update beds count automatically
        const room = this.rooms.at(roomIndex);
        room.patchValue({
            bedsCount: beds.length,
            availableBeds: beds.controls.filter(b => b.get('isAvailable')?.value).length
        });
    }

    generateDescription(): void {
        this.isGeneratingDescription = true;
        const formData = this.listingForm.value;

        // Exclude description and photos from the payload
        const { description, photos, ...payload } = formData;

        console.log('Generating description with payload:', payload);

        // Simulate API call
        setTimeout(() => {
            const generatedText = `This is a generated description for a lovely apartment in ${payload.city}. It features ${payload.rooms.length} rooms and costs ${payload.monthlyPrice} per month.`;

            this.listingForm.patchValue({
                description: generatedText
            });

            this.isGeneratingDescription = false;
        }, 1500);
    }

    onSubmit(): void {
        if (this.listingForm.valid) {
            console.log('Form Submitted:', this.listingForm.value);
            // Handle form submission
        } else {
            this.listingForm.markAllAsTouched();
        }
    }
}
