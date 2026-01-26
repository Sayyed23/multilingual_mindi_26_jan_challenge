/**
 * User Type Selector Component for choosing vendor/buyer/both
 * Supports Requirements: 4.2 - User type selection during profile creation
 */

import React from 'react';
import { UserType } from '../types/user';
import './UserTypeSelector.css';

interface UserTypeSelectorProps {
  selectedType: UserType;
  onTypeChange: (type: UserType) => void;
  disabled?: boolean;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  disabled = false
}) => {
  const userTypes = [
    {
      type: 'vendor' as UserType,
      title: 'Vendor',
      description: 'I want to sell agricultural products',
      icon: '🌾',
      features: [
        'List your products',
        'Manage inventory',
        'Receive orders',
        'Track sales'
      ]
    },
    {
      type: 'buyer' as UserType,
      title: 'Buyer',
      description: 'I want to buy agricultural products',
      icon: '🛒',
      features: [
        'Browse products',
        'Compare prices',
        'Place orders',
        'Track purchases'
      ]
    },
    {
      type: 'both' as UserType,
      title: 'Both',
      description: 'I want to both buy and sell products',
      icon: '🔄',
      features: [
        'All vendor features',
        'All buyer features',
        'Flexible trading',
        'Maximum opportunities'
      ]
    }
  ];

  return (
    <div className="user-type-selector">
      <div className="selector-header">
        <h3>What describes you best?</h3>
        <p>Choose your role in the marketplace</p>
      </div>

      <div className="type-options">
        {userTypes.map((option) => (
          <div
            key={option.type}
            className={`type-option ${selectedType === option.type ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && onTypeChange(option.type)}
          >
            <div className="option-header">
              <div className="option-icon">{option.icon}</div>
              <div className="option-info">
                <h4>{option.title}</h4>
                <p>{option.description}</p>
              </div>
              <div className="option-radio">
                <input
                  type="radio"
                  name="userType"
                  value={option.type}
                  checked={selectedType === option.type}
                  onChange={() => onTypeChange(option.type)}
                  disabled={disabled}
                  aria-label={option.type}
                />
              </div>
            </div>

            <div className="option-features">
              <ul>
                {option.features.map((feature, index) => (
                  <li key={index}>
                    <span className="feature-check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="selector-note">
        <p>
          <strong>Note:</strong> You can change this setting later in your profile.
          {selectedType === 'both' && ' Choosing "Both" gives you maximum flexibility in the marketplace.'}
        </p>
      </div>
    </div>
  );
};

export default UserTypeSelector;