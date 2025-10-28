import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { Helmet } from 'react-helmet';
import HeaderNavigation from '../../components/ui/HeaderNavigation';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import MonthlyStreamsChart from './components/MonthlyStreamsChart';
import Icon from '../../components/AppIcon';

const AnalyticsRevenueTracking = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [selectedDateRange, setSelectedDateRange] = useState('30days');
  const [customDateRange, setCustomDateRange] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State for user and analytics
  const [isNewUser, setIsNewUser] = useState(false);
  const [memberSince, setMemberSince] = useState(null);

  // All analytics for this artist
  const [platformData, setPlatformData] = useState([]);
  const { user, loading } = useAuth();
  const [planName, setPlanName] = useState('');
  useEffect(() => {
    if (!user) return;
    let unsub = null;
    import('firebase/firestore').then(({ collection, query, where, onSnapshot }) => {
      const q = query(
        collection(db, 'subscriptions'),
        where('userId', '==', user.uid),
        where('status', '==', 'active')
      );
      unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          setPlanName(snap.docs[0].data().planName || '');
        } else {
          // Try alternate field name
          const q2 = query(
            collection(db, 'subscriptions'),
            where('user id', '==', user.uid),
            where('status', '==', 'active')
          );
          onSnapshot(q2, (snap2) => {
            if (!snap2.empty) {
              setPlanName(snap2.docs[0].data().planName || '');
            } else {
              setPlanName('');
            }
          });
        }
      });
    });
    return () => { if (unsub) unsub(); };
  }, [user]);

  useEffect(() => {
    if (!user || planName.toLowerCase().includes('starter')) return;
    let unsub = null;
    import('firebase/firestore').then(({ collection, query, where, onSnapshot }) => {
      const q = query(collection(db, 'analytics'), where('artistId', '==', user.uid));
      unsub = onSnapshot(q, (snap) => {
  setPlatformData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    });
    return () => { if (unsub) unsub(); };
  }, [user, planName]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('kentune-language') || 'en';
    setCurrentLanguage(savedLanguage);
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleExport = (exportOptions) => {
    console.log('Exporting analytics report with options:', exportOptions);
    // Here you would implement the actual export functionality
  };

  // Show loading spinner if either page or userProfile is loading
  if (isLoading || loading || !user || planName === '') {
    return (
      <div className="min-h-screen bg-background">
        <HeaderNavigation isAuthenticated={true} />
        <div className="lg:ml-64">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded-lg w-1/3"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4]?.map((i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg"></div>
                ))}
              </div>
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
        <BottomTabNavigation />
      </div>
    );
  }

  if (planName && planName.toLowerCase().includes('starter')) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderNavigation isAuthenticated={true} />
        <div className="lg:ml-64">
          <div className="container mx-auto px-4 py-8">
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-8 text-center my-12">
              <h1 className="text-3xl font-extrabold text-yellow-800 mb-4 flex items-center gap-2">
                <Icon name="BarChart3" size={32} className="text-yellow-800" />
                Analytics & Stats Unavailable
              </h1>
              <p className="text-yellow-700 mb-4 text-lg">This feature is not available on the Starter plan.<br/>Upgrade your plan to unlock analytics and stats.</p>
              <a href="/pricing" className="inline-block px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-primary/90 transition">Upgrade Plan</a>
              <div className="mt-2 text-sm text-yellow-700">Or <a href="/contact" className="underline text-primary">contact support</a> for assistance.</div>
            </div>
          </div>
        </div>
        <BottomTabNavigation />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Analytics & Revenue Tracking - KenTune</title>
        <meta name="description" content="Track your music performance and revenue with comprehensive analytics and insights." />
      </Helmet>
      <HeaderNavigation isAuthenticated={true} />
      <div className="lg:ml-64">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <h1 className="text-3xl font-extrabold text-primary mb-6 flex items-center gap-2">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6a2 2 0 1 1 4 0v6m-4 0a2 2 0 1 0 4 0m-4 0H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4"/></svg>
            Analytics Overview
          </h1>
          <p className="text-muted-foreground mb-8 text-lg">See all your posted analytics by platform and month. Analytics are posted monthly and may be delayed up to 2-3 months for new artists.</p>
          {platformData.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center text-muted-foreground text-lg">No analytics data available yet.<br/>Analytics are posted monthly and may be delayed up to 2-3 months for new artists.</div>
          ) : (
            <MonthlyStreamsChart analytics={platformData} />
          )}
        </div>
      </div>
      <BottomTabNavigation />
    </div>
  );
};

export default AnalyticsRevenueTracking;