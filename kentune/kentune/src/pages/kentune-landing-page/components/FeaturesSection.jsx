import React from 'react';
import { Globe, Smartphone, BarChart3, Award, Rocket } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Rocket,
      title: 'Fast & Secure Distribution',
      description: 'We distribute your song faster and securely to all digital platforms in less than a week.',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      icon: Globe,
      title: 'Multi-Platform Distribution',
      description: 'Get your music on Spotify, Apple Music, YouTube Music, Boomplay, and 150+ digital platforms with one upload.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Smartphone,
      title: 'M-Pesa Royalty Payments',
      description: 'Receive your earnings directly to your M-Pesa account. Fast, secure, and convenient for Kenyan artists.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Track your streams, earnings, and fan demographics with detailed analytics and reporting tools.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Award,
      title: 'Artist Verification Badges',
      description: 'Get verified artist badges on major platforms to build credibility and connect with your fans.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: BarChart3,
      title: 'Affordable Marketing Advantage',
      description: 'Promote your track for only KSh 300 and reach more fans with our expert marketing support.',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: Rocket,
      title: 'Radio-Ready Sound',
      description: 'Transform your music to radio-ready quality with our professional mastering and engineering.',
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            KENTUNEZ provides Kenyan artists with powerful tools and services to distribute, 
            promote, and monetize their music globally.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features?.map((feature, index) => {
            const IconComponent = feature?.icon;
            return (
              <div key={index} className="text-center group">
                <div className={`${feature?.color} w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature?.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature?.description}
                </p>
              </div>
            );
          })}
        </div>
        
        {/* Mobile-First Design Note */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-50 px-6 py-3 rounded-full">
            <Smartphone className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Optimized for mobile-first Kenya
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;