/**
 * User Profile Service for managing user profiles and business information
 * Supports Requirements: 4.2, 4.5 - User profile management and business verification
 */

import { 
  User, 
  UserProfile, 
  UserUpdate, 
  UserRegistration,
  BusinessInfo,
  Location 
} from '../types/user';
import { GeoLocation } from '../types/price';
import { 
  GetUserResponse,
  UpdateUserRequest,
  CreateUserRequest,
  FileUploadRequest,
  FileUploadResponse,
  ApiResponse 
} from '../types/api';
import { authService } from './authService';

const API_BASE_URL = (typeof window !== 'undefined' && (window as any).ENV?.VITE_API_BASE_URL) || 'http://localhost:3000/api';

class UserService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<User> {
    const response = await this.makeRequest<GetUserResponse>(`/users/${userId}`);
    return response.data!.user;
  }

  /**
   * Get current user's profile
   */
  async getCurrentUserProfile(): Promise<User> {
    const response = await this.makeRequest<GetUserResponse>('/users/me');
    return response.data!.user;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: UserUpdate): Promise<User> {
    const request: UpdateUserRequest = updates;
    
    const response = await this.makeRequest<GetUserResponse>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(request)
    });
    
    return response.data!.user;
  }

  /**
   * Update current user's profile
   */
  async updateCurrentUserProfile(updates: UserUpdate): Promise<User> {
    const request: UpdateUserRequest = updates;
    
    const response = await this.makeRequest<GetUserResponse>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(request)
    });
    
    return response.data!.user;
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'profile_picture');

    const response = await this.makeRequest<FileUploadResponse>('/files/upload', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });

    return response.data!.url;
  }

  /**
   * Update business information
   */
  async updateBusinessInfo(userId: string, businessInfo: Partial<BusinessInfo>): Promise<User> {
    return this.updateUserProfile(userId, { businessProfile: businessInfo });
  }

  /**
   * Update current user's business information
   */
  async updateCurrentUserBusinessInfo(businessInfo: Partial<BusinessInfo>): Promise<User> {
    return this.updateCurrentUserProfile({ businessProfile: businessInfo });
  }

  /**
   * Update user location
   */
  async updateUserLocation(userId: string, location: Partial<Location>): Promise<User> {
    return this.updateUserProfile(userId, { location });
  }

  /**
   * Update current user's location
   */
  async updateCurrentUserLocation(location: Partial<Location>): Promise<User> {
    return this.updateCurrentUserProfile({ location });
  }

  /**
   * Upload business verification documents
   */
  async uploadVerificationDocument(file: File, documentType: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'verification_document');
    formData.append('documentType', documentType);

    const response = await this.makeRequest<FileUploadResponse>('/files/upload', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });

    return response.data!.url;
  }

  /**
   * Submit business verification request
   */
  async submitBusinessVerification(
    businessInfo: BusinessInfo,
    documents: { type: string; url: string }[]
  ): Promise<User> {
    const updatedBusinessInfo = {
      ...businessInfo,
      verificationDocuments: documents.map(doc => doc.url)
    };

    const response = await this.makeRequest<GetUserResponse>('/users/me/verify-business', {
      method: 'POST',
      body: JSON.stringify({
        businessInfo: updatedBusinessInfo,
        documents
      })
    });

    return response.data!.user;
  }

  /**
   * Search users by criteria
   */
  async searchUsers(query: {
    name?: string;
    userType?: string;
    location?: GeoLocation;
    verified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<UserProfile[]> {
    const searchParams = new URLSearchParams();
    
    if (query.name) searchParams.append('name', query.name);
    if (query.userType) searchParams.append('userType', query.userType);
    if (query.verified !== undefined) searchParams.append('verified', query.verified.toString());
    if (query.limit) searchParams.append('limit', query.limit.toString());
    if (query.offset) searchParams.append('offset', query.offset.toString());
    
    if (query.location) {
      searchParams.append('lat', query.location.latitude.toString());
      searchParams.append('lng', query.location.longitude.toString());
      searchParams.append('radius', (query.location.radius || 50).toString());
    }

    const response = await this.makeRequest<{ users: UserProfile[] }>(`/users/search?${searchParams}`);
    return response.data!.users;
  }

  /**
   * Get user's reputation history
   */
  async getUserReputationHistory(userId: string): Promise<{
    reviews: Array<{
      id: string;
      reviewerId: string;
      reviewerName: string;
      rating: number;
      comment: string;
      dealId: string;
      createdAt: Date;
    }>;
    averageRating: number;
    totalReviews: number;
  }> {
    const response = await this.makeRequest<any>(`/users/${userId}/reputation`);
    return response.data!;
  }

  /**
   * Validate profile data
   */
  validateProfileData(data: Partial<UserUpdate>): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    // Name validation
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters long';
      } else if (data.name.length > 50) {
        errors.name = 'Name must be less than 50 characters';
      }
    }

    // Email validation
    if (data.email !== undefined && data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Location validation
    if (data.location) {
      if (data.location.pincode && !/^\d{6}$/.test(data.location.pincode)) {
        errors.pincode = 'Pincode must be 6 digits';
      }
      if (data.location.address && data.location.address.length < 10) {
        errors.address = 'Address must be at least 10 characters long';
      }
    }

    // Business profile validation
    if (data.businessProfile) {
      if (data.businessProfile.businessName && data.businessProfile.businessName.length < 2) {
        errors.businessName = 'Business name must be at least 2 characters long';
      }
      if (data.businessProfile.gstNumber && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(data.businessProfile.gstNumber)) {
        errors.gstNumber = 'Please enter a valid GST number';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
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

    // Add authorization header
    const accessToken = authService.getAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
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
        if (response.status === 401 && accessToken) {
          try {
            await authService.refreshAccessToken();
            // Retry the original request with new token
            const newToken = authService.getAccessToken();
            if (newToken) {
              headers.Authorization = `Bearer ${newToken}`;
              const retryResponse = await fetch(url, { ...config, headers });
              return await retryResponse.json();
            }
          } catch (refreshError) {
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
export const userService = new UserService();
export default userService;