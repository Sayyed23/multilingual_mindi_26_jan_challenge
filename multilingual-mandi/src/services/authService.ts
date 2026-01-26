/**
 * Authentication Service for OTP-based authentication
 * Supports Requirements: 4.1 - Mobile number verification through OTP
 */

import { 
  LoginRequest, 
  LoginResponse, 
  OtpRequest, 
  OtpResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse,
  CreateUserRequest,
  CreateUserResponse,
  ApiResponse 
} from '../types/api';
import { AuthUser } from '../types/user';

const API_BASE_URL = (typeof window !== 'undefined' && (window as any).ENV?.VITE_API_BASE_URL) || 'http://localhost:3000/api';

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage();
  }

  /**
   * Request OTP for phone number verification
   */
  async requestOtp(phoneNumber: string, purpose: 'login' | 'registration' | 'verification' = 'login'): Promise<OtpResponse> {
    const request: OtpRequest = {
      phoneNumber,
      purpose
    };

    const response = await this.makeRequest<OtpResponse>('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify(request)
    });

    return response.data!;
  }

  /**
   * Verify OTP and login user
   */
  async verifyOtpAndLogin(phoneNumber: string, otp: string): Promise<LoginResponse> {
    const request: LoginRequest = {
      phoneNumber,
      otp,
      deviceInfo: {
        deviceId: this.getDeviceId(),
        platform: this.getPlatform(),
        version: '1.0.0'
      }
    };

    const response = await this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(request)
    });

    const loginData = response.data!;
    
    // Store tokens
    this.setTokens(loginData.user.accessToken, loginData.user.refreshToken);
    
    return loginData;
  }

  /**
   * Register new user with OTP verification
   */
  async registerUser(userData: CreateUserRequest, otp: string): Promise<CreateUserResponse> {
    const response = await this.makeRequest<CreateUserResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...userData,
        otp
      })
    });

    const registerData = response.data!;
    
    // Store tokens
    this.setTokens(registerData.authTokens.accessToken, registerData.authTokens.refreshToken);
    
    return registerData;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<RefreshTokenResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const request: RefreshTokenRequest = {
      refreshToken: this.refreshToken
    };

    const response = await this.makeRequest<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(request)
    });

    const refreshData = response.data!;
    
    // Update stored tokens
    this.setTokens(refreshData.accessToken, refreshData.refreshToken);
    
    return refreshData;
  }

  /**
   * Logout user and clear tokens
   */
  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await this.makeRequest('/auth/logout', {
          method: 'POST'
        });
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Get current authentication status
   */
  isAuthenticated(): boolean {
    return !!this.accessToken && !this.isTokenExpired(this.accessToken);
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get current user from token (basic info)
   */
  getCurrentUser(): Partial<AuthUser> | null {
    if (!this.accessToken) return null;
    
    try {
      const payload = this.decodeJwtPayload(this.accessToken);
      return {
        id: payload.sub,
        phoneNumber: payload.phoneNumber,
        name: payload.name,
        userType: payload.userType,
        isVerified: payload.isVerified,
        preferredLanguage: payload.preferredLanguage
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Set authentication tokens
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    // Store in localStorage for persistence
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Clear authentication tokens
   */
  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokensFromStorage(): void {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
      // Verify token is not expired
      if (!this.isTokenExpired(accessToken)) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
      } else {
        // Try to refresh if refresh token is valid
        if (!this.isTokenExpired(refreshToken)) {
          this.refreshToken = refreshToken;
          this.refreshAccessToken().catch(() => {
            this.clearTokens();
          });
        } else {
          this.clearTokens();
        }
      }
    }
  }

  /**
   * Check if JWT token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeJwtPayload(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Decode JWT payload
   */
  private decodeJwtPayload(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  /**
   * Get device ID (simplified implementation)
   */
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'web_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  /**
   * Get platform information
   */
  private getPlatform(): string {
    return 'web';
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    // Add authorization header if token is available
    if (this.accessToken && !endpoint.includes('/auth/')) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle token expiry
        if (response.status === 401 && this.refreshToken) {
          try {
            await this.refreshAccessToken();
            // Retry the original request with new token
            headers.Authorization = `Bearer ${this.accessToken}`;
            const retryResponse = await fetch(url, { ...config, headers });
            return await retryResponse.json();
          } catch (refreshError) {
            this.clearTokens();
            throw new Error('Authentication failed');
          }
        }
        
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;