  const PremiumBlocker = ({ children }) => (
    <div className="relative group">
      <div className="pointer-events-none opacity-60">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
        <span className="text-red-600 font-semibold text-sm bg-white rounded px-3 py-1 shadow">Your plan expired. <button className="underline text-primary" onClick={() => window.location.href = '/pricing'}>Renew now</button></span>
      </div>
    </div>
  );
import React, { useState, useEffect } from 'react';
import Joyride from 'react-joyride';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import HeaderNavigation from '../../components/ui/HeaderNavigation';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import WelcomeBanner from './components/WelcomeBanner';
import MetricsCard from './components/MetricsCard';
import TopStatsCards from '../../components/TopStatsCards';
import QuickActions from './components/QuickActions';
import RecentActivity from './components/RecentActivity';
import RevenueSummary from './components/RevenueSummary';
import MusicCatalogPreview from './components/MusicCatalogPreview';
import Payments from '../payments/index';

const ArtistDashboard = () => {
  // All hooks at the top, before any return or conditional
  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [PricingPage, setPricingPage] = useState(null);
  const [distributedTracks, setDistributedTracks] = useState([]);
  const [distributedLoading, setDistributedLoading] = useState(true);
  const [analytics, setAnalytics] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [hideExpiryMsg, setHideExpiryMsg] = useState(false);
  const [showTour, setShowTour] = useState(() => {
    return localStorage.getItem('kentunez-artist-tour') !== 'completed';
  });
  const { isFrozen, userProfile, user } = useAuth();

    // Helper: get plan type string
    const dashboardPlan = (subscription?.planType || subscription?.plan || '').toLowerCase();
    const isStarter = dashboardPlan.includes('starter');

  // Always define artistData at the top so it's available for all renders
  const artistData = {
    name: userProfile?.stage_name || userProfile?.full_name || userProfile?.stageName || userProfile?.fullName || user?.email?.split('@')?.[0] || "Artist",
    genre: userProfile?.genres?.[0] || userProfile?.genre || "Afrobeat",
    avatar: userProfile?.profilePhoto || userProfile?.profile_image_url || userProfile?.profile_photo || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    isVerified: userProfile?.is_verified || false,
    memberSince: userProfile?.createdAt || userProfile?.created_at ? new Date(userProfile?.createdAt || userProfile?.created_at)?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Recently",
    distributedSongs: 0,
    followers: userProfile?.followers || 0,
    distributionStatus: userProfile?.status === 'active' ? 'active' : 'pending',
    email: userProfile?.email || user?.email,
    location: userProfile?.location,
    bio: userProfile?.bio,
    website: userProfile?.website,
    phone: userProfile?.phone
  };

  // Define isExpired based on subscription expiry date
  let expiryDate;
  if (subscription?.expiryDate) {
    if (typeof subscription.expiryDate === 'object' && subscription.expiryDate.seconds) {
      expiryDate = new Date(subscription.expiryDate.seconds * 1000);
    } else {
      expiryDate = new Date(subscription.expiryDate);
    }
  } else if (subscription?.['purchase date']) {
    const purchase = subscription['purchase date'].seconds ? new Date(subscription['purchase date'].seconds * 1000) : new Date(subscription['purchase date']);
    if (subscription.planPeriod === 'yearly' || subscription.billingPeriod === 'yearly') {
      expiryDate = new Date(purchase);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate = new Date(purchase);
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }
  }
  const isExpired = expiryDate ? expiryDate < new Date() : false;

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { doc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');
        const db = (await import('../../lib/firebase')).db;
        // Try to get active subscription by user id
        let snap, q;
        q = query(collection(db, 'subscriptions'), where('userId', '==', user.uid), where('status', '==', 'active'));
        snap = await getDocs(q);
        if (snap.empty) {
          q = query(collection(db, 'subscriptions'), where('user id', '==', user.uid), where('status', '==', 'active'));
          snap = await getDocs(q);
        }
        if (!snap.empty) {
          setSubscription({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          setSubscription(null);
        }
      } catch (err) {
        setSubscription(null);
      } finally {
        setLoadingSubscription(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    import('../pricing.jsx').then(mod => setPricingPage(() => mod.default));
  }, []);

  // If loading, show spinner
  if (loadingSubscription) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="loader" /></div>;
  }

  // If no active subscription, show pricing page only
  if (!subscription) {
    return PricingPage ? <PricingPage /> : <div className="min-h-screen flex items-center justify-center bg-background"><div className="loader" /></div>;
  }
  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation isAuthenticated={true} userProfile={artistData} />
      {/* Only use the main homepage side menu for navigation and plan info. No custom sidebar for mobile. */}
      <main className="lg:ml-64 pt-4 pb-20 lg:pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Welcome Banner */}
          <div className="welcome-banner">
            <WelcomeBanner artist={artistData} />
            {/* Plan Info Card below Welcome Banner */}
            {subscription && (
              <div className="bg-card border border-primary rounded-lg p-4 mb-6 shadow flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="w-full text-center my-2">
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#e67e22' }}>
                      N/B: After updating your plan, please call or WhatsApp our finance team at <a href="tel:0743066593" className="underline text-primary">0743066593</a> or <a href="tel:0701956808" className="underline text-primary">0701956808</a> so that your account can be updated.
                    </span>
                  </div>
                  <div className="font-bold text-primary text-lg mb-1">Plan Name: {subscription.planName || 'N/A'}</div>
                  <div className="text-muted-foreground text-sm mb-1">Plan Type: {subscription.planType || 'N/A'}</div>
                  <div className="text-muted-foreground text-sm mb-1">Amount Paid: KSh {subscription.amountPaid || 'N/A'}</div>
                  <div className="text-muted-foreground text-sm mb-1">Status: {subscription.status || 'N/A'}</div>
                  <div className="text-muted-foreground text-sm mb-1">User ID: {subscription.userId || 'N/A'}</div>
                  <div className="text-muted-foreground text-sm mb-1">Purchase Date: {subscription.purchaseDate ? new Date(subscription.purchaseDate.seconds ? subscription.purchaseDate.seconds * 1000 : subscription.purchaseDate).toLocaleDateString('en-GB') : (subscription['purchase date'] ? new Date(subscription['purchase date'].seconds ? subscription['purchase date'].seconds * 1000 : subscription['purchase date']).toLocaleDateString('en-GB') : 'N/A')}</div>
                  <div className="text-muted-foreground text-sm mb-1">Expiry Date: {subscription.expiryDate ? new Date(subscription.expiryDate.seconds ? subscription.expiryDate.seconds * 1000 : subscription.expiryDate).toLocaleDateString('en-GB') : 'N/A'}</div>
                </div>
                <div className="mt-3 md:mt-0 md:ml-6 flex flex-col items-start">
                  <span className="text-xs text-warning font-semibold mb-2">Update before your plan ends.</span>
                  <button
                    className="bg-primary text-white px-4 py-2 rounded font-semibold hover:bg-primary/90 transition"
                    onClick={() => window.location.href = '/pricing'}
                  >{isExpired ? 'Renew Plan' : 'Update Plan'}</button>
                </div>
              </div>
            )}
          </div>
          {/* Quick Actions */}
          <div className="quick-actions mt-6">
            <QuickActions />
          </div>
          {/* Recent Activity */}
          <div className="recent-activity mt-6">
            <RecentActivity />
          </div>
          {/* Recent Uploads */}
          <div className="music-catalog-preview mt-6">
            <MusicCatalogPreview tracks={[]} />
            <div className="text-center text-muted-foreground mt-8">No music uploaded yet.</div>
          </div>
        </div>
      </main>
      <BottomTabNavigation />
    </div>
  );
  useEffect(() => {
  console.log('useEffect running, user:', user);
  async function fetchSubscription() {
      if (!user) {
        console.log('No user found, skipping subscription fetch');
        setLoadingSubscription(false);
        return;
      }
      try {
        const { doc, getDoc, collection, query, where, getDocs } = await import('firebase/firestore');
        const db = (await import('../../lib/firebase')).db;
        // Get user profile for currentSubscriptionId
        const profileRef = doc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        console.log('ProfileSnap exists:', profileSnap.exists());
        if (profileSnap.exists()) {
          console.log('ProfileSnap data:', profileSnap.data());
        }
        let subId = profileSnap.exists() ? profileSnap.data().currentSubscriptionId : null;
        let subData = null;
        console.log('Profile snapshot:', profileSnap.exists() ? profileSnap.data() : null);
        if (subId) {
          // Fetch subscription by ID
          const subRef = doc(db, 'subscriptions', subId);
          const subSnap = await getDoc(subRef);
          console.log('Subscription snapshot by ID:', subSnap.exists() ? subSnap.data() : null);
          if (subSnap.exists()) subData = { id: subSnap.id, ...subSnap.data() };
        } else {
          // Fallback: try both 'user id' and 'userId' fields
          let snap, q;
          q = query(collection(db, 'subscriptions'), where('user id', '==', user.uid), where('status', '==', 'active'));
          snap = await getDocs(q);
          console.log("Trying 'user id' field. Query result:", snap.docs.map(doc => doc.data()));
          if (snap.empty) {
            q = query(collection(db, 'subscriptions'), where('userId', '==', user.uid), where('status', '==', 'active'));
            snap = await getDocs(q);
            console.log("Trying 'userId' field. Query result:", snap.docs.map(doc => doc.data()));
          }
          if (!snap.empty) subData = { id: snap.docs[0].id, ...snap.docs[0].data() };
        }
        setSubscription(subData);
        console.log('Final subscription data:', subData);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setSubscription(null);
      } finally {
        setLoadingSubscription(false);
      }
    }
    fetchSubscription();
  }, [user]);
  // If artist account is frozen, show freeze message immediately
  if (isFrozen) {
    return (
      <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 480, width: '100%', padding: 32, textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#e53e3e', marginBottom: 24 }}>Your account is frozen</h2>
          <p style={{ marginBottom: 32, color: '#444', fontSize: 18 }}>
            Your artist dashboard is currently disabled because you have not paid for a plan.<br />
            To activate your account and access all features, please choose a plan and complete your payment.
          </p>
          <a href="/pricing" style={{ display: 'inline-block', padding: '18px 40px', background: '#3182ce', color: '#fff', fontWeight: 600, borderRadius: 12, fontSize: 20, textDecoration: 'none', boxShadow: '0 2px 8px rgba(49,130,206,0.15)' }}>
            View Plans &amp; Pay Now
          </a>
        </div>
      </div>
    );
  }
  // Remove spinner: always show dashboard if not frozen
  // If distributedTracks is empty, show dashboard with empty state
  if (Array.isArray(distributedTracks) && distributedTracks.length === 0) {
    // ...existing code for dashboard...
    const artistData = {
      name: userProfile?.stage_name || userProfile?.full_name || userProfile?.stageName || userProfile?.fullName || user?.email?.split('@')?.[0] || "Artist",
      genre: userProfile?.genres?.[0] || userProfile?.genre || "Afrobeat",
      avatar: userProfile?.profilePhoto || userProfile?.profile_image_url || userProfile?.profile_photo || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      isVerified: userProfile?.is_verified || false,
      memberSince: userProfile?.createdAt || userProfile?.created_at ? new Date(userProfile?.createdAt || userProfile?.created_at)?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Recently",
      distributedSongs: 0,
      followers: userProfile?.followers || 0,
      distributionStatus: userProfile?.status === 'active' ? 'active' : 'pending',
      email: userProfile?.email || user?.email,
      location: userProfile?.location,
      bio: userProfile?.bio,
      website: userProfile?.website,
      phone: userProfile?.phone
    };
    const metricsData = [
      {
        title: "Total Streams",
        value: userProfile?.totalStreams ? userProfile.totalStreams.toLocaleString() : "0",
        change: userProfile?.streamsChange || "+0%",
        changeType: "positive",
        icon: "Play",
        color: "bg-primary",
        subtitle: "This month"
      },
      {
        title: "Monthly Revenue",
        value: `KSh 0`,
        change: userProfile?.revenueChange || "+0%",
        changeType: "positive",
        icon: "DollarSign",
        color: "bg-success",
        subtitle: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      },
      {
        title: "Distributed Songs",
        value: "0",
        change: '',
        changeType: "positive",
        icon: "Music",
        color: "bg-secondary",
        subtitle: "Distributed to platforms"
      }
    ];
    const recentTracks = [];
    return (
      <div className="min-h-screen bg-background">
        <HeaderNavigation isAuthenticated={true} userProfile={artistData} />
        <main className="lg:ml-64 pt-4 pb-20 lg:pb-8">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Welcome Banner */}
            <div className="welcome-banner">
              <WelcomeBanner artist={artistData} />
            </div>
            {/* Top 3 Analytics Stats */}
              {isStarter ? (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 text-center my-6">
                  <h3 className="text-lg font-bold text-yellow-800 mb-2">Stats & Analytics Unavailable</h3>
                  <p className="text-yellow-700 mb-2">Upgrade your plan to access stats and analytics features.</p>
                  <a href="/pricing" className="inline-block px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-primary/90 transition">Upgrade Plan</a>
                  <div className="mt-2 text-sm text-yellow-700">Or <a href="/contact" className="underline text-primary">contact support</a> for assistance.</div>
                </div>
              ) : (
                <TopStatsCards stats={analytics} />
              )}
            {/* Metrics Card */}
            <div className="metrics-card">
              <MetricsCard data={metricsData} />
            </div>
            {/* Quick Actions */}
              <div className="quick-actions">
                {isStarter ? (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 text-center my-6">
                    <h3 className="text-lg font-bold text-yellow-800 mb-2">EP/Album Submission Unavailable</h3>
                    <p className="text-yellow-700 mb-2">Upgrade your plan to submit EPs or albums for distribution.</p>
                    <a href="/pricing" className="inline-block px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-primary/90 transition">Upgrade Plan</a>
                  </div>
                ) : (
                  <QuickActions />
                )}
              </div>
            {/* Recent Activity */}
            <div className="recent-activity">
              <RecentActivity />
            </div>
            {/* Music Catalog Preview */}
            <div className="music-catalog-preview">
              <MusicCatalogPreview tracks={recentTracks} />
              <div className="text-center text-muted-foreground mt-8">No music uploaded yet.</div>
            </div>
          </div>
        </main>
        <BottomTabNavigation />
      </div>
    );
  }
  // Joyride onboarding state
  // ...existing code...

  const tourSteps = [
    {
      target: '.welcome-banner',
      content: 'Welcome to your Artist Dashboard! Here you can see your stats and manage your music.',
    },
    {
      target: '.metrics-card',
      content: 'Track your streams, revenue, and distributed songs here.',
    },
    {
      target: '.quick-actions',
      content: 'Use these quick actions to upload music, view analytics, or manage your profile.',
    },
    {
      target: '.recent-activity',
      content: 'See your latest activity and updates here.',
    },
    {
      target: '.music-catalog-preview',
      content: 'Preview your distributed music catalog.',
    },
  ];
  // Handle tour completion or skip
  const handleTourCallback = (data) => {
    const { status, action } = data;
    if (['finished', 'skipped'].includes(status) || action === 'close') {
      setShowTour(false);
      localStorage.setItem('kentunez-artist-tour', 'completed');
    }
  };
  // All hooks at the top, before any return or conditional
  // ...existing code...
  // Example usage: wrap premium dashboard sections
  // ...existing code...

  // Main render
  return (
    <>
      {/* Expired plan message at top */}
      {isExpired && (
        <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
          <div className="m-2 px-4 py-2 rounded-lg border border-red-400 bg-red-50 text-red-900 shadow flex items-center gap-3 animate-pulse relative" style={{ pointerEvents: 'auto' }}>
            <span className="font-bold">Your plan has expired.</span>
            <button
              className="ml-2 px-3 py-1 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition"
              onClick={() => window.location.href = '/pricing'}
            >Renew</button>
          </div>
        </div>
      )}
      {/* Expiry countdown message */}
      {isExpiringSoon && !isExpired && !hideExpiryMsg && (
        <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
          <div className="m-2 px-4 py-2 rounded-lg border border-yellow-400 bg-yellow-50 text-yellow-900 shadow flex items-center gap-3 animate-pulse relative" style={{ pointerEvents: 'auto' }}>
            <span className="font-bold">Your plan expires in {daysLeft} day{daysLeft === 1 ? '' : 's'}.</span>
            <button
              className="ml-2 px-3 py-1 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition"
              onClick={() => window.location.href = '/pricing'}
            >Renew</button>
            <button
              onClick={() => setHideExpiryMsg(true)}
              aria-label="Close reminder"
              className="ml-2 text-yellow-900 hover:text-red-600 text-lg font-bold bg-transparent border-none cursor-pointer"
              style={{ lineHeight: 1 }}
            >×</button>
          </div>
        </div>
      )}
      {/* ...existing dashboard JSX... */}
    </>
  );
  // Display plan info at the top of the dashboard
  // ...existing code...
  if (subscription === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">No active subscription found</h2>
          <p className="text-muted-foreground">You do not have an active plan. <a href="/pricing" className="underline text-primary">Subscribe now</a> or contact support.</p>
        </div>
      </div>
    );
  }
  // Only show expiry/renewal messages if subscription exists
  let popup = null;
  if (isExpired) {
    popup = (
      <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
        <div className="m-2 px-4 py-2 rounded-lg border border-red-400 bg-red-50 text-red-900 shadow flex items-center gap-3 animate-pulse relative" style={{ pointerEvents: 'auto' }}>
          <span className="font-bold">Your plan has expired.</span>
          <button
            className="ml-2 px-3 py-1 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition"
            onClick={() => window.location.href = '/pricing'}
          >Renew</button>
        </div>
      </div>
    );
  } else if (isExpiringSoon && !hideExpiryMsg) {
    popup = (
      <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
        <div className="m-2 px-4 py-2 rounded-lg border border-yellow-400 bg-yellow-50 text-yellow-900 shadow flex items-center gap-3 animate-pulse relative" style={{ pointerEvents: 'auto' }}>
          <span className="font-bold">Your plan expires in {daysLeft} day{daysLeft === 1 ? '' : 's'}.</span>
          <button
            className="ml-2 px-3 py-1 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition"
            onClick={() => window.location.href = '/pricing'}
          >Renew</button>
          <button
            onClick={() => setHideExpiryMsg(true)}
            aria-label="Close reminder"
            className="ml-2 text-yellow-900 hover:text-red-600 text-lg font-bold bg-transparent border-none cursor-pointer"
            style={{ lineHeight: 1 }}
          >×</button>
        </div>
      </div>
    );
  }
  // Main render
  return (
    <>
      {popup}
      {/* ...existing dashboard JSX... */}
    </>
  );
  // ...existing code...

  // ...existing code...

  // Calculate earnings summary
  // ...existing code...

  // If still loading authentication, show loading state
  // ...existing code...

  // ...existing code...
  // Payment gating disabled for testing: allow all users to access dashboard

  // Fetch distributed tracks live
  useEffect(() => {
    if (!user) return;
    setDistributedLoading(true);
    let unsub = null;
    import('firebase/firestore').then(({ collection, query, where, onSnapshot }) => {
      const q = query(
        collection(db, 'music_releases'),
        where('userId', '==', user.uid),
        where('status', 'in', ['distributed', 'live'])
      );
      unsub = onSnapshot(q, (snap) => {
        setDistributedTracks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setDistributedLoading(false);
      });
    });
    return () => { if (unsub) unsub(); };
  }, [user]);
  // ...existing code...
  // Live metrics data from userProfile (replace with real values as available)
  const metricsData = [
    {
      title: "Total Streams",
      value: userProfile?.totalStreams ? userProfile.totalStreams.toLocaleString() : "0",
      change: userProfile?.streamsChange || "+0%",
      changeType: "positive",
      icon: "Play",
      color: "bg-primary",
      subtitle: "This month"
    },
    {
      title: "Monthly Revenue",
      value: `KSh ${earnings.filter(e => {
        const d = new Date(e.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).reduce((sum, e) => sum + (Number(e.amount) || 0), 0).toLocaleString()}`,
      change: userProfile?.revenueChange || "+0%",
      changeType: "positive",
      icon: "DollarSign",
      color: "bg-success",
      subtitle: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    },
    {
      title: "Total Earned",
      value: `KSh ${earnings.reduce((sum, e) => sum + (Number(e.amount) || 0), 0).toLocaleString()}`,
      change: '',
      changeType: "positive",
      icon: "Calendar",
      color: "bg-secondary",
      subtitle: "All Time"
    },
    {
      title: "Distributed Songs",
      value: distributedTracks.length.toString(),
      change: '',
      changeType: "positive",
      icon: "Music",
      color: "bg-secondary",
      subtitle: "Distributed to platforms"
    }
  ];

  // Use distributedTracks as recent tracks for MusicCatalogPreview
  const recentTracks = distributedTracks;


  return (
    <>
      {showTour && (
        <Joyride
          steps={tourSteps}
          continuous
          showSkipButton
          showProgress
          showCloseButton
          disableScrolling={true}
          styles={{ options: { zIndex: 10000 } }}
          callback={handleTourCallback}
        />
      )}
      <div className="min-h-screen bg-background">
        <HeaderNavigation isAuthenticated={true} userProfile={artistData} />
        <main className="lg:ml-64 pt-4 pb-20 lg:pb-8">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Profile Settings Section - always accessible */}
            <div className="profile-settings-section">
              {/* You may want to link to /artist-profile-management or render a summary here */}
              <a href="/artist-profile-management" className="block mb-6">
                <div className="bg-card border border-border rounded-lg p-4 flex items-center space-x-3 hover:bg-accent transition">
                  <Icon name="User" size={24} className="text-primary" />
                  <div>
                    <h2 className="font-heading font-semibold text-lg text-foreground">Profile Settings</h2>
                    <p className="text-muted-foreground text-sm">Manage your public profile, account settings, and verification status.</p>
                  </div>
                </div>
              </a>
            </div>

            {/* All other dashboard features are blocked if plan is expired */}
            {isPlanExpired ? (
              <PremiumBlocker message={
                <div className="flex flex-col items-center justify-center space-y-4">
                  <span>Your subscription has expired. Renew to unlock all dashboard features!</span>
                  <button
                    className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary/90 transition"
                    onClick={() => window.location.href = '/pricing'}
                  >
                    Renew
                  </button>
                </div>
              } />
            ) : (
              <>
                {/* Welcome Banner */}
                <div className="welcome-banner">
                  <WelcomeBanner artist={artistData} />
                </div>
                {/* Top 3 Analytics Stats */}
                <TopStatsCards stats={analytics} />
                {/* Metrics Card */}
                <div className="metrics-card">
                  <MetricsCard data={metricsData} />
                </div>
                {/* Quick Actions */}
                <div className="quick-actions">
                  <QuickActions />
                </div>
                {/* Recent Activity */}
                <div className="recent-activity">
                  <RecentActivity />
                </div>
                {/* Music Catalog Preview */}
                <div className="music-catalog-preview">
                  <MusicCatalogPreview tracks={recentTracks} />
                </div>
              </>
            )}
          </div>
        </main>
        <BottomTabNavigation />
      </div>
    </>
  );
};

export default ArtistDashboard;