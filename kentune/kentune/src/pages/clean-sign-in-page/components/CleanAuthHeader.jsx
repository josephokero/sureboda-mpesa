import React from 'react';
import Icon from '../../../components/AppIcon';

const CleanAuthHeader = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-8">
  {/* KENTUNEZ Logo */}
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon name="Music" size={32} color="white" />
      </div>
      
      {/* Title */}
      <h1 className="font-heading font-bold text-3xl text-foreground mb-3">
        {title}
      </h1>
      
      {/* Subtitle */}
      {subtitle && (
        <p className="text-muted-foreground text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default CleanAuthHeader;