import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthenticationFlow from '../../components/ui/AuthenticationFlow';
import LoginForm from './components/LoginForm';
import Icon from '../../components/AppIcon';

const ArtistLogin = () => {


  return (
    <AuthenticationFlow>
      {/* Main Sign In Card and all content as a single child */}
      <>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Main Sign In Card */}
            <div className="bg-card border border-border rounded-2xl shadow-2xl p-8">
              {/* Header Section */}
              <div className="text-center mb-8">
                {/* KenTunez Logo/Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Icon name="Music" size={40} color="white" />
                </div>
                {/* Welcome Text */}
                <h1 className="font-heading font-bold text-3xl text-foreground mb-3">
                  Welcome Back
                </h1>
                <p className="text-muted-foreground text-lg">
                  Sign in to continue your musical journey
                </p>
              </div>
              {/* Login Form */}
              <LoginForm />
              {/* Divider */}
              <div className="mt-8 pt-6 border-t border-border">
                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Don't have an account? 
                    <Link 
                      to="/artist-registration" 
                      className="text-primary hover:text-primary/80 font-semibold transition-colors hover:underline"
                    >
                      Create Account
                    </Link>
                  </p>
                </div>
              </div>
            </div>
            {/* Trust Badge */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-card border border-border rounded-full px-4 py-2 shadow-sm">
                <Icon name="Shield" size={16} className="text-success" />
                <span className="font-medium">
                  Trusted by 1,000+ Artists
                </span>
              </div>
            </div>
            {/* Footer links removed as requested */}
            {/* Success Story Preview - Subtle */}
            <div className="mt-12 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-xl p-6 border border-primary/10">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <Icon name="Star" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Faith Njeri</p>
                    <p className="text-sm text-muted-foreground">
                      Gospel Artist
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "KenTunez helped me reach over 500K streams in my first year"
                </p>
                <div className="mt-3 flex items-center justify-center space-x-4 text-xs text-primary font-medium">
                  <span>500K+ Streams</span>
                  <span>•</span>
                  <span>Mombasa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </AuthenticationFlow>
  );
};

export default ArtistLogin;