import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppbarComponent } from './appbar';
import { UserRole } from './user-role.enum';

describe('AppbarComponent', () => {
  let component: AppbarComponent;
  let fixture: ComponentFixture<AppbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppbarComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AppbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with guest role', () => {
    expect(component.userRole).toBe(UserRole.Guest);
  });

  it('should toggle mobile menu', () => {
    expect(component.isMobileMenuOpen).toBe(false);
    component.toggleMobileMenu();
    expect(component.isMobileMenuOpen).toBe(true);
    component.toggleMobileMenu();
    expect(component.isMobileMenuOpen).toBe(false);
  });

  it('should filter nav items based on user role', () => {
    component.userRole = UserRole.Guest;
    const guestItems = component.filteredNavItems;
    expect(guestItems.length).toBeGreaterThan(0);
    expect(guestItems.every(item => item.roles.includes(UserRole.Guest))).toBe(true);

    component.userRole = UserRole.Admin;
    const adminItems = component.filteredNavItems;
    expect(adminItems.some(item => item.label === 'لوحة التحكم')).toBe(true);
  });

  it('should return true for isGuest when user role is guest', () => {
    component.userRole = UserRole.Guest;
    expect(component.isGuest).toBe(true);

    component.userRole = UserRole.Admin;
    expect(component.isGuest).toBe(false);
  });

  it('should reset to guest role on logout', () => {
    component.userRole = UserRole.Admin;
    component.userName = 'أحمد';
    component.logout();
    expect(component.userRole).toBe(UserRole.Guest);
    expect(component.userName).toBe('المستخدم');
  });

  it('should close mobile menu on Escape key', () => {
    component.isMobileMenuOpen = true;
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);
    expect(component.isMobileMenuOpen).toBe(false);
  });
});
