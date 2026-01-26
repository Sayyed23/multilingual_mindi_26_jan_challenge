/**
 * Business Information Form Component
 * Supports Requirements: 4.2 - Business profile management and verification
 */

import React, { useState } from 'react';
import { BusinessInfo } from '../types/user';
import './BusinessInfoForm.css';

interface BusinessInfoFormProps {
  businessInfo?: BusinessInfo;
  onSubmit: (data: Partial<BusinessInfo>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const BusinessInfoForm: React.FC<BusinessInfoFormProps> = ({
  businessInfo,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}) => {
  const [formData, setFormData] = useState<Partial<BusinessInfo>>({
    businessName: businessInfo?.businessName || '',
    businessType: businessInfo?.businessType || '',
    gstNumber: businessInfo?.gstNumber || '',
    specializations: businessInfo?.specializations || [],
    operatingHours: businessInfo?.operatingHours || '',
    verificationDocuments: businessInfo?.verificationDocuments || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSpecialization, setNewSpecialization] = useState('');

  // Business types common in Indian agriculture
  const businessTypes = [
    'Farmer',
    'Wholesaler',
    'Retailer',
    'Distributor',
    'Processor',
    'Exporter',
    'Importer',
    'Commission Agent',
    'Cooperative Society',
    'FPO (Farmer Producer Organization)',
    'Trader',
    'Other'
  ];

  // Common agricultural specializations
  const commonSpecializations = [
    'Rice', 'Wheat', 'Maize', 'Pulses', 'Sugarcane', 'Cotton',
    'Vegetables', 'Fruits', 'Spices', 'Oilseeds', 'Tea', 'Coffee',
    'Dairy Products', 'Poultry', 'Fish', 'Organic Products',
    'Seeds', 'Fertilizers', 'Pesticides', 'Farm Equipment'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations?.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...(prev.specializations || []), newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations?.filter(s => s !== specialization) || []
    }));
  };

  const addCommonSpecialization = (specialization: string) => {
    if (!formData.specializations?.includes(specialization)) {
      setFormData(prev => ({
        ...prev,
        specializations: [...(prev.specializations || []), specialization]
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Business name validation
    if (!formData.businessName || formData.businessName.trim().length < 2) {
      newErrors.businessName = 'Business name must be at least 2 characters long';
    } else if (formData.businessName.length > 100) {
      newErrors.businessName = 'Business name must be less than 100 characters';
    }

    // Business type validation
    if (!formData.businessType) {
      newErrors.businessType = 'Please select a business type';
    }

    // GST number validation (optional but if provided, must be valid)
    if (formData.gstNumber && formData.gstNumber.trim()) {
      const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
      if (!gstRegex.test(formData.gstNumber.trim())) {
        newErrors.gstNumber = 'Please enter a valid GST number (e.g., 22AAAAA0000A1Z5)';
      }
    }

    // Operating hours validation
    if (!formData.operatingHours || formData.operatingHours.trim().length < 5) {
      newErrors.operatingHours = 'Please provide operating hours information';
    }

    // Specializations validation
    if (!formData.specializations || formData.specializations.length === 0) {
      newErrors.specializations = 'Please add at least one specialization';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Business info update failed:', error);
      setErrors({ submit: 'Failed to update business information. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="business-info-form">
      <div className="form-header">
        <h2>{mode === 'create' ? 'Business Information' : 'Edit Business Information'}</h2>
        <p>Provide details about your business to build trust with trading partners</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        {/* Basic Business Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="businessName">Business Name *</label>
            <input
              type="text"
              id="businessName"
              value={formData.businessName || ''}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              className={errors.businessName ? 'error' : ''}
              placeholder="Enter your business name"
              required
            />
            {errors.businessName && <span className="error-message">{errors.businessName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="businessType">Business Type *</label>
            <select
              id="businessType"
              value={formData.businessType || ''}
              onChange={(e) => handleInputChange('businessType', e.target.value)}
              className={errors.businessType ? 'error' : ''}
              required
            >
              <option value="">Select Business Type</option>
              {businessTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.businessType && <span className="error-message">{errors.businessType}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="gstNumber">GST Number (Optional)</label>
            <input
              type="text"
              id="gstNumber"
              value={formData.gstNumber || ''}
              onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
              className={errors.gstNumber ? 'error' : ''}
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
            />
            {errors.gstNumber && <span className="error-message">{errors.gstNumber}</span>}
            <small className="field-help">GST registration helps build trust and enables B2B transactions</small>
          </div>

          <div className="form-group">
            <label htmlFor="operatingHours">Operating Hours *</label>
            <input
              type="text"
              id="operatingHours"
              value={formData.operatingHours || ''}
              onChange={(e) => handleInputChange('operatingHours', e.target.value)}
              className={errors.operatingHours ? 'error' : ''}
              placeholder="e.g., Mon-Sat 9:00 AM - 6:00 PM"
              required
            />
            {errors.operatingHours && <span className="error-message">{errors.operatingHours}</span>}
          </div>
        </div>

        {/* Specializations */}
        <div className="form-section">
          <h3>Specializations *</h3>
          <p className="section-description">What products or services do you deal with?</p>
          
          {/* Current specializations */}
          {formData.specializations && formData.specializations.length > 0 && (
            <div className="specializations-list">
              {formData.specializations.map((spec, index) => (
                <div key={index} className="specialization-tag">
                  <span>{spec}</span>
                  <button
                    type="button"
                    onClick={() => removeSpecialization(spec)}
                    className="remove-tag"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new specialization */}
          <div className="add-specialization">
            <div className="input-group">
              <input
                type="text"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                placeholder="Add a specialization"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
              />
              <button
                type="button"
                onClick={addSpecialization}
                className="btn-add"
                disabled={!newSpecialization.trim()}
              >
                Add
              </button>
            </div>
          </div>

          {/* Common specializations */}
          <div className="common-specializations">
            <p>Quick add:</p>
            <div className="common-tags">
              {commonSpecializations
                .filter(spec => !formData.specializations?.includes(spec))
                .slice(0, 12)
                .map(spec => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => addCommonSpecialization(spec)}
                    className="common-tag"
                  >
                    + {spec}
                  </button>
                ))}
            </div>
          </div>

          {errors.specializations && <span className="error-message">{errors.specializations}</span>}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Save Business Info' : 'Update Business Info'}
          </button>
        </div>

        {errors.submit && (
          <div className="error-message submit-error">{errors.submit}</div>
        )}
      </form>
    </div>
  );
};

export default BusinessInfoForm;