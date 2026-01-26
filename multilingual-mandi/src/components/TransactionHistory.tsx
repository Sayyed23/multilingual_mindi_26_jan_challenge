/**
 * Transaction History Component - Displays user's transaction history
 * Supports Requirements: 4.3, 4.4 - Transaction history tracking for reputation system
 */

import React, { useState, useEffect } from 'react';
import { TransactionHistory as TransactionHistoryType } from '../types/review';
import { reputationService } from '../services/reputationService';
import LoadingSpinner from './LoadingSpinner';
import './TransactionHistory.css';

interface TransactionHistoryProps {
  userId?: string; // If not provided, shows current user's history
  limit?: number;
  showActions?: boolean;
  variant?: 'full' | 'compact';
  className?: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  userId,
  limit = 20,
  showActions = true,
  variant = 'full',
  className = ''
}) => {
  const [transactions, setTransactions] = useState<TransactionHistoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadTransactions();
  }, [userId, page]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = userId 
        ? await reputationService.getTransactionHistory(userId, page, limit)
        : await reputationService.getCurrentUserTransactionHistory(page, limit);

      if (page === 1) {
        setTransactions(response.transactions);
      } else {
        setTransactions(prev => [...prev, ...response.transactions]);
      }
      
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Failed to load transaction history:', error);
      setError('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      completed: '#10b981', // green
      disputed: '#f59e0b', // yellow
      cancelled: '#ef4444' // red
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getPaymentStatusColor = (status: string): string => {
    const colors = {
      on_time: '#10b981', // green
      late: '#f59e0b', // yellow
      very_late: '#ef4444', // red
      defaulted: '#dc2626' // dark red
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentStatusLabel = (status: string): string => {
    const labels = {
      on_time: 'On Time',
      late: 'Late',
      very_late: 'Very Late',
      defaulted: 'Defaulted'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getDeliveryStatusLabel = (status: string): string => {
    const labels = {
      on_time: 'On Time',
      late: 'Late',
      very_late: 'Very Late',
      failed: 'Failed'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className="transaction-history-loading">
        <LoadingSpinner />
        <p>Loading transaction history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-history-error">
        <p>{error}</p>
        <button onClick={() => loadTransactions()} className="btn-secondary">
          Try Again
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-history-empty">
        <div className="empty-icon">📋</div>
        <h3>No Transaction History</h3>
        <p>No completed transactions found.</p>
      </div>
    );
  }

  return (
    <div className={`transaction-history ${variant} ${className}`}>
      <div className="transaction-list">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="transaction-item">
            <div className="transaction-header">
              <div className="transaction-basic-info">
                <h4 className="commodity-name">{transaction.commodityName}</h4>
                <div className="transaction-meta">
                  <span className="counterparty">
                    {transaction.userRole === 'vendor' ? 'Sold to' : 'Bought from'}{' '}
                    <strong>{transaction.counterpartyName}</strong>
                  </span>
                  <span className="transaction-date">
                    {formatDate(transaction.completedAt)}
                  </span>
                </div>
              </div>
              
              <div className="transaction-amount">
                <span className="amount">{formatAmount(transaction.totalAmount)}</span>
                <span className="quantity">
                  {transaction.quantity} {transaction.unit}
                </span>
              </div>
            </div>

            {variant === 'full' && (
              <div className="transaction-details">
                <div className="status-indicators">
                  <div className="status-item">
                    <span className="status-label">Status:</span>
                    <span 
                      className="status-value"
                      style={{ color: getStatusColor(transaction.status) }}
                    >
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="status-item">
                    <span className="status-label">Payment:</span>
                    <span 
                      className="status-value"
                      style={{ color: getPaymentStatusColor(transaction.paymentStatus) }}
                    >
                      {getPaymentStatusLabel(transaction.paymentStatus)}
                    </span>
                  </div>
                  
                  <div className="status-item">
                    <span className="status-label">Delivery:</span>
                    <span 
                      className="status-value"
                      style={{ color: getPaymentStatusColor(transaction.deliveryStatus) }}
                    >
                      {getDeliveryStatusLabel(transaction.deliveryStatus)}
                    </span>
                  </div>
                </div>

                {showActions && (
                  <div className="transaction-actions">
                    {!transaction.hasReview && transaction.status === 'completed' && (
                      <button className="btn-primary btn-small">
                        Write Review
                      </button>
                    )}
                    {transaction.hasReview && (
                      <button className="btn-secondary btn-small">
                        View Review
                      </button>
                    )}
                    {transaction.disputeId && (
                      <button className="btn-secondary btn-small">
                        View Dispute
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="load-more-section">
          <button 
            onClick={loadMore} 
            className="btn-secondary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;