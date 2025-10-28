import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import HeaderNavigation from '../../components/ui/HeaderNavigation';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';

import MetadataForm from './components/MetadataForm';
import MusicCatalog from './components/MusicCatalog';
import BulkUpload from './components/BulkUpload';
import { db } from '../../lib/firebase';

const MusicUploadManagement = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'catalog'
  const [releaseType, setReleaseType] = useState(null); // 'single', 'ep', 'album'
  const [planName, setPlanName] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const { user } = useAuth();
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
            setProfileLoading(false);
          });
        }
        setProfileLoading(false);
      });
    });
    return () => { if (unsub) unsub(); };
  }, [user]);

  // Load language preference
  useEffect(() => {
  const savedLanguage = localStorage.getItem('kentunez-language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);


  const handleMetadataSubmit = async (metadata) => {
    // TODO: Implement actual upload logic
    alert('Release submitted!');
    setReleaseType(null); // Reset to release type selection after submit
  };

  const handleBulkUpload = (bulkData) => {
    console.log('Bulk upload data:', bulkData);
    setShowBulkUpload(false);
    // Handle bulk upload logic here
  };

  const handleEditTrack = (trackId) => {
    console.log('Edit track:', trackId);
    // Navigate to edit track or open edit modal
  };

  const handleDeleteTrack = (trackId) => {
    console.log('Delete track:', trackId);
    // Handle track deletion
  };

  const handleDuplicateTrack = (trackId) => {
    console.log('Duplicate track:', trackId);
    // Handle track duplication
  };

  const text = {
    en: {
      pageTitle: 'Music Upload & Management',
      breadcrumb: {
        dashboard: 'Dashboard',
        music: 'Music',
        upload: 'Upload'
      },
      tabs: {
        upload: 'Upload Music',
        catalog: 'My Music'
      },
      upload: {
        title: 'Upload Your Music',
        subtitle: 'Share your creativity with the world',
        bulkUpload: 'Bulk Upload'
      },
      catalog: {
        title: 'My Music',
        subtitle: 'See all your tracks and their status (pending, processing, live, edits needed, etc.)'
      }
    },
    sw: {
      pageTitle: 'Upakiaji na Usimamizi wa Muziki',
      breadcrumb: {
        dashboard: 'Dashibodi',
        music: 'Muziki',
        upload: 'Pakia'
      },
      tabs: {
        upload: 'Pakia Muziki',
        catalog: 'Katalogi Yangu'
      },
      upload: {
        title: 'Pakia Muziki Wako',
        subtitle: 'Shiriki ubunifu wako na ulimwengu',
        bulkUpload: 'Upakiaji wa Wingi'
      },
      catalog: {
        title: 'Katalogi ya Muziki Wako',
        subtitle: 'Simamia nyimbo zako zilizopakiwa'
      }
    }
  };

  const t = text?.[currentLanguage];

  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation isAuthenticated={true} />
      <div className="lg:ml-64">
        <main className="container mx-auto px-4 py-6 pb-20 lg:pb-6">
          {profileLoading && (
            <div className="text-center py-12 text-lg text-muted-foreground">Loading your subscription...</div>
          )}
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link to="/artist-dashboard" className="hover:text-foreground transition-colors">
              {t?.breadcrumb?.dashboard}
            </Link>
            <Icon name="ChevronRight" size={16} />
            <Link to="/music-upload-management" className="hover:text-foreground transition-colors">
              {t?.breadcrumb?.music}
            </Link>
            <Icon name="ChevronRight" size={16} />
            <span className="text-foreground">{t?.breadcrumb?.upload}</span>
          </nav>

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading font-bold text-2xl lg:text-3xl text-foreground mb-2">
                {t?.pageTitle}
              </h1>
              <p className="text-muted-foreground">
                {activeTab === 'upload' ? t?.upload?.subtitle : t?.catalog?.subtitle}
              </p>
            </div>
            
            {/* Bulk Upload button removed as requested */}
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 mb-8 bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'upload' ?'bg-background text-foreground shadow-subtle' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="Upload" size={16} />
              <span>{t?.tabs?.upload}</span>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'catalog' ?'bg-background text-foreground shadow-subtle' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="Music" size={16} />
              <span>{t?.tabs?.catalog}</span>
            </button>
          </div>

          {/* Content */}
          {activeTab === 'upload' ? (
            <div className="max-w-2xl mx-auto">
              {/* Step 1: Release Type Selection */}
              {!releaseType && (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <h2 className="font-heading font-bold text-2xl mb-4">What type of release do you want to submit?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <button
                      className="flex flex-col items-center p-6 border rounded-lg hover:border-primary focus:border-primary transition-all"
                      onClick={() => setReleaseType('single')}
                    >
                      <span className="mb-2 text-primary">
                        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                      </span>
                      <span className="font-semibold text-lg">Single</span>
                      <span className="text-sm text-muted-foreground mt-1">One track</span>
                    </button>
                    <button
                      className={`flex flex-col items-center p-6 border rounded-lg transition-all ${planName.toLowerCase().includes('starter') ? 'bg-muted cursor-not-allowed opacity-60' : 'hover:border-primary focus:border-primary'}`}
                      onClick={() => !planName.toLowerCase().includes('starter') && setReleaseType('ep')}
                      disabled={planName.toLowerCase().includes('starter')}
                    >
                      <span className="mb-2 text-primary">
                        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8 12h8" /></svg>
                      </span>
                      <span className="font-semibold text-lg">EP</span>
                      <span className="text-sm text-muted-foreground mt-1">3-6 tracks</span>
                      {planName.toLowerCase().includes('starter') && <span className="text-xs text-warning mt-2">Upgrade to unlock EP uploads</span>}
                    </button>
                    <button
                      className={`flex flex-col items-center p-6 border rounded-lg transition-all ${planName.toLowerCase().includes('starter') ? 'bg-muted cursor-not-allowed opacity-60' : 'hover:border-primary focus:border-primary'}`}
                      onClick={() => !planName.toLowerCase().includes('starter') && setReleaseType('album')}
                      disabled={planName.toLowerCase().includes('starter')}
                    >
                      <span className="mb-2 text-primary">
                        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="4" /><path d="M6 12h12" /></svg>
                      </span>
                      <span className="font-semibold text-lg">Album</span>
                      <span className="text-sm text-muted-foreground mt-1">7+ tracks</span>
                      {planName.toLowerCase().includes('starter') && <span className="text-xs text-warning mt-2">Upgrade to unlock Album uploads</span>}
                    </button>
                  </div>
                  {planName.toLowerCase().includes('starter') && <div className="mt-4 text-warning text-sm">Your current plan only allows Single uploads. <a href="/pricing" className="underline text-primary">Upgrade your plan</a> to unlock EP and Album uploads.</div>}
                </div>
              )}
              {/* Step 2: Metadata Form */}
              {releaseType && (
                <div className="bg-card border border-border rounded-lg p-6 mt-8">
                  <MetadataForm
                    onSubmit={handleMetadataSubmit}
                    isSubmitting={false}
                    initialReleaseType={releaseType}
                  />
                  <div className="mt-6 text-center">
                    <button className="text-sm text-muted-foreground underline" onClick={() => setReleaseType(null)}>
                      &larr; Back to release type selection
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Catalog Tab */
            (<MusicCatalog
              onEditTrack={handleEditTrack}
              onDeleteTrack={handleDeleteTrack}
              onDuplicateTrack={handleDuplicateTrack}
            />)
          )}

          {/* Mobile Bulk Upload Button */}

        </main>
      </div>
      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUpload
          onClose={() => setShowBulkUpload(false)}
          onBulkUpload={handleBulkUpload}
        />
      )}
      <BottomTabNavigation />
    </div>
  );
};

export default MusicUploadManagement;