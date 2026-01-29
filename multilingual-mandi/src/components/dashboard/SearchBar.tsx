import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search commodities...",
  className = ""
}) => {
  return (
    <label className={`search-bar ${className}`}>
      <div className="search-input-wrapper">
        <div className="search-icon">
          <span className="material-symbols-outlined">search</span>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
};

export default SearchBar;