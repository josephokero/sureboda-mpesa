import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const AuthenticationFlow = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location?.pathname === '/artist-login';
  const isRegistrationPage = location?.pathname === '/artist-registration';

  // Language selection removed for footer simplification

  const getPageTitle = () => {
    if (isLoginPage) {
      return currentLanguage === 'en' ? 'Welcome Back' : 'Karibu Tena';
    }
    if (isRegistrationPage) {
  return currentLanguage === 'en' ? 'Join KenTunez' : 'Jiunge na KenTunez';
    }
  return 'KenTunez';
  };

  const getPageSubtitle = () => {
    if (isLoginPage) {
      return currentLanguage === 'en' ?'Sign in to your artist account and continue your musical journey' :'Ingia kwenye akaunti yako ya msanii na uendelee na safari yako ya muziki';
    }
    if (isRegistrationPage) {
      return currentLanguage === 'en' ?'Create your artist profile and start distributing your music across Kenya and beyond' :'Unda wasifu wako wa msanii na uanze kusambaza muziki wako Kenya na nje';
    }
    return '';
  };

  if (!isLoginPage && !isRegistrationPage) {
    return children;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Music" size={20} color="white" />
              </div>
              <span className="font-heading font-bold text-xl text-foreground">KenTunez</span>
            </Link>

            {/* Language Toggle removed for footer simplification */}
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern-kenyan opacity-30"></div>
        
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8 lg:py-16">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
              
              {/* Left Column - Hero Content (Desktop) */}
              <div className="hidden lg:block space-y-8">
                <div className="space-y-6">
                  <h1 className="font-heading font-bold text-4xl xl:text-5xl text-foreground leading-tight">
                    {currentLanguage === 'en' ?'Amplify Your Music Across Kenya' :'Ongeza Sauti ya Muziki Wako Kenya Nzima'
                    }
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {currentLanguage === 'en' ?'Join thousands of Kenyan artists who trust KenTunez to distribute their music to major streaming platforms and grow their fanbase.' :'Jiunge na maelfu ya wasanii wa Kenya wanaomtumaini KenTunez kusambaza muziki wao kwenye majukwaa makuu ya muziki na kukuza mashabiki wao.'
                    }
                  </p>
                </div>

                {/* Trust Indicators */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Icon name="Users" size={20} className="text-primary" />
                      <span className="text-sm font-medium text-foreground">1,000+ Artists</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Music" size={20} className="text-secondary" />
                      <span className="text-sm font-medium text-foreground">50,000+ Tracks</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Globe" size={20} className="text-accent" />
                      <span className="text-sm font-medium text-foreground">Global Reach</span>
                    </div>
                  </div>
                </div>

                {/* Featured Artists */}
                <div className="bg-card rounded-lg p-6 border border-border shadow-card">
                  <h3 className="font-heading font-semibold text-foreground mb-4">
                    {currentLanguage === 'en' ? 'Featured Artists' : 'Wasanii Maarufu'}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3]?.map((i) => (
                      <div key={i} className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-2 flex items-center justify-center">
                          <Icon name="User" size={24} color="white" />
                        </div>
                        <p className="text-sm font-medium text-foreground">Artist {i}</p>
                        <p className="text-xs text-muted-foreground">Genre</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Auth Form */}
              <div className="w-full max-w-md mx-auto lg:max-w-none">
                <div className="bg-card rounded-lg border border-border shadow-modal p-6 lg:p-8">
                  {/* Mobile Hero (Mobile Only) */}
                  <div className="lg:hidden text-center mb-8">
                    <h1 className="font-heading font-bold text-2xl text-foreground mb-2">
                      {getPageTitle()}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {getPageSubtitle()}
                    </p>
                  </div>

                  {/* Desktop Title */}
                  <div className="hidden lg:block mb-8">
                    <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
                      {getPageTitle()}
                    </h2>
                    <p className="text-muted-foreground">
                      {getPageSubtitle()}
                    </p>
                  </div>

                  {/* Form Content */}
                  {children}

                  {/* Footer - Company Info, Contact, Socials, Copyright */}
                  <footer className="mt-8 pt-6 border-t border-border">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="flex items-center space-x-2">
                        <span className="bg-primary text-white font-bold px-3 py-1 rounded">KENTUNEZ</span>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Kenya's leading music distribution platform. Helping Kenyan artists reach global audiences and earn from their music.
                      </p>
                      <div className="flex flex-col items-center space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <span role="img" aria-label="location">📍</span>
                          <span>Nairobi, Kenya</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span role="img" aria-label="email">✉️</span>
                          <a href="mailto:support@kentunez.com" className="hover:text-primary transition-colors">support@kentunez.com</a>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span role="img" aria-label="phone">📞</span>
                          <a href="tel:+254701956808" className="hover:text-primary transition-colors">+254701956808</a>
                        </div>
                      </div>
                      {/* Removed 'Follow us' section as requested */}
                      <div className="text-xs text-muted-foreground mt-2">
                        © 2025 KENTUNEZ. All rights reserved. Empowering Kenyan music globally. Powered by Astute Pro Music.
                      </div>
                          <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground mt-2">
                            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
                              Privacy Policy
                            </Link>
                            <Link to="/terms-and-conditions" className="hover:text-foreground transition-colors">
                              Terms and Conditions
                            </Link>
                          </div>
                    </div>
                  </footer>
                </div>

                {/* Trust Badge */}
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center space-x-2 text-xs text-muted-foreground bg-muted rounded-full px-4 py-2">
                    <Icon name="Shield" size={14} className="text-success" />
                    <span>
                      {currentLanguage === 'en' ?'Secure & Trusted by 1,000+ Artists' :'Salama & Inaaminika na Wasanii 1,000+'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthenticationFlow;