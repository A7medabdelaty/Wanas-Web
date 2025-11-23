import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpInterceptor } from './http-interceptor';

describe('HttpInterceptor', () => {
  let component: HttpInterceptor;
  let fixture: ComponentFixture<HttpInterceptor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpInterceptor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HttpInterceptor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
