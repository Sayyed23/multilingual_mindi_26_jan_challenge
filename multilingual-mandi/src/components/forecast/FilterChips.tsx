import React from 'react';

const FilterChips: React.FC = () => {
    const filters = [
        { label: 'All Commodities', active: true },
        { label: 'Grains & Cereals', active: false },
        { label: 'Spices', active: false },
        { label: 'Dairy & Poultry', active: false },
        { label: 'Fruits & Vegetables', active: false },
        { label: 'Oilseeds', active: false },
    ];

    return (
        <div className="filter-scroll">
            {filters.map((filter, index) => (
                <button
                    key={index}
                    className={`filter-chip ${filter.active ? 'active' : 'inactive'}`}
                >
                    {filter.label}
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        keyboard_arrow_down
                    </span>
                </button>
            ))}
        </div>
    );
};

export default FilterChips;
