import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingPhotos } from './listing-photos';

describe('ListingPhotos', () => {
  let component: ListingPhotos;
  let fixture: ComponentFixture<ListingPhotos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingPhotos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListingPhotos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
