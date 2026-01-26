import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const isActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const menuItems = [
        { path: '/', icon: 'dashboard', label: 'Dashboard' },
        { path: '/inventory', icon: 'inventory_2', label: 'Inventory' },
        { path: '/deals', icon: 'shopping_cart', label: 'Orders' },
        { path: '/logistics', icon: 'local_shipping', label: 'Logistics' },
        { path: '/analytics', icon: 'bar_chart', label: 'Analytics' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-box">
                    <span className="material-symbols-outlined logo-icon">agriculture</span>
                </div>
                <div className="logo-text">
                    <h1>AgriTrade Pro</h1>
                    <p>Premium Vendor</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <div
                        key={item.path}
                        className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="nav-text">{item.label}</span>
                    </div>
                ))}
            </nav>

            <div className="user-profile">
                <div className="profile-card">
                    <div className="profile-avatar">
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} alt="Profile" />
                        ) : (
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD48QxuRQud2GYEkpPltEq5jj5OtnVoDL_gpsoCA_zL9Bj7hw4NXJ59JRbPgrv3CKJHF-Gpc3dA-98bj3A9Eo_VAr2e2nTIwjAUZliiYdiLEytKb9G_mSpmDGhhUP9bgqPBFArPs2Mm241OQ3dwPBW1hWCk-y8EJWDf7ddH63zV_wL83C2FuQLf93yYl9FjKqgb1wXZlgJI9Elj8qUKrRnh14DWRJ-O44jUR8RrJ8OYe1cz5H8izoO9Er8zGsnAnLkK35rZoOusyxjm" alt="Profile" />
                        )}
                    </div>
                    <div className="profile-info">
                        <div className="profile-name">{user?.name || 'Robert Chen'}</div>
                        <div className="profile-role">
                            {user?.userType === 'vendor' ? 'Account Manager' : 'Buyer Account'}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
