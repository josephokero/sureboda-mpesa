import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';

const HeaderNavigation = ({ isAuthenticated = true, userProfile = null }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile: authUserProfile, signOut } = useAuth();

  // Use authenticated user profile or fallback to passed userProfile
  // Always use the latest profile photo from all possible fields
  let currentUserProfile = authUserProfile || userProfile;
  if (currentUserProfile) {
    currentUserProfile = {
      ...currentUserProfile,
      profile_image_url: currentUserProfile.profilePhoto || currentUserProfile.profile_image_url || currentUserProfile.profile_photo || ''
    };
  }
  const isUserAuthenticated = !!user || isAuthenticated;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
  { label: 'Dashboard', path: '/artist-dashboard', icon: 'LayoutDashboard' },
  { label: 'Music', path: '/music-upload-management', icon: 'Music' },
  { label: 'Analytics', path: '/analytics-revenue-tracking', icon: 'BarChart3' },
  { label: 'Payments', path: '/payments', icon: 'Wallet' },
  { label: 'Mastering', path: '/mastering', icon: 'Disc' },
  { label: 'Profile', path: '/artist-profile-management', icon: 'User' },
  ];

  const notifications = [
    { id: 1, title: 'Upload Complete', message: 'Your track "Nairobi Nights" is now live', time: '2 min ago', unread: true },
    { id: 2, title: 'Revenue Update', message: 'You earned KSh 2,450 this week', time: '1 hour ago', unread: true },
    { id: 3, title: 'Profile Verified', message: 'Your artist profile has been verified', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications?.filter(n => n?.unread)?.length;

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      const { error } = await signOut();
      
      if (error) {
        // Show error to user but don't treat as bug console.log('Logout error:', error);
        return;
      }
      
      // Close dropdown menus
      setShowUserMenu(false);
      setShowMobileMenu(false);
      
      // Navigate to landing page
  navigate('/kentunez-landing-page');
    } catch (error) {
      console.log('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isUserAuthenticated) {
    return (
      <header className="sticky top-0 z-1100 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Music" size={20} color="white" />
              </div>
              <span className="font-heading font-bold text-xl text-foreground">KenTunez</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/artist-login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/artist-registration">
                <Button variant="default">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`sticky top-0 z-1100 bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-300 ${isScrolled ? 'shadow-card' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/artist-dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Music" size={20} color="white" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">KenTunez</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors animate-spring ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={16} />
                <span>{item?.label}</span>
              </Link>
            ))}
          </nav>


          {/* Right Actions */}
          <div className="flex items-center space-x-2">

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-2"
              >
                {currentUserProfile?.profile_image_url ? (
                  <img 
                    src={currentUserProfile?.profile_image_url} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <Icon name="User" size={16} color="white" />
                  </div>
                )}
                <Icon name="ChevronDown" size={16} className="hidden sm:block" />
              </Button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-modal z-1200">
                  <div className="p-4 border-b border-border">
                    <p className="font-medium text-foreground">
                      {currentUserProfile?.stage_name || currentUserProfile?.full_name || 'Artist Name'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentUserProfile?.email || user?.email || 'artist@kentunez.com'}
                    </p>
                    {/* Plan Info */}
                    {currentUserProfile?.dashboardPlan && (
                      <div className="mt-3 text-left">
                        <div className="text-primary font-bold text-base">Your Plan: {currentUserProfile.dashboardPlan}</div>
                        {currentUserProfile.dashboardAmount && <div className="text-muted-foreground">Amount Paid: {currentUserProfile.dashboardAmount}</div>}
                        {currentUserProfile.formattedDate && <div className="text-muted-foreground">Purchased: {currentUserProfile.formattedDate}</div>}
                        {currentUserProfile.planDuration && <div className="text-muted-foreground">Type: {currentUserProfile.planDuration}</div>}
                        <div className="text-xs text-warning mt-2">Please update your plan before it ends so your account and songs stay active.</div>
                      </div>
                    )}
                  </div>
                  <div className="py-2">
                    <Link
                      to="/artist-profile-management"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Icon name="Settings" size={16} />
                      <span>Settings</span>
                    </Link>
                    <Link
                      to="/help"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Icon name="HelpCircle" size={16} />
                      <span>Help & Support</span>
                    </Link>
                    <div className="border-t border-border my-2"></div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-error hover:bg-muted transition-colors w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon name="LogOut" size={16} />
                      <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Icon name={showMobileMenu ? "X" : "Menu"} size={20} />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-border bg-background z-[1400] pointer-events-auto fixed top-16 left-0 w-full" style={{maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto'}}>
            <nav className="py-4 space-y-2 pointer-events-auto">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActivePath(item?.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={item?.icon} size={20} />
                  <span>{item?.label}</span>
                </Link>
              ))}
              {/* Plan Info in Mobile Menu */}
              {currentUserProfile?.dashboardPlan && (
                <div className="mt-4 px-4 text-left">
                  <div className="text-primary font-bold text-base">Your Plan: {currentUserProfile.dashboardPlan}</div>
                  {currentUserProfile.dashboardAmount && <div className="text-muted-foreground">Amount Paid: {currentUserProfile.dashboardAmount}</div>}
                  {currentUserProfile.formattedDate && <div className="text-muted-foreground">Purchased: {currentUserProfile.formattedDate}</div>}
                  {currentUserProfile.planDuration && <div className="text-muted-foreground">Type: {currentUserProfile.planDuration}</div>}
                  <div className="text-xs text-warning mt-2">Please update your plan before it ends so your account and songs stay active.</div>
                </div>
              )}
              {/* Mobile Logout Button */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-error hover:bg-muted transition-colors w-full text-left disabled:opacity-50"
              >
                <Icon name="LogOut" size={20} />
                <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
              </button>
            </nav>
          </div>
        )}
      </div>
      {/* Click outside handlers */}
      {(showNotifications || showUserMenu || showMobileMenu) && (
        <div
          className="fixed inset-0 z-[1300] pointer-events-auto md:pointer-events-none"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default HeaderNavigation;