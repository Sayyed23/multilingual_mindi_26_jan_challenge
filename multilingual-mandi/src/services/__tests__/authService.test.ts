/**
 * Unit tests for Authentication Service
 * Tests OTP-based authentication functionality
 * Supports Requirements: 4.1 - Mobile number verification through OTP
 */

import { authService } from '../authService';

// Mock fetch globally
global.fetch = jest.fn();

describe('AuthService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
  });

  describe('requestOtp', () => {
    it('should request OTP for valid phone number', async () => {
      const mockResponse = {
        success: true,
        data: {
          sent: true,
          expiresIn: 300,
          attemptsRemaining: 3
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await authService.requestOtp('+919876543210', 'login');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/request-otp'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('+919876543210')
        })
      );

      expect(result).toEqual({
        sent: true,
        expiresIn: 300,
        attemptsRemaining: 3
      });
    });

    it('should handle OTP request failure', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { message: 'Invalid phone number' }
        })
      });

      await expect(
        authService.requestOtp('+91invalid', 'login')
      ).rejects.toThrow('Invalid phone number');
    });
  });

  describe('verifyOtpAndLogin', () => {
    it('should verify OTP and login successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: {
            id: 'user123',
            phoneNumber: '+919876543210',
            name: 'Test User',
            userType: 'buyer',
            isVerified: true,
            preferredLanguage: 'en',
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token'
          },
          isNewUser: false
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await authService.verifyOtpAndLogin('+919876543210', '123456');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('123456')
        })
      );

      expect(result.user.id).toBe('user123');
      expect(result.user.phoneNumber).toBe('+919876543210');
    });

    it('should handle invalid OTP', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { message: 'Invalid OTP' }
        })
      });

      await expect(
        authService.verifyOtpAndLogin('+919876543210', '000000')
      ).rejects.toThrow('Invalid OTP');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token is stored', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return true when valid token is stored', () => {
      // Mock a valid JWT token (simplified)
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjo5OTk5OTk5OTk5fQ.mock-signature';
      localStorage.setItem('accessToken', mockToken);
      
      // Create new instance to load from storage
      const newAuthService = new (authService.constructor as any)();
      expect(newAuthService.isAuthenticated()).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear tokens on logout', async () => {
      // Set up tokens
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('refreshToken', 'mock-refresh');

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await authService.logout();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('should clear tokens even if logout request fails', async () => {
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('refreshToken', 'mock-refresh');

      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await authService.logout();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no token is available', () => {
      expect(authService.getCurrentUser()).toBeNull();
    });

    it('should decode user info from valid token', () => {
      // Mock JWT token with user data
      const payload = {
        sub: 'user123',
        phoneNumber: '+919876543210',
        name: 'Test User',
        userType: 'buyer',
        isVerified: true,
        preferredLanguage: 'en',
        exp: 9999999999
      };
      
      const mockToken = `header.${btoa(JSON.stringify(payload))}.signature`;
      
      // Manually set token to test decoding
      (authService as any).accessToken = mockToken;
      
      const user = authService.getCurrentUser();
      
      expect(user).toEqual({
        id: 'user123',
        phoneNumber: '+919876543210',
        name: 'Test User',
        userType: 'buyer',
        isVerified: true,
        preferredLanguage: 'en'
      });
    });
  });
});