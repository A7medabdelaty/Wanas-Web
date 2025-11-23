import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedCard } from './bed-card';

describe('BedCard', () => {
  let component: BedCard;
  let fixture: ComponentFixture<BedCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
