import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferenceEdit } from './preference-edit';

describe('PreferenceEdit', () => {
  let component: PreferenceEdit;
  let fixture: ComponentFixture<PreferenceEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreferenceEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreferenceEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
