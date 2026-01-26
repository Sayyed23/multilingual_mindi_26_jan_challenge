import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateListing from '../CreateListing';
import { AuthProvider } from '../../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock child components to isolate page logic
jest.mock('../../components/listing/ListingHeader', () => () => <div data-testid="listing-header">Header</div>);
jest.mock('../../components/listing/ListingProgress', () => () => <div data-testid="listing-progress">Progress</div>);
jest.mock('../../components/listing/CommodityDetails', () => () => <div data-testid="commodity-details">Commodity Details</div>);
jest.mock('../../components/listing/QualityPricing', () => () => <div data-testid="quality-pricing">Quality Pricing</div>);
jest.mock('../../components/listing/MediaUpload', () => () => <div data-testid="media-upload">Media Upload</div>);
jest.mock('../../components/listing/ListingSidebar', () => () => <div data-testid="listing-sidebar">Sidebar</div>);

describe('Unit: Create Listing Page', () => {
    const renderPage = () => {
        return render(
            <AuthProvider>
                <BrowserRouter>
                    <CreateListing />
                </BrowserRouter>
            </AuthProvider>
        );
    };

    it('renders all sections correctly', () => {
        renderPage();

        expect(screen.getByTestId('listing-header')).toBeInTheDocument();
        expect(screen.getByText('Create New Listing')).toBeInTheDocument();
        expect(screen.getByTestId('listing-progress')).toBeInTheDocument();
        expect(screen.getByTestId('commodity-details')).toBeInTheDocument();
        expect(screen.getByTestId('quality-pricing')).toBeInTheDocument();
        expect(screen.getByTestId('media-upload')).toBeInTheDocument();
        expect(screen.getByTestId('listing-sidebar')).toBeInTheDocument();
    });
});
