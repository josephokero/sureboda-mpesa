import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import HeaderNavigation from '../../components/ui/HeaderNavigation';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import PublicProfileTab from './components/PublicProfileTab';
import { logArtistActivity } from '../artist-dashboard/components/RecentActivity';
import AccountSettingsTab from './components/AccountSettingsTab';
import ProfilePreview from './components/ProfilePreview';

const ArtistProfileManagement = () => {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Wait for Firebase Auth state before fetching profile
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setProfileError('User not authenticated');
      setLoadingProfile(false);
      return;
    }
    async function fetchProfile() {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        const docRef = doc(db, 'profiles', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        } else {
          setProfileError('Profile not found');
        }
      } catch (err) {
        setProfileError('Failed to load profile');
      }
      setLoadingProfile(false);
    }
    fetchProfile();
  }, [authLoading, currentUser]);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('public');
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [profileData, setProfileData] = useState(null);

  const tabs = [
    {
      id: 'public',
      label: currentLanguage === 'en' ? 'Public Profile' : 'Wasifu wa Umma',
      icon: 'User',
      component: PublicProfileTab
    }
  ];

  // Load language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('kentune-language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const handleTabChange = (tabId) => {
    if (hasUnsavedChanges) {
      setShowSaveDialog(true);
      return;
    }
    setActiveTab(tabId);
  };

  const handleUpdateProfile = (section, data) => {
    setProfileData(prev => ({
      ...prev,
      ...data
    }));
    setHasUnsavedChanges(false);
    // Log activity for any profile update
    if (currentUser?.uid) {
      let activity = {
        title: '',
        description: '',
        status: 'updated',
        icon: 'Edit',
        color: 'bg-info',
      };
      if (section === 'public' && data?.photoURL && profileData?.photoURL !== data.photoURL) {
        activity = {
          title: 'Profile Photo Updated',
          description: 'You changed your profile photo.',
          status: 'photo',
          icon: 'User',
          color: 'bg-secondary',
        };
      } else if (section === 'public') {
        activity = {
          title: 'Public Profile Updated',
          description: 'You updated your public profile information.',
          status: 'updated',
          icon: 'User',
          color: 'bg-info',
        };
      } else if (section === 'account') {
        activity = {
          title: 'Account Settings Updated',
          description: 'You updated your account settings.',
          status: 'updated',
          icon: 'Settings',
          color: 'bg-primary',
        };
      } else if (section === 'verification') {
        activity = {
          title: 'Verification Details Updated',
          description: 'You updated your verification details.',
          status: 'updated',
          icon: 'Shield',
          color: 'bg-accent',
        };
      }
      logArtistActivity(currentUser.uid, activity);
    }
    // Show success message
    console.log(`${section} profile updated successfully`);
  };

  const handleSaveChanges = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setProfileError('User not authenticated');
        return;
      }
      // Save to Firestore
      await setDoc(doc(db, 'profiles', user.uid), profileData, { merge: true });
      setHasUnsavedChanges(false);
      setShowSaveDialog(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setProfileError('Failed to save profile');
    }
  };
      {/* Save Success Popup */}
      {saveSuccess && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded shadow-lg flex items-center space-x-2">
          <Icon name="CheckCircle" size={20} className="text-white" />
          <span>Saved successfully!</span>
        </div>
      )}

  const handleDiscardChanges = () => {
    setHasUnsavedChanges(false);
    setShowSaveDialog(false);
    setActiveTab(activeTab);
  };

  const getCurrentTabComponent = () => {
    const currentTab = tabs?.find(tab => tab?.id === activeTab);
    if (!currentTab) return null;

    const Component = currentTab?.component;
  if (authLoading || loadingProfile) return <div>Loading profile...</div>;
  if (profileError) return <div className="text-error">{profileError}</div>;
  if (!profileData) return null;
    return (
      <Component
        profileData={profileData}
        onUpdateProfile={handleUpdateProfile}
        currentLanguage={currentLanguage}
      />
    );
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: currentLanguage === 'en' ? 'Dashboard' : 'Dashibodi', path: '/artist-dashboard' },
      { label: currentLanguage === 'en' ? 'Profile Management' : 'Usimamizi wa Wasifu', path: '/artist-profile-management' }
    ];

    const currentTab = tabs?.find(tab => tab?.id === activeTab);
    if (currentTab) {
      breadcrumbs?.push({ label: currentTab?.label, path: '' });
    }

    return breadcrumbs;
  };

  return (
    <>
      <Helmet>
        <title>
          {currentLanguage === 'en' ?'Artist Profile Management - KenTune' :'Usimamizi wa Wasifu wa Msanii - KenTune'
          }
        </title>
        <meta 
          name="description" 
          content={currentLanguage === 'en' ?'Manage your artist profile, account settings, and verification status on KenTune' :'Simamia wasifu wako wa msanii, mipangilio ya akaunti, na hali ya uthibitisho kwenye KenTune'
          } 
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <HeaderNavigation isAuthenticated={true} userProfile={{
          name: profileData?.stageName,
          email: profileData?.email,
          profile_image_url: profileData?.profilePhoto || profileData?.profile_image_url || ''
        }} />
        
        <div className="lg:pl-64">
          <main className="container mx-auto px-4 py-6 pb-20 lg:pb-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
              {getBreadcrumbs()?.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Icon name="ChevronRight" size={16} />}
                  <span className={index === getBreadcrumbs()?.length - 1 ? 'text-foreground font-medium' : 'hover:text-foreground cursor-pointer'}>
                    {crumb?.label}
                  </span>
                </React.Fragment>
              ))}
            </nav>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                  {currentLanguage === 'en' ? 'Profile Management' : 'Usimamizi wa Wasifu'}
                </h1>
                <p className="text-muted-foreground">
                  {currentLanguage === 'en' ?'Manage your public profile, account settings, and verification status' :'Simamia wasifu wako wa umma, mipangilio ya akaunti, na hali ya uthibitisho'
                  }
                </p>
              </div>
              
              {/* Show Preview button removed as requested */}
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Main Content */}
              <div className={`${showPreview ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                {/* Tab Navigation */}
                <div className="bg-card rounded-lg border border-border mb-6">
                  <div className="flex overflow-x-auto">
                    {tabs?.map((tab) => (
                      <button
                        key={tab?.id}
                        onClick={() => handleTabChange(tab?.id)}
                        className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                          activeTab === tab?.id
                            ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <Icon name={tab?.icon} size={16} />
                        <span>{tab?.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {getCurrentTabComponent()}
                </div>
              </div>

              {/* Preview Panel (Desktop) */}
              {showPreview && (
                <div className="hidden lg:block lg:col-span-4">
                  <div className="sticky top-24">
                    <ProfilePreview 
                      profileData={profileData} 
                      currentLanguage={currentLanguage} 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Preview Modal */}
            {showPreview && (
              <div className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-1200 flex items-center justify-center p-4">
                <div className="bg-background rounded-lg border border-border w-full max-w-sm max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
                    <h3 className="font-heading font-semibold text-foreground">
                      {currentLanguage === 'en' ? 'Profile Preview' : 'Muhtasari wa Wasifu'}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPreview(false)}
                    >
                      <Icon name="X" size={20} />
                    </Button>
                  </div>
                  <ProfilePreview 
                    profileData={profileData} 
                    currentLanguage={currentLanguage} 
                  />
                </div>
              </div>
            )}

            {/* Save Changes Dialog */}
            {showSaveDialog && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-1200 flex items-center justify-center p-4">
                <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md">
                  <div className="flex items-start space-x-3 mb-4">
                    <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
                    <div>
                      <h3 className="font-heading font-semibold text-foreground mb-2">
                        {currentLanguage === 'en' ? 'Unsaved Changes' : 'Mabadiliko Hayajahifadhiwa'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {currentLanguage === 'en' ?'You have unsaved changes. Do you want to save them before switching tabs?' :'Una mabadiliko ambayo hayajahifadhiwa. Je, ungependa kuyahifadhi kabla ya kubadilisha vichupo?'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleDiscardChanges}
                    >
                      {currentLanguage === 'en' ? 'Discard' : 'Ondoa'}
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleSaveChanges}
                    >
                      {currentLanguage === 'en' ? 'Save Changes' : 'Hifadhi Mabadiliko'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        <BottomTabNavigation />
      </div>
    </>
  );
};

export default ArtistProfileManagement;