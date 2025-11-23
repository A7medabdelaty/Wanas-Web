import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingEdit } from './listing-edit';

describe('ListingEdit', () => {
  let component: ListingEdit;
  let fixture: ComponentFixture<ListingEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListingEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
