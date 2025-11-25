// Login Request (اللي هنبعته للـ API)
export interface LoginRequest {
  email: string;
  password: string;
}

// Login Response (اللي هيرجع من الـ API)
export interface LoginResponse {
  id: string;
  email: string;
  fullName: string;
  token: string;
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiration: string;
  isFirstLogin: boolean | null;
  isProfileCompleted: boolean;
  isPreferenceCompleted: boolean;
}

// Register Request
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  city: string;
  profileType: number;  // 1 = Owner, 2 = Renter
}

// User Info (للحفظ في localStorage)
export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  isFirstLogin: boolean | null;
  isProfileCompleted: boolean;
  isPreferenceCompleted: boolean;
}