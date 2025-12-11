import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationStatus } from './verification-status';

describe('VerificationStatus', () => {
  let component: VerificationStatus;
  let fixture: ComponentFixture<VerificationStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificationStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerificationStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
