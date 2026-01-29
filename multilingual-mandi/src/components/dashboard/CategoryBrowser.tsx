import React from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryBrowserProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

const categories: Category[] = [
  { id: 'vegetables', name: 'Vegetables', icon: 'energy_savings_leaf' },
  { id: 'fruits', name: 'Fruits', icon: 'nutrition' },
  { id: 'grains', name: 'Grains', icon: 'grain' },
  { id: 'spices', name: 'Spices', icon: 'potted_plant' },
  { id: 'dairy', name: 'Dairy', icon: 'water_drop' },
];

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  selectedCategory,
  onCategoryChange,
  className = ""
}) => {
  return (
    <section className={`category-browser ${className}`}>
      <h3 className="section-title">
        <span className="material-symbols-outlined section-icon">category</span>
        Category Browser
      </h3>
      
      <div className="category-grid">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
          >
            <span className="material-symbols-outlined category-icon">
              {category.icon}
            </span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryBrowser;