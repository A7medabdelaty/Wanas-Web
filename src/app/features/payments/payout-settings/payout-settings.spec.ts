import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayoutSettings } from './payout-settings';

describe('PayoutSettings', () => {
  let component: PayoutSettings;
  let fixture: ComponentFixture<PayoutSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayoutSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayoutSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
