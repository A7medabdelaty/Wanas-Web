import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { AuthService } from '../../../../core/services/auth';
import { ListingDetailsDto } from '../../models/listing';
import { Subject, forkJoin, of, takeUntil, Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { CITIES } from '../../../../core/constants/cities';

@Component({
  selector: 'app-listing-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './listing-edit.html',
  styleUrl: './listing-edit.css',
})
export class ListingEdit implements OnInit, OnDestroy {
  listingForm!: FormGroup;
  isGeneratingDescription = false;
  isSubmitting = false;
  selectedFiles: File[] = [];
  existingPhotos: { id: number; url: string }[] = [];
  deletedPhotoIds: number[] = []; // Track photos to delete
  originalFormValue: any = null; // Store original form values
  listingId!: number;
  listing?: ListingDetailsDto;
  isLoading = true;
  isOwner = false;
  hasChanges = false; // Track if form has changes
  private destroy$ = new Subject<void>();
  private titlePattern = /^(?=.*\p{L})[\p{L}\d\s\-.,()'،]+$/u;
  private cityPattern = /^[\p{L}\s\-]+$/u;
  private addressPattern = /^[\p{L}\d\s\-.,#/()'،]+$/u;
  private textPattern = /^[\p{L}\d\s\-.,;:!؟!?()'"@&#/%+*=<>\[\]{}،]+$/u;
  numericTypingInvalid: Record<string, boolean> = {};
  roomNumericTypingInvalid: Record<number, Record<string, boolean>> = {};

  cities = CITIES;
  openDropdown: string | null = null;

  constructor(
    private fb: FormBuilder,
    private listingService: ListingService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
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
    const idParam = this.route.snapshot.paramMap.get('id');
    this.listingId = idParam ? Number(idParam) : NaN;

    if (isNaN(this.listingId)) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadListing();
  }

  private loadListing(reloadAfterUpdate: boolean = false): void {
    this.listingService.getListingById(this.listingId).subscribe({
      next: (data) => {
        this.listing = data;

        // Check ownership
        const userInfo = this.authService.getUserInfo();
        const currentUserId = userInfo?.id ?? null;
        this.isOwner = currentUserId !== null && data.ownerId === currentUserId;

        if (!this.isOwner) {
          Swal.fire({
            title: 'غير مصرح',
            text: 'لا يمكنك تعديل هذا الإعلان',
            icon: 'error',
            confirmButtonText: 'حسناً',
            confirmButtonColor: '#dc3545'
          }).then(() => {
            this.router.navigate(['/listings', this.listingId]);
          });
          return;
        }

        this.existingPhotos = data.listingPhotos || [];

        if (!reloadAfterUpdate) {
          this.initForm();
          this.populateForm(data);
        } else {
          // Just update photos and form values without reinitializing
          this.photos.clear();
          this.existingPhotos.forEach(photo => {
            this.photos.push(this.fb.control(photo.url));
          });
          // Repopulate form with updated data
          this.listingForm.patchValue({
            title: data.title,
            description: data.description,
            city: data.city,
            address: data.address,
            monthlyPrice: data.monthlyPrice,
            floor: typeof data.floor === 'number' ? data.floor : (data.floor ? Number(data.floor) : null),
            areaInSqMeters: data.areaInSqMeters,
            totalBathrooms: data.totalBathrooms,
            hasElevator: data.hasElevator,
            hasKitchen: data.hasKitchen,
            hasInternet: data.hasInternet,
            hasAirConditioner: data.hasAirConditioner,
            hasFans: data.hasFans,
            isPetFriendly: data.isPetFriendly,
            isSmokingAllowed: data.isSmokingAllowed
          });
        }

        // Store original form value after population
        this.originalFormValue = this.getFormValueForComparison();
        this.hasChanges = false;

        // Subscribe to form value changes (only if not already subscribed)
        if (!reloadAfterUpdate) {
          this.setupFormChangeDetection();
        }

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire({
          title: 'خطأ',
          text: 'فشل تحميل بيانات الإعلان',
          icon: 'error',
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#dc3545'
        }).then(() => {
          this.router.navigate(['/home']);
        });
      }
    });
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
  }

  private populateForm(listing: ListingDetailsDto): void {
    // Populate basic fields
    this.listingForm.patchValue({
      title: listing.title,
      description: listing.description,
      city: listing.city,
      address: listing.address,
      monthlyPrice: listing.monthlyPrice,
      floor: typeof listing.floor === 'number' ? listing.floor : (listing.floor ? Number(listing.floor) : null),
      areaInSqMeters: listing.areaInSqMeters,
      totalBathrooms: listing.totalBathrooms,
      hasElevator: listing.hasElevator,
      hasKitchen: listing.hasKitchen,
      hasInternet: listing.hasInternet,
      hasAirConditioner: listing.hasAirConditioner,
      hasFans: listing.hasFans,
      isPetFriendly: listing.isPetFriendly,
      isSmokingAllowed: listing.isSmokingAllowed
    });

    // Populate existing photos
    this.existingPhotos.forEach(photo => {
      this.photos.push(this.fb.control(photo.url));
    });

    // Populate rooms and beds
    if (listing.rooms && listing.rooms.length > 0) {
      listing.rooms.forEach(room => {
        const roomGroup = this.fb.group({
          id: [room.roomId], // Store room ID for updates
          roomNumber: [room.roomNumber],
          pricePerBed: [room.pricePerBed, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]],
          hasAirConditioner: [room.hasAirConditioner],
          beds: this.fb.array([])
        });

        const bedsArray = roomGroup.get('beds') as FormArray;
        if (room.beds && room.beds.length > 0) {
          room.beds.forEach((bed: any) => {
            const isOccupied = !!bed.renterId;
            const bedGroup = this.fb.group({
              id: [bed.bedId], // Store bed ID
              isAvailable: [{ value: bed.isAvailable, disabled: isOccupied }], // Disable if occupied
              renterId: [bed.renterId]
            });
            bedsArray.push(bedGroup);
          });
        }

        this.rooms.push(roomGroup);
      });
    } else {
      // Default room if none exist (fallback)
      const roomGroup = this.fb.group({
        roomNumber: [1],
        pricePerBed: [listing.monthlyPrice || 1, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]],
        hasAirConditioner: [false],
        beds: this.fb.array([])
      });
      this.rooms.push(roomGroup);
      this.addBed(0);
    }
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
    this.addBed(this.rooms.length - 1);
  }

  removeRoom(index: number): void {
    const room = this.rooms.at(index);
    const beds = room.get('beds') as FormArray;

    // Check if any bed in the room is occupied
    const hasOccupiedBeds = beds.controls.some(bed => !!bed.get('renterId')?.value);

    if (hasOccupiedBeds) {
      Swal.fire({
        title: 'لا يمكن حذف الغرفة',
        text: 'هذه الغرفة تحتوي على أسرّة محجوزة ولا يمكن حذفها',
        icon: 'warning',
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    this.rooms.removeAt(index);
    this.updateRoomNumbers();
    this.hasChanges = this.hasFormChanged();
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
    const bedGroup = beds.at(bedIndex) as FormGroup;

    if (bedGroup.get('renterId')?.value) {
      Swal.fire({
        title: 'لا يمكن الحذف',
        text: 'هذا السرير محجوز حالياً ولا يمكن حذفه',
        icon: 'warning',
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    beds.removeAt(bedIndex);
    this.hasChanges = this.hasFormChanged();
  }

  isBedOccupied(roomIndex: number, bedIndex: number): boolean {
    const beds = this.getBeds(roomIndex);
    const bedGroup = beds.at(bedIndex) as FormGroup;
    return !!bedGroup.get('renterId')?.value;
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
          // Update change detection after photo is added
          setTimeout(() => {
            this.hasChanges = this.hasFormChanged();
          }, 0);
          this.photos.markAsDirty();
          this.photos.markAsTouched();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removePhoto(index: number): void {
    // Check if it's an existing photo or a new one
    if (index < this.existingPhotos.length) {
      // Mark existing photo for deletion
      const photoToDelete = this.existingPhotos[index];
      if (photoToDelete.id) {
        this.deletedPhotoIds.push(photoToDelete.id);
      }
      // Remove from arrays
      this.existingPhotos.splice(index, 1);
      this.photos.removeAt(index);
    } else {
      // Remove new photo
      const newPhotoIndex = index - this.existingPhotos.length;
      this.photos.removeAt(index);
      this.selectedFiles.splice(newPhotoIndex, 1);
    }
    // Update change detection
    this.hasChanges = this.hasFormChanged();
    this.photos.markAsDirty();
    this.photos.markAsTouched();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Setup form change detection
  private setupFormChangeDetection(): void {
    // Listen to form value changes
    this.listingForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.hasChanges = this.hasFormChanged();
      });

    // Also listen to photo changes (add/remove)
    this.photos.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.hasChanges = this.hasFormChanged();
      });
  }

  // Get form value for comparison (excluding photos array which is complex)
  private getFormValueForComparison(): any {
    const formValue = this.listingForm.value;
    // Normalize rooms for comparison
    const normalizedRooms = (formValue.rooms || []).map((room: any) => ({
      roomNumber: room.roomNumber,
      pricePerBed: room.pricePerBed,
      hasAirConditioner: room.hasAirConditioner,
      bedsCount: room.beds?.length || 0,
      availableBeds: room.beds?.filter((b: any) => b.isAvailable).length || 0
    }));

    return {
      title: formValue.title?.trim() || '',
      description: formValue.description?.trim() || '',
      city: formValue.city?.trim() || '',
      address: formValue.address?.trim() || '',
      monthlyPrice: formValue.monthlyPrice || 0,
      floor: String(formValue.floor || ''),
      areaInSqMeters: formValue.areaInSqMeters || 0,
      totalBathrooms: formValue.totalBathrooms || 0,
      hasElevator: !!formValue.hasElevator,
      hasKitchen: !!formValue.hasKitchen,
      hasInternet: !!formValue.hasInternet,
      hasAirConditioner: !!formValue.hasAirConditioner,
      hasFans: !!formValue.hasFans,
      isPetFriendly: !!formValue.isPetFriendly,
      isSmokingAllowed: !!formValue.isSmokingAllowed,
      rooms: JSON.stringify(normalizedRooms),
      photosCount: this.existingPhotos.length,
      selectedFilesCount: this.selectedFiles.length,
      deletedPhotosCount: this.deletedPhotoIds.length
    };
  }

  // Check if form has been modified
  hasFormChanged(): boolean {
    if (!this.originalFormValue) {
      return false;
    }

    const currentValue = this.getFormValueForComparison();

    // Compare all fields
    for (const key in this.originalFormValue) {
      if (this.originalFormValue[key] !== currentValue[key]) {
        return true;
      }
    }

    return false;
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
      error: () => {
        this.isGeneratingDescription = false;
        Swal.fire({
          title: 'خطأ',
          text: 'فشل توليد الوصف. يرجى المحاولة مرة أخرى.',
          icon: 'error',
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#dc3545'
        });
      }
    });
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

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.listingForm.markAllAsTouched();

    if (this.listingForm.valid) {
      const finalPhotosCount = this.existingPhotos.length + this.selectedFiles.length;
      if (finalPhotosCount === 0) {
        Swal.fire({
          title: 'الصور مطلوبة',
          text: '.يرجى إضافة صورة واحدة على الأقل قبل حفظ التعديلات',
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

      // Append deleted photo IDs
      if (this.deletedPhotoIds.length > 0) {
        formData.append('DeletedPhotoIds', JSON.stringify(this.deletedPhotoIds));
      }

      // Do NOT append photos here; handle via dedicated endpoints below

      // Prepare Rooms data
      const roomsData = formValue.rooms.map((room: any) => {
        return {
          Id: room.id,
          RoomNumber: room.roomNumber,
          PricePerBed: room.pricePerBed,
          HasAirConditioner: room.hasAirConditioner,
          HasFan: false,
          BedsCount: room.beds.length,
          AvailableBeds: room.beds.filter((b: any) => b.isAvailable).length,
          Beds: room.beds.map((bed: any) => ({
            IsAvailable: bed.isAvailable
          }))
        };
      });

      formData.append('rooms', JSON.stringify(roomsData));

      console.log('Updating listing with FormData:');
      formData.forEach((value, key) => {
        console.log(key + ':', value);
      });

      // Run photo deletions and additions first, then update core fields
      const deletions$: Observable<void[] | undefined> =
        this.deletedPhotoIds.length > 0
          ? forkJoin(this.deletedPhotoIds.map(pid => this.listingService.deletePhoto(this.listingId, pid)))
          : of(undefined);

      deletions$.subscribe({
        next: () => {
          const additions$ = this.selectedFiles.length > 0
            ? this.listingService.addPhotos(this.listingId, this.selectedFiles)
            : of(undefined);

          additions$.subscribe({
            next: () => {
              this.listingService.updateListing(this.listingId, formData).subscribe({
                next: () => {
                  this.isSubmitting = false;
                  this.deletedPhotoIds = [];
                  this.selectedFiles = [];
                  this.originalFormValue = this.getFormValueForComparison();
                  this.hasChanges = false;

                  Swal.fire({
                    title: '!تم التحديث بنجاح',
                    text: '.تم تحديث إعلانك بنجاح',
                    icon: 'success',
                    confirmButtonText: 'عرض التفاصيل',
                    confirmButtonColor: '#0d6efd'
                  }).then(() => {
                    this.router.navigate(['/listings', this.listingId]);
                  });
                },
                error: (error) => {
                  console.error('Error updating listing:', error);
                  this.isSubmitting = false;
                }
              });
            },
            error: (error) => {
              console.error('Error adding photos:', error);
              this.isSubmitting = false;
            }
          });
        },
        error: (error: any) => {
          console.error('Error updating listing:', error);
          let errorMessage = 'حدث خطأ أثناء تحديث الإعلان. يرجى المحاولة مرة أخرى.';

          if (error.error && error.error.errors) {
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
