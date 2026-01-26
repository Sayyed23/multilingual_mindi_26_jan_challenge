/**
 * Secure token storage utility
 * Provides secure storage for JWT tokens with encryption
 * Supports Requirements: 4.1 - Secure storage of authentication tokens
 */

// Simple encryption/decryption for token storage
// In production, consider using more robust encryption
class TokenStorage {
  private readonly ACCESS_TOKEN_KEY = 'mandi_access_token';
  private readonly REFRESH_TOKEN_KEY = 'mandi_refresh_token';
  private readonly ENCRYPTION_KEY = 'mandi_secure_key_2024';

  /**
   * Store access token securely
   */
  setAccessToken(token: string): void {
    try {
      const encrypted = this.encrypt(token);
      localStorage.setItem(this.ACCESS_TOKEN_KEY, encrypted);
    } catch (error) {
      console.error('Failed to store access token:', error);
    }
  }

  /**
   * Retrieve access token
   */
  getAccessToken(): string | null {
    try {
      const encrypted = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      if (!encrypted) return null;
      return this.decrypt(encrypted);
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
      this.clearAccessToken();
      return null;
    }
  }

  /**
   * Store refresh token securely
   */
  setRefreshToken(token: string): void {
    try {
      const encrypted = this.encrypt(token);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, encrypted);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
  }

  /**
   * Retrieve refresh token
   */
  getRefreshToken(): string | null {
    try {
      const encrypted = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!encrypted) return null;
      return this.decrypt(encrypted);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      this.clearRefreshToken();
      return null;
    }
  }

  /**
   * Clear access token
   */
  clearAccessToken(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Clear refresh token
   */
  clearRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Clear all tokens
   */
  clearAllTokens(): void {
    this.clearAccessToken();
    this.clearRefreshToken();
  }

  /**
   * Check if tokens exist
   */
  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }

  /**
   * Simple encryption (for demo purposes)
   * In production, use proper encryption libraries
   */
  private encrypt(text: string): string {
    try {
      // Simple XOR encryption for demo
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length)
        );
      }
      return btoa(result);
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  /**
   * Simple decryption (for demo purposes)
   */
  private decrypt(encryptedText: string): string {
    try {
      const text = atob(encryptedText);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length)
        );
      }
      return result;
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }
}

// Export singleton instance
export const tokenStorage = new TokenStorage();
export default tokenStorage;