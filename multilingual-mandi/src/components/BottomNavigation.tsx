import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/prices', label: 'Prices', icon: '💰' },
  { path: '/chats', label: 'Chats', icon: '💬' },
  { path: '/deals', label: 'Deals', icon: '🤝' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

const BottomNavigation: React.FC = () => {
  return (
    <nav className="bottom-navigation" role="navigation" aria-label="Main navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavigation;