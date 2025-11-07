import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const BottomTabNavigation = ({ className = '', subscription }) => {
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/artist-dashboard',
      icon: 'LayoutDashboard',
      activeIcon: 'LayoutDashboard'
    },
    {
      label: 'Music',
      path: '/music-upload-management',
      icon: 'Music',
      activeIcon: 'Music'
    },
    {
      label: 'Analytics',
      path: '/analytics-revenue-tracking',
      icon: 'BarChart3',
      activeIcon: 'BarChart3'
    },
    {
      label: 'Profile',
      path: '/artist-profile-management',
      icon: 'User',
      activeIcon: 'User'
    },
    {
      label: 'Support',
      path: '/contact',
      icon: 'HelpCircle',
      activeIcon: 'HelpCircle'
    },
  // Mastering tab removed
  ];

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  // Don't show on auth pages
  if (location?.pathname === '/artist-login' || location?.pathname === '/artist-registration') {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-1000 bg-background border-t border-border ${className}`}>
        <div className="flex items-center justify-around h-16 px-2">
          {navigationItems?.map((item) => {
            const isActive = isActivePath(item?.path);
            return (
              <Link
                key={item?.path}
                to={item?.path}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-all duration-200 animate-spring ${
                  isActive
                    ? 'text-primary' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`p-1 rounded-lg transition-all duration-200 ${
                  isActive ? 'bg-primary/10' : ''
                }`}>
                  <Icon 
                    name={isActive ? item?.activeIcon : item?.icon} 
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span className={`text-xs font-medium mt-1 transition-all duration-200 ${
                  isActive ? 'font-semibold' : ''
                }`}>
                  {item?.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex lg:fixed lg:left-0 lg:top-16 lg:bottom-0 lg:w-64 lg:flex-col lg:bg-background lg:border-r lg:border-border lg:z-1000">
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-4 space-y-2">
            {navigationItems?.map((item) => {
              const isActive = isActivePath(item?.path);
              return (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 animate-spring ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-subtle'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon 
                    name={isActive ? item?.activeIcon : item?.icon} 
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={isActive ? 'font-semibold' : ''}>{item?.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions Section */}
          <div className="px-4 mt-8">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                to="/music-upload-management"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                <Icon name="Plus" size={16} />
                <span>Upload New Track</span>
              </Link>
              <Link
                to="/analytics-revenue-tracking"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                <Icon name="TrendingUp" size={16} />
                <span>View Earnings</span>
              </Link>
            </div>
            {/* Debug: Show raw subscription data */}
            {/* Subscription Plan Info Card - ensure visible and not overlapped */}
            {subscription && (
              (() => {
                // Helper to format date as DD/MM/YYYY
                function formatDMY(date) {
                  if (!date) return 'N/A';
                  const d = date.getDate().toString().padStart(2, '0');
                  const m = (date.getMonth() + 1).toString().padStart(2, '0');
                  const y = date.getFullYear();
                  return `${d}/${m}/${y}`;
                }
                // Calculate purchase date
                let purchaseDate = subscription.purchaseDate?.seconds ? new Date(subscription.purchaseDate.seconds * 1000) : (subscription.formattedDate ? new Date(subscription.formattedDate) : null);
                // Calculate expiry date robustly
                let expiryDate = null;
                if (purchaseDate) {
                  if (subscription.planDuration?.toLowerCase() === 'yearly' || (subscription.planName?.toLowerCase().includes('year'))) {
                    expiryDate = new Date(purchaseDate);
                    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                  } else {
                    // Add one month, handle month rollover
                    let month = purchaseDate.getMonth();
                    let year = purchaseDate.getFullYear();
                    let day = purchaseDate.getDate();
                    let nextMonth = month + 1;
                    let nextYear = year;
                    if (nextMonth > 11) {
                      nextMonth = 0;
                      nextYear += 1;
                    }
                    // Get last day of next month
                    let lastDayNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
                    let expiryDay = Math.min(day, lastDayNextMonth);
                    expiryDate = new Date(nextYear, nextMonth, expiryDay, purchaseDate.getHours(), purchaseDate.getMinutes(), purchaseDate.getSeconds());
                  }
                }
                let today = new Date();
                let durationText = '';
                if (expiryDate) {
                  let diffMs = expiryDate - today;
                  let diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                  if (subscription.planDuration?.toLowerCase() === 'yearly' || (subscription.planName?.toLowerCase().includes('year'))) {
                    durationText = `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'} (1 Year Plan)`;
                  } else {
                    durationText = `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'} (1 Month Plan)`;
                  }
                } else {
                  durationText = 'Expiry date not available';
                }
                return (
                  <div className="plan-info-card" style={{margin: '2rem 0 0 0', padding: '1rem', background: '#FFF7E6', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', zIndex: 10, position: 'relative'}}>
                    <div style={{fontWeight: 'bold', color: '#D97706', marginBottom: '0.5rem'}}>Your Plan: {subscription.planName || 'N/A'}</div>
                    <div style={{fontSize: '0.95em', color: '#555'}}>Amount Paid: {subscription.amountPaid || 'N/A'}</div>
                    <div style={{fontSize: '0.95em', color: '#555'}}>Type: {subscription.planDuration || 'N/A'}</div>
                    <div style={{fontSize: '0.95em', color: '#555'}}>Purchase Date: {formatDMY(purchaseDate)}</div>
                    <div style={{fontSize: '0.95em', color: '#555'}}>Expiry Date: {formatDMY(expiryDate)}</div>
                    <div style={{fontSize: '0.95em', color: '#555'}}>{durationText}</div>
                    <div style={{marginTop: '0.5rem', fontSize: '0.92em', color: '#B45309'}}>
                      <span role="img" aria-label="reminder">🔔</span> Please update your plan before expiry to avoid losing access.
                    </div>
                  </div>
                );
              })()
            )}
              {/* Subscription Plan Info Card */}
          </div>

        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <Icon name="Music" size={16} color="white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">KENTUNEZ</p>
              <p className="text-xs truncate">Powered by AstutePro Music</p>
            </div>
          </div>
        </div>
      </aside>
      {/* Spacer for mobile bottom navigation */}
      <div className="lg:hidden h-16"></div>
    </>
  );
};

export default BottomTabNavigation;