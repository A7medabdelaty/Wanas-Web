import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewAdd } from './review-add';

describe('ReviewAdd', () => {
  let component: ReviewAdd;
  let fixture: ComponentFixture<ReviewAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
