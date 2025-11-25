import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferenceAdd } from './preference-add';

describe('PreferenceAdd', () => {
  let component: PreferenceAdd;
  let fixture: ComponentFixture<PreferenceAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreferenceAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreferenceAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
