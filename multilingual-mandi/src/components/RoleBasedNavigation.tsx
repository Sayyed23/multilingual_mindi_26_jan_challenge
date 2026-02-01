import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Search,
  MessageSquare,
  User,
  TrendingUp,
  Package,
  ShoppingCart,
  Bell,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import T from './T';
import type { UserRole } from '../types';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles: UserRole[];
  badge?: number;
}

const RoleBasedNavigation: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const navigationItems: NavigationItem[] = [
    {
      path: '/app',
      label: 'Home',
      icon: Home,
      roles: ['vendor', 'buyer', 'agent']
    },
    {
      path: '/app/market',
      label: 'Market',
      icon: TrendingUp,
      roles: ['vendor', 'buyer', 'agent']
    },
    {
      path: '/app/search',
      label: 'Search',
      icon: Search,
      roles: ['buyer', 'agent']
    },
    {
      path: '/app/inventory',
      label: 'Inventory',
      icon: Package,
      roles: ['vendor']
    },
    {
      path: '/app/orders',
      label: 'Orders',
      icon: ShoppingCart,
      roles: ['buyer']
    },
    {
      path: '/app/deals',
      label: 'Deals',
      icon: BarChart3,
      roles: ['agent']
    },
    {
      path: '/app/chats',
      label: 'Chats',
      icon: MessageSquare,
      roles: ['vendor', 'buyer', 'agent']
    },
    {
      path: '/app/notifications',
      label: 'Alerts',
      icon: Bell,
      roles: ['vendor', 'buyer', 'agent']
    },
    {
      path: '/app/profile',
      label: 'Profile',
      icon: User,
      roles: ['vendor', 'buyer', 'agent']
    }
  ];

  // Filter navigation items based on user role
  const allowedItems = navigationItems.filter(item =>
    item.roles.includes(user.role)
  );

  // Get role-specific styling
  const getRoleStyles = (role: UserRole) => {
    switch (role) {
      case 'vendor':
        return {
          activeColor: 'text-green-600',
          activeBg: 'bg-green-50',
          hoverColor: 'hover:text-green-600'
        };
      case 'buyer':
        return {
          activeColor: 'text-blue-600',
          activeBg: 'bg-blue-50',
          hoverColor: 'hover:text-blue-600'
        };
      case 'agent':
        return {
          activeColor: 'text-purple-600',
          activeBg: 'bg-purple-50',
          hoverColor: 'hover:text-purple-600'
        };
      default:
        return {
          activeColor: 'text-green-600',
          activeBg: 'bg-green-50',
          hoverColor: 'hover:text-green-600'
        };
    }
  };

  const roleStyles = getRoleStyles(user.role);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-slate-200 items-center py-8 gap-4 z-50">
        {/* Logo */}
        <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white font-bold ${user.role === 'buyer' ? 'bg-blue-600' :
          user.role === 'agent' ? 'bg-purple-600' :
            'bg-green-600'
          }`}>
          M
        </div>

        {/* Navigation Items */}
        {allowedItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              aria-label={item.label}
              title={item.label}
              className={({ isActive }) =>
                `relative p-3 rounded-xl transition-colors ${isActive
                  ? `${roleStyles.activeColor} ${roleStyles.activeBg}`
                  : `text-slate-400 ${roleStyles.hoverColor}`
                }`
              }
            >
              <IconComponent size={24} />
              {item.badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Mobile Navigation */}
      <nav className="mobile-navigation md:hidden">
        {allowedItems.slice(0, 5).map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 relative ${isActive ? roleStyles.activeColor : 'text-slate-400'
                }`
              }
            >
              <IconComponent size={22} />
              <span className="text-[10px] font-medium">
                <T>{item.label}</T>
              </span>
              {item.badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default RoleBasedNavigation;