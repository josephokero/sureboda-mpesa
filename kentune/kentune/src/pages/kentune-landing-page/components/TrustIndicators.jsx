import React from 'react';
import { Shield, Award, Users, Lock } from 'lucide-react';

const TrustIndicators = () => {
  const partnerships = [
    {
      name: 'Music Copyright Society of Kenya',
      type: 'Industry Partnership',
      icon: Award,
      description: 'Official partnership for rights management'
    },
    {
      name: 'Kenya Musicians Union',
      type: 'Artist Support',
      icon: Users,
      description: 'Supporting local artist development'
    },
    {
      name: 'Safaricom M-Pesa',
      type: 'Payment Security',
      icon: Shield,
      description: 'Secure mobile money integration'
    },
    {
      name: 'PCI DSS Compliant',
      type: 'Data Security',
      icon: Lock,
      description: 'Bank-level security standards'
    }
  ];

  const certifications = [
    'ISO 27001 Security Certified',
    'PCI DSS Compliant Payment Processing',
    'GDPR Compliant Data Protection',
    'Kenya Data Protection Act Compliant'
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Trusted by the Kenyan Music Industry
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            KENTUNE is backed by industry partnerships and security certifications 
            to ensure your music and earnings are protected.
          </p>
        </div>
        
        {/* Partnership Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {partnerships?.map((partner, index) => {
            const IconComponent = partner?.icon;
            return (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-gray-100 transition-colors duration-200">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-8 h-8 text-orange-500" />
                </div>
                <div className="font-semibold text-gray-900 mb-2">{partner?.name}</div>
                <div className="text-sm text-orange-600 font-medium mb-2">{partner?.type}</div>
                <div className="text-sm text-gray-600">{partner?.description}</div>
              </div>
            );
          })}
        </div>

        {/* IntaSend Trust Badge Section */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Secure Payment Processing</h3>
          <div className="inline-block bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <span style={{display:"block", textAlign: "center"}}>        
              <a href="https://intasend.com/security" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://intasend-prod-static.s3.amazonaws.com/img/trust-badges/intasend-trust-badge-with-mpesa-hr-light.png" 
                  width="375px" 
                  alt="IntaSend Secure Payments (PCI-DSS Compliant)"
                  className="max-w-full h-auto"
                />
              </a>        
              <strong>
                <a 
                  style={{display: "block", color: "#454545", textDecoration: "none", fontSize: "0.8em", marginTop: "0.6em"}} 
                  href="https://intasend.com/security" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Secured by IntaSend Payments
                </a>
              </strong>        
            </span>
          </div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Your payments are processed securely through IntaSend, ensuring safe M-Pesa transactions 
            and PCI-DSS compliant payment processing for Kenyan artists.
          </p>
        </div>
        
        {/* Security Certifications */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full mb-4">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Bank-Level Security</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Your Data & Money Are Safe
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We maintain the highest security standards to protect your music, 
              personal information, and earnings.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {certifications?.map((cert, index) => (
              <div key={index} className="flex items-center gap-3 bg-white rounded-xl p-4">
                <div className="bg-green-100 rounded-full p-2">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium text-gray-900">{cert}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Trust Stats */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime Guarantee</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">0</div>
              <div className="text-gray-600">Security Breaches</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;