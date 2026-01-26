import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingHeader from '../components/listing/ListingHeader';
import ListingProgress from '../components/listing/ListingProgress';
import CommodityDetails from '../components/listing/CommodityDetails';
import QualityPricing from '../components/listing/QualityPricing';
import MediaUpload from '../components/listing/MediaUpload';
import ListingSidebar from '../components/listing/ListingSidebar';
import './CreateListing.css';

interface ListingFormData {
  commodityType: string;
  quantity: number;
  unit: string;
  qualityGrade: 'A' | 'B' | 'C';
  pricePerUnit: number;
  harvestDate: string;
  readyForPickup: string;
  warehouse: string;
  photos: File[];
}

const CreateListing: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ListingFormData>({
    commodityType: '',
    quantity: 0,
    unit: 'tonnes',
    qualityGrade: 'A',
    pricePerUnit: 0,
    harvestDate: '2023-10-15',
    readyForPickup: '2023-11-01',
    warehouse: 'Chicago South Storage Hub #4',
    photos: []
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };

  const handleSubmit = () => {
    console.log('Submitting listing:', formData);
    navigate('/'); // Navigate to dashboard after submission (mock)
  };

  return (
    <div className="create-listing-page">
      {/* <ListingHeader /> Removed for Global Layout */}

      <main className="listing-main">
        <div className="listing-headline">
          <h1>Create New Listing</h1>
          <p>Post your agricultural commodities to the global B2B marketplace.</p>
        </div>

        <ListingProgress />

        <div className="listing-grid">
          <div className="form-column">
            <CommodityDetails
              data={{
                commodityType: formData.commodityType,
                quantity: formData.quantity,
                unit: formData.unit
              }}
              onChange={handleInputChange}
            />

            <QualityPricing
              data={{
                qualityGrade: formData.qualityGrade,
                pricePerUnit: formData.pricePerUnit
              }}
              onChange={handleInputChange}
            />

            <MediaUpload
              files={formData.photos}
              onUpload={handlePhotoUpload}
            />

            <div className="form-footer">
              <button
                className="btn-back"
                onClick={() => navigate('/')}
              >
                Back to Basic Info
              </button>
              <button
                className="btn-continue"
                onClick={handleSubmit}
              >
                Continue to Logistics
              </button>
            </div>
          </div>

          <div className="listing-sidebar-column">
            <ListingSidebar
              data={{
                harvestDate: formData.harvestDate,
                readyForPickup: formData.readyForPickup
              }}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </main>


    </div>
  );
};

export default CreateListing;