/**
 * Profile Picture Upload Component
 * Supports Requirements: 4.2 - Profile picture management
 */

import React, { useState, useRef } from 'react';
import './ProfilePictureUpload.css';

interface ProfilePictureUploadProps {
  currentPicture?: string;
  userName: string;
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentPicture,
  userName,
  onUpload,
  onRemove,
  disabled = false,
  size = 'medium'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, or WebP)';
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      await onUpload(file);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError('Failed to upload image. Please try again.');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const displayImage = previewUrl || currentPicture;

  return (
    <div className={`profile-picture-upload ${size} ${disabled ? 'disabled' : ''}`}>
      <div className="picture-container">
        <div className="picture-display" onClick={triggerFileSelect}>
          {displayImage ? (
            <img
              src={displayImage}
              alt={`${userName}'s profile`}
              className="profile-image"
            />
          ) : (
            <div className="profile-initials">
              {getInitials(userName)}
            </div>
          )}
          
          {isUploading && (
            <div className="upload-overlay">
              <div className="upload-spinner"></div>
            </div>
          )}
          
          {!disabled && (
            <div className="upload-overlay-hover">
              <div className="upload-icon">📷</div>
              <span>Change Photo</span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="file-input"
          disabled={disabled || isUploading}
        />
      </div>

      <div className="picture-actions">
        {!disabled && (
          <>
            <button
              type="button"
              onClick={triggerFileSelect}
              className="btn-upload"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : displayImage ? 'Change Photo' : 'Upload Photo'}
            </button>
            
            {(displayImage || currentPicture) && onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                className="btn-remove"
                disabled={isUploading}
              >
                Remove
              </button>
            )}
          </>
        )}
      </div>

      {uploadError && (
        <div className="upload-error">
          {uploadError}
        </div>
      )}

      <div className="upload-guidelines">
        <p>Recommended: Square image, at least 200x200px</p>
        <p>Max file size: 5MB • Formats: JPEG, PNG, WebP</p>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;