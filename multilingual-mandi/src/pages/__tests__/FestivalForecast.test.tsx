import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FestivalForecast from '../FestivalForecast';
import { BrowserRouter } from 'react-router-dom';

// Mock child components
jest.mock('../../components/forecast/ForecastHeader', () => () => <div data-testid="forecast-header">Header</div>);
jest.mock('../../components/forecast/FilterChips', () => () => <div data-testid="filter-chips">Filters</div>);
jest.mock('../../components/forecast/FestivalTimeline', () => () => <div data-testid="timeline">Timeline</div>);
jest.mock('../../components/forecast/PricePatternChart', () => () => <div data-testid="pattern-chart">Chart</div>);
jest.mock('../../components/forecast/DemandPrediction', () => () => <div data-testid="demand-prediction">Prediction</div>);
jest.mock('../../components/forecast/SmartThreshold', () => () => <div data-testid="smart-threshold">Threshold</div>);
jest.mock('../../components/forecast/ForecastInfoCards', () => () => <div data-testid="info-cards">Info Cards</div>);

describe('Unit: Festival Forecast Page', () => {
    const renderPage = () => {
        return render(
            <BrowserRouter>
                <FestivalForecast />
            </BrowserRouter>
        );
    };

    it('renders all main sections', () => {
        renderPage();

        expect(screen.getByTestId('forecast-header')).toBeInTheDocument();
        expect(screen.getByText('Festival Forecast Analysis')).toBeInTheDocument();
        expect(screen.getByTestId('filter-chips')).toBeInTheDocument();
        expect(screen.getByTestId('timeline')).toBeInTheDocument();
        expect(screen.getByTestId('pattern-chart')).toBeInTheDocument();
        expect(screen.getByTestId('demand-prediction')).toBeInTheDocument();
        expect(screen.getByTestId('smart-threshold')).toBeInTheDocument();
        expect(screen.getByTestId('info-cards')).toBeInTheDocument();
    });
});
