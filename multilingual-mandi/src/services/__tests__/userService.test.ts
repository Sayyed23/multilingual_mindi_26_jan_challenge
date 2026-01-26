/**
 * UserService Tests
 * Tests user profile management service functionality
 */

import { userService } from '../userService';
import { authService } from '../authService';
import { User, UserUpdate, BusinessInfo } from '../../types/user';

// Mock authService
jest.mock('../authService');
const mockAuthService = authService as jest.Mocked<typeof authService>;

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock user data
const mockUser: User = {
  id: '1',
  phoneNumber: '+919876543210',
  name: 'John Doe',
  email: 'john@example.com',
  preferredLanguage: 'hi',
  userType: 'vendor',
  location: {
    latitude: 28.6139,
    longitude: 77.2090,
    address: '123 Main Street, New Delhi',
    pincode: '110001',
    state: 'Delhi',
    district: 'Central Delhi'
  },
  businessProfile: {
    businessName: 'John\'s Farm',
    businessType: 'Farmer',
    gstNumber: '07AAACG2115R1ZN',
    specializations: ['Rice', 'Wheat'],
    operatingHours: 'Mon-Sat 9:00 AM - 6:00 PM',
    verificationDocuments: []
  },
  reputation: {
    overall: 4.5,
    punctuality: 4.2,
    communication: 4.8,
    productQuality: 4.3,
    totalTransactions: 25,
    reviewCount: 20,
    lastUpdated: new Date()
  },
  isVerified: true,
  isPhoneVerified: true,
  isBusinessVerified: false,
  profilePicture: 'https://example.com/profile.jpg',
  createdAt: new Date(),
  lastActiveAt: new Date(),
  settings: {
    notifications: {
      deals: true,
      messages: true,
      priceAlerts: true,
      marketUpdates: true
    },
    privacy: {
      showPhoneNumber: false,
      showLocation: true,
      allowDirectMessages: true
    },
    language: {
      preferred: 'hi',
      fallback: 'en',
      autoTranslate: true
    }
  }
};

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService.getAccessToken.mockReturnValue('mock-token');
  });

  describe('getCurrentUserProfile', () => {
    it('fetches current user profile successfully', async () => {
      const mockResponse = {
        success: true,
        data: { user: mockUser }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await userService.getCurrentUserProfile();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
      expect(result).toEqual(mockUser);
    });

    it('handles API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: 'User not found' } })
      } as Response);

      await expect(userService.getCurrentUserProfile()).rejects.toThrow('User not found');
    });
  });

  describe('updateCurrentUserProfile', () => {
    it('updates user profile successfully', async () => {
      const updateData: UserUpdate = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      const updatedUser = { ...mockUser, ...updateData };
      const mockResponse = {
        success: true,
        data: { user: updatedUser }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await userService.updateCurrentUserProfile(updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/me',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          }),
          body: JSON.stringify(updateData)
        })
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('uploadProfilePicture', () => {
    it('uploads profile picture successfully', async () => {
      const mockFile = new File(['test'], 'profile.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        success: true,
        data: { url: 'https://example.com/uploaded-profile.jpg' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await userService.uploadProfilePicture(mockFile);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/files/upload',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
      expect(result).toBe('https://example.com/uploaded-profile.jpg');
    });
  });

  describe('updateCurrentUserBusinessInfo', () => {
    it('updates business information successfully', async () => {
      const businessInfo: Partial<BusinessInfo> = {
        businessName: 'Updated Farm',
        businessType: 'Wholesaler'
      };

      const updatedUser = {
        ...mockUser,
        businessProfile: { ...mockUser.businessProfile!, ...businessInfo }
      };
      const mockResponse = {
        success: true,
        data: { user: updatedUser }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await userService.updateCurrentUserBusinessInfo(businessInfo);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/me',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ businessProfile: businessInfo })
        })
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('searchUsers', () => {
    it('searches users with query parameters', async () => {
      const query = {
        name: 'John',
        userType: 'vendor',
        verified: true,
        limit: 10
      };

      const mockUsers = [mockUser];
      const mockResponse = {
        success: true,
        data: { users: mockUsers }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await userService.searchUsers(query);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/search?name=John&userType=vendor&verified=true&limit=10'),
        expect.any(Object)
      );
      expect(result).toEqual(mockUsers);
    });

    it('searches users with location parameters', async () => {
      const query = {
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          radius: 10
        }
      };

      const mockUsers = [mockUser];
      const mockResponse = {
        success: true,
        data: { users: mockUsers }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await userService.searchUsers(query);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('lat=28.6139&lng=77.209&radius=10'),
        expect.any(Object)
      );
      expect(result).toEqual(mockUsers);
    });
  });

  describe('validateProfileData', () => {
    it('validates valid profile data', () => {
      const validData: UserUpdate = {
        name: 'John Doe',
        email: 'john@example.com',
        location: {
          address: '123 Main Street, New Delhi',
          pincode: '110001',
          state: 'Delhi'
        }
      };

      const result = userService.validateProfileData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('validates invalid name', () => {
      const invalidData: UserUpdate = {
        name: 'A'
      };

      const result = userService.validateProfileData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name must be at least 2 characters long');
    });

    it('validates long name', () => {
      const invalidData: UserUpdate = {
        name: 'A'.repeat(51)
      };

      const result = userService.validateProfileData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name must be less than 50 characters');
    });

    it('validates invalid email', () => {
      const invalidData: UserUpdate = {
        email: 'invalid-email'
      };

      const result = userService.validateProfileData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Please enter a valid email address');
    });

    it('validates invalid pincode', () => {
      const invalidData: UserUpdate = {
        location: {
          pincode: '12345'
        }
      };

      const result = userService.validateProfileData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.pincode).toBe('Pincode must be 6 digits');
    });

    it('validates short address', () => {
      const invalidData: UserUpdate = {
        location: {
          address: 'Short'
        }
      };

      const result = userService.validateProfileData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.address).toBe('Address must be at least 10 characters long');
    });

    it('validates invalid GST number', () => {
      const invalidData: UserUpdate = {
        businessProfile: {
          gstNumber: 'invalid-gst'
        }
      };

      const result = userService.validateProfileData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.gstNumber).toBe('Please enter a valid GST number');
    });

    it('validates short business name', () => {
      const invalidData: UserUpdate = {
        businessProfile: {
          businessName: 'A'
        }
      };

      const result = userService.validateProfileData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.businessName).toBe('Business name must be at least 2 characters long');
    });
  });

  describe('token refresh handling', () => {
    it('refreshes token on 401 error and retries request', async () => {
      // First call returns 401
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: { message: 'Unauthorized' } })
        } as Response)
        // Second call (after refresh) succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { user: mockUser } })
        } as Response);

      mockAuthService.refreshAccessToken.mockResolvedValueOnce({
        accessToken: 'new-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600
      });
      mockAuthService.getAccessToken.mockReturnValueOnce('new-token');

      const result = await userService.getCurrentUserProfile();

      expect(mockAuthService.refreshAccessToken).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockUser);
    });

    it('throws error when refresh fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Unauthorized' } })
      } as Response);

      mockAuthService.refreshAccessToken.mockRejectedValueOnce(new Error('Refresh failed'));

      await expect(userService.getCurrentUserProfile()).rejects.toThrow('Authentication failed');
    });
  });
});