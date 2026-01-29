import React from 'react';

interface PriceData {
  commodity: string;
  currentRate: number;
  change: number;
  changePercent: string;
}

interface LocationPriceTableProps {
  location: string;
  onLocationChange: (location: string) => void;
  searchQuery?: string;
  className?: string;
}

const mockPriceData: PriceData[] = [
  { commodity: 'Soybeans', currentRate: 4850, change: 2.4, changePercent: '+2.4%' },
  { commodity: 'Cotton', currentRate: 7200, change: -1.2, changePercent: '-1.2%' },
  { commodity: 'Onions', currentRate: 2100, change: 5.8, changePercent: '+5.8%' },
  { commodity: 'Grapes (Thomson)', currentRate: 3500, change: 0, changePercent: '0.0%' },
  { commodity: 'Toor Dal', currentRate: 8400, change: 1.1, changePercent: '+1.1%' },
  { commodity: 'Wheat', currentRate: 2450, change: -0.5, changePercent: '-0.5%' },
  { commodity: 'Maize', currentRate: 1950, change: 0.8, changePercent: '+0.8%' },
  { commodity: 'Chickpeas', currentRate: 5100, change: 3.2, changePercent: '+3.2%' },
];

export const LocationPriceTable: React.FC<LocationPriceTableProps> = ({
  location,
  onLocationChange,
  searchQuery = "",
  className = ""
}) => {
  const filteredData = mockPriceData.filter(item =>
    item.commodity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChangeClass = (change: number) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  return (
    <section className={`location-price-table ${className}`}>
      <div className="table-header">
        <div className="location-info">
          <h2 className="location-title">My Location: {location}</h2>
          <p className="date-info">Live Mandi Prices for May 24, 2024</p>
        </div>
        <button 
          className="change-location-btn"
          onClick={() => onLocationChange('New Location')}
        >
          <span className="material-symbols-outlined">location_on</span>
          Change Location
        </button>
      </div>

      <div className="price-table-container">
        <table className="price-table">
          <thead>
            <tr>
              <th>Commodity</th>
              <th className="text-right">Current Rate (₹/q)</th>
              <th className="text-right">24h Change</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} className="price-row">
                <td className="commodity-name">{item.commodity}</td>
                <td className="current-rate">₹{item.currentRate.toLocaleString()}</td>
                <td className={`change-value ${getChangeClass(item.change)}`}>
                  {item.changePercent}
                </td>
                <td className="actions">
                  <button className="view-chart-btn">
                    View Chart
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default LocationPriceTable;