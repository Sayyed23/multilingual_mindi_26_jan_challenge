import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeatherImpact from '../WeatherImpact';
import { AuthProvider } from '../../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock child components
jest.mock('../../components/weather/WeatherHeader', () => () => <div data-testid="weather-header">Header</div>);
jest.mock('../../components/weather/WeatherSidebar', () => () => <div data-testid="weather-sidebar">Sidebar</div>);
jest.mock('../../components/weather/ImpactStats', () => () => <div data-testid="impact-stats">Stats</div>);
jest.mock('../../components/weather/WeatherMap', () => () => <div data-testid="weather-map">Map</div>);
jest.mock('../../components/weather/AffectedCommodities', () => () => <div data-testid="affected-commodities">Commodities</div>);
jest.mock('../../components/weather/SourcingRecommendations', () => () => <div data-testid="sourcing-recos">Recos</div>);

describe('Unit: Weather Impact Page', () => {
    const renderPage = () => {
        return render(
            <AuthProvider>
                <BrowserRouter>
                    <WeatherImpact />
                </BrowserRouter>
            </AuthProvider>
        );
    };

    it('renders all main sections', () => {
        renderPage();

        expect(screen.getByTestId('weather-header')).toBeInTheDocument();
        expect(screen.getByTestId('weather-sidebar')).toBeInTheDocument();
        expect(screen.getByText('Weather Impact & Sourcing')).toBeInTheDocument();
        expect(screen.getByTestId('impact-stats')).toBeInTheDocument();
        expect(screen.getByTestId('weather-map')).toBeInTheDocument();
        expect(screen.getByTestId('affected-commodities')).toBeInTheDocument();
        expect(screen.getByTestId('sourcing-recos')).toBeInTheDocument();
    });
});
