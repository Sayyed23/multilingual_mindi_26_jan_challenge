/**
 * Negotiation Strategy Suggestions Component
 * Provides AI-powered negotiation strategies based on price verification and market trends
 * Supports Requirements: 6.5 - Add negotiation strategy suggestions
 */

import React, { useState } from 'react';
import { PriceVerification, PriceTrend } from '../types/price';
import './NegotiationStrategySuggestions.css';

interface NegotiationStrategySuggestionsProps {
  verification: PriceVerification;
  historicalTrend?: PriceTrend | null;
  commodityName: string;
}

const NegotiationStrategySuggestions: React.FC<NegotiationStrategySuggestionsProps> = ({
  verification,
  historicalTrend,
  commodityName
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const generateStrategies = () => {
    const strategies = [];
    const deviation = verification.deviation.percentage;
    const isOverpriced = deviation > 0;
    const isUnderpriced = deviation < 0;

    // Strategy 1: Direct Price Negotiation
    if (Math.abs(deviation) > 5) {
      const targetPrice = isOverpriced 
        ? verification.marketPrice + (verification.quotedPrice - verification.marketPrice) * 0.3
        : verification.quotedPrice;
      
      strategies.push({
        id: 'direct-negotiation',
        title: '💬 Direct Price Negotiation',
        priority: 'high',
        description: isOverpriced 
          ? `The quoted price is ${Math.abs(deviation).toFixed(1)}% above market rate. Negotiate down to around ${formatPrice(targetPrice)}.`
          : `The price is fair but you can still try to negotiate a small discount.`,
        tactics: isOverpriced ? [
          `Show market data: "I've seen ${commodityName} selling for ${formatPrice(verification.marketPrice)} in nearby markets"`,
          `Propose counter-offer: "Would you consider ${formatPrice(targetPrice)}?"`,
          `Mention bulk purchase: "If I buy in larger quantity, can we discuss the price?"`
        ] : [
          `Ask for bulk discount: "What's your best price for larger quantities?"`,
          `Inquire about payment terms: "Any discount for immediate payment?"`,
          `Check for seasonal offers: "Do you have any ongoing promotions?"`
        ],
        successRate: isOverpriced ? 75 : 45
      });
    }

    // Strategy 2: Market Comparison
    if (verification.comparableMarkets.length >= 3) {
      const lowestPrice = Math.min(...verification.comparableMarkets.map(m => m.price));
      strategies.push({
        id: 'market-comparison',
        title: '📊 Market Comparison Approach',
        priority: deviation > 10 ? 'high' : 'medium',
        description: `Use data from ${verification.comparableMarkets.length} comparable markets to justify your negotiation.`,
        tactics: [
          `Reference lowest price: "I found ${commodityName} for ${formatPrice(lowestPrice)} at [market name]"`,
          `Show price range: "The market range is ${formatPrice(lowestPrice)} to ${formatPrice(Math.max(...verification.comparableMarkets.map(m => m.price)))}"`,
          `Ask for price matching: "Can you match the price from [competitor market]?"`
        ],
        successRate: 65
      });
    }

    // Strategy 3: Timing-based Strategy
    if (historicalTrend) {
      const trendStrategy = getTrendBasedStrategy(historicalTrend, deviation);
      if (trendStrategy) {
        strategies.push(trendStrategy);
      }
    }

    // Strategy 4: Relationship Building
    strategies.push({
      id: 'relationship-building',
      title: '🤝 Relationship Building',
      priority: 'medium',
      description: 'Build long-term relationship for better future deals.',
      tactics: [
        `Express interest in regular purchases: "I'm looking for a reliable supplier for monthly orders"`,
        `Appreciate quality: "Your ${commodityName} looks good quality, but the price is a concern"`,
        `Suggest trial period: "Let's start with this order and see how it goes"`
      ],
      successRate: 55
    });

    // Strategy 5: Bundle Deal
    strategies.push({
      id: 'bundle-deal',
      title: '📦 Bundle Deal Strategy',
      priority: 'low',
      description: 'Negotiate better rates by combining multiple items or larger quantities.',
      tactics: [
        `Propose bulk purchase: "What's your rate for 10 quintals instead of 1?"`,
        `Mix commodities: "If I buy other items too, can we get a better overall rate?"`,
        `Future commitment: "I can commit to monthly purchases if you give me a better rate"`
      ],
      successRate: 50
    });

    return strategies.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    });
  };

  const getTrendBasedStrategy = (trend: PriceTrend, deviation: number) => {
    const isRising = trend.trend === 'rising';
    const isFalling = trend.trend === 'falling';
    const isVolatile = trend.trend === 'volatile';

    if (isRising && deviation > 0) {
      return {
        id: 'timing-strategy',
        title: '⏰ Timing-based Strategy',
        priority: 'high' as const,
        description: `Prices are rising, but the quote is still above current market rate. Act quickly but negotiate.`,
        tactics: [
          `Acknowledge trend: "I understand prices are rising, but this is still above current market"`,
          `Propose quick deal: "If we close today, can you give me the current market rate?"`,
          `Lock in price: "Can we fix this rate for future orders too?"`
        ],
        successRate: 60
      };
    }

    if (isFalling && deviation > 0) {
      return {
        id: 'timing-strategy',
        title: '⏰ Timing-based Strategy',
        priority: 'high' as const,
        description: `Prices are falling, giving you strong negotiation power.`,
        tactics: [
          `Point out trend: "Prices have been falling, shouldn't this be lower?"`,
          `Wait strategy: "I might wait a few days if prices continue to fall"`,
          `Demand current rate: "Please give me today's market rate, not yesterday's"`
        ],
        successRate: 80
      };
    }

    if (isVolatile) {
      return {
        id: 'timing-strategy',
        title: '⏰ Timing-based Strategy',
        priority: 'medium' as const,
        description: `Market is volatile, use this uncertainty to negotiate.`,
        tactics: [
          `Highlight volatility: "With prices changing daily, let's settle on a fair middle rate"`,
          `Propose average: "How about we take the average of this week's prices?"`,
          `Quick decision: "Let's close at market rate to avoid further price swings"`
        ],
        successRate: 55
      };
    }

    return null;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#fd7e14';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '📝';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return '#28a745';
    if (rate >= 50) return '#ffc107';
    return '#fd7e14';
  };

  const strategies = generateStrategies();

  return (
    <div className="negotiation-strategies">
      <div className="strategies-header">
        <h3>🎯 Negotiation Strategy Suggestions</h3>
        <p>AI-powered strategies based on market analysis and price verification</p>
      </div>

      <div className="strategies-overview">
        <div className="overview-stats">
          <div className="stat-item">
            <label>Market Position</label>
            <span className={verification.deviation.percentage > 0 ? 'overpriced' : 'fair'}>
              {verification.deviation.percentage > 10 ? 'Overpriced' : 
               verification.deviation.percentage > 0 ? 'Above Average' : 'Fair Price'}
            </span>
          </div>
          <div className="stat-item">
            <label>Negotiation Power</label>
            <span className={Math.abs(verification.deviation.percentage) > 10 ? 'strong' : 'moderate'}>
              {Math.abs(verification.deviation.percentage) > 15 ? 'Very Strong' :
               Math.abs(verification.deviation.percentage) > 10 ? 'Strong' :
               Math.abs(verification.deviation.percentage) > 5 ? 'Moderate' : 'Limited'}
            </span>
          </div>
          <div className="stat-item">
            <label>Recommended Action</label>
            <span>
              {verification.deviation.percentage > 15 ? 'Negotiate Aggressively' :
               verification.deviation.percentage > 5 ? 'Negotiate Politely' :
               'Accept or Minor Negotiation'}
            </span>
          </div>
        </div>
      </div>

      <div className="strategies-list">
        {strategies.map((strategy) => (
          <div 
            key={strategy.id} 
            className={`strategy-card ${selectedStrategy === strategy.id ? 'selected' : ''}`}
            onClick={() => setSelectedStrategy(selectedStrategy === strategy.id ? null : strategy.id)}
          >
            <div className="strategy-header">
              <div className="strategy-title">
                <span className="strategy-icon">{getPriorityIcon(strategy.priority)}</span>
                <h4>{strategy.title}</h4>
              </div>
              <div className="strategy-meta">
                <span 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(strategy.priority) }}
                >
                  {strategy.priority.toUpperCase()}
                </span>
                <span 
                  className="success-rate"
                  style={{ color: getSuccessRateColor(strategy.successRate) }}
                >
                  {strategy.successRate}% success
                </span>
              </div>
            </div>

            <div className="strategy-description">
              <p>{strategy.description}</p>
            </div>

            {selectedStrategy === strategy.id && (
              <div className="strategy-details">
                <h5>💬 Suggested Talking Points:</h5>
                <ul className="tactics-list">
                  {strategy.tactics.map((tactic, index) => (
                    <li key={index} className="tactic-item">
                      <span className="tactic-number">{index + 1}</span>
                      <span className="tactic-text">{tactic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="strategy-footer">
              <button className="expand-button">
                {selectedStrategy === strategy.id ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="negotiation-tips">
        <h4>💡 General Negotiation Tips</h4>
        <div className="tips-grid">
          <div className="tip-item">
            <span className="tip-icon">🤝</span>
            <div className="tip-content">
              <strong>Be Respectful</strong>
              <p>Maintain a friendly tone and respect the seller's position</p>
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">📊</span>
            <div className="tip-content">
              <strong>Use Data</strong>
              <p>Back your negotiation with market data and comparable prices</p>
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">⏰</span>
            <div className="tip-content">
              <strong>Timing Matters</strong>
              <p>Consider market trends and seasonal factors in your approach</p>
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🎯</span>
            <div className="tip-content">
              <strong>Know Your Limit</strong>
              <p>Set a maximum price you're willing to pay before negotiating</p>
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="save-strategy-button">
          💾 Save Strategies
        </button>
        <button className="share-button">
          📤 Share Analysis
        </button>
      </div>
    </div>
  );
};

export default NegotiationStrategySuggestions;