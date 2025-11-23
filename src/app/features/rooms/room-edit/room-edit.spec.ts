import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomEdit } from './room-edit';

describe('RoomEdit', () => {
  let component: RoomEdit;
  let fixture: ComponentFixture<RoomEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
