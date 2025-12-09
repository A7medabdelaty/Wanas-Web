import { UserRole } from "../../layout/appbar/user-role.enum";

// Login Request
export interface LoginRequest {
  email: string;
  password: string;
}

// Login Response
export interface LoginResponse {
  id: string;
  email: string;
  fullName: string;
  photoURL: string;
  token: string;
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiration: string;
  isFirstLogin: boolean | null;
  isProfileCompleted: boolean;
  isPreferenceCompleted: boolean;
  role: string;
}

// Register Request
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  city: string;
  phoneNumber: string;
  profileType: number; // 1 = Owner, 2 = Renter
}

// Confirm Email Request
export interface ConfirmEmailRequest {
  userId: string;
  code: string;
}

// Resend Confirmation Email Request
export interface ResendConfirmationEmailRequest {
  email: string;
}

// Forget Password Request
export interface ForgetPasswordRequest {
  email: string;
}

// Reset Password Request
export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

// User Info (Local Storage)
export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  photoURL: string;

  isFirstLogin: boolean | null;
  isProfileCompleted: boolean;
  isPreferenceCompleted: boolean;
  role: UserRole;
}