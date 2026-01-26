import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Deal {
    id: number;
    buyer: string;
    initials: string;
    commodity: string;
    price: string;
    status: 'Counter Offered' | 'Negotiating' | 'Finalizing';
}

const ActiveNegotiations: React.FC = () => {
    const navigate = useNavigate();

    const activeDeals: Deal[] = [
        {
            id: 1,
            buyer: 'Global Food Corp',
            initials: 'GF',
            commodity: 'Durum Wheat (500 MT)',
            price: '$338.00',
            status: 'Counter Offered'
        },
        {
            id: 2,
            buyer: 'SunLife Organics',
            initials: 'SL',
            commodity: 'Yellow Corn (200 MT)',
            price: '$215.50',
            status: 'Negotiating'
        },
        {
            id: 3,
            buyer: 'Terra Mills Co.',
            initials: 'TM',
            commodity: 'Soybean (1000 MT)',
            price: '$542.00',
            status: 'Finalizing'
        }
    ];

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Counter Offered': return 'amber';
            case 'Negotiating': return 'blue';
            case 'Finalizing': return 'primary';
            default: return 'gray';
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Active Negotiations</h3>
            </div>
            <div className="negotiations-table-container">
                <table className="deals-table">
                    <thead>
                        <tr>
                            <th>Buyer Entity</th>
                            <th>Commodity</th>
                            <th>Offer Price</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeDeals.map((deal) => (
                            <tr key={deal.id}>
                                <td>
                                    <div className="buyer-cell">
                                        <div className="avatar-circle" style={{ color: deal.status === 'Finalizing' ? 'var(--primary)' : 'inherit' }}>
                                            {deal.initials}
                                        </div>
                                        <span className="buyer-name">{deal.buyer}</span>
                                    </div>
                                </td>
                                <td>{deal.commodity}</td>
                                <td><strong>{deal.price}</strong></td>
                                <td>
                                    <span className={`status-pill ${getStatusClass(deal.status)}`}>
                                        {deal.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button
                                        className="view-all-link"
                                        onClick={() => navigate(`/deals/${deal.id}`)}
                                        style={{ float: 'right' }}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActiveNegotiations;
