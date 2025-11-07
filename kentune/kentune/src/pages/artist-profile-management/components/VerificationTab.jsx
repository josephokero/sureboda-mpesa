import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const VerificationTab = ({ profileData, onUpdateProfile, currentLanguage }) => {
  const [verificationData, setVerificationData] = useState({
    status: profileData?.verificationStatus || 'unverified',
    documents: profileData?.documents || {
      nationalId: null,
      proofOfAddress: null,
      musicSample: null
    },
    socialMediaFollowers: profileData?.socialMediaFollowers || '',
    performanceHistory: profileData?.performanceHistory || '',
    musicReleases: profileData?.musicReleases || ''
  });

  const [uploadingDocument, setUploadingDocument] = useState('');
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showLocation: true,
    showSocialLinks: true,
    allowMessages: true,
    showPlayCounts: true
  });

  const verificationRequirements = [
    {
      id: 'profile_complete',
      title: currentLanguage === 'en' ? 'Complete Profile' : 'Kamilisha Wasifu',
      description: currentLanguage === 'en' ?'Fill out all required profile information' :'Jaza taarifa zote za wasifu zinazohitajika',
      completed: true,
      icon: 'User'
    },
    {
      id: 'music_uploaded',
      title: currentLanguage === 'en' ? 'Upload Music' : 'Pakia Muziki',
      description: currentLanguage === 'en' ?'Upload at least 3 original music tracks' :'Pakia angalau nyimbo 3 za asili',
      completed: true,
      icon: 'Music'
    },
    {
      id: 'identity_verified',
      title: currentLanguage === 'en' ? 'Identity Verification' : 'Uthibitisho wa Utambulisho',
      description: currentLanguage === 'en' ?'Upload valid government-issued ID' :'Pakia kitambulisho halali cha serikali',
      completed: !!verificationData?.documents?.nationalId,
      icon: 'Shield'
    },
    {
      id: 'social_presence',
      title: currentLanguage === 'en' ? 'Social Media Presence' : 'Uwepo wa Mitandao ya Kijamii',
      description: currentLanguage === 'en' ?'Link active social media accounts' :'Unganisha akaunti za mitandao ya kijamii zilizo hai',
      completed: false,
      icon: 'Share2'
    }
  ];

  const documentTypes = [
    {
      key: 'nationalId',
      title: currentLanguage === 'en' ? 'National ID' : 'Kitambulisho cha Kitaifa',
      description: currentLanguage === 'en' ?'Upload a clear photo of your Kenyan National ID' :'Pakia picha wazi ya Kitambulisho chako cha Kitaifa cha Kenya',
      required: true
    },
    {
      key: 'proofOfAddress',
      title: currentLanguage === 'en' ? 'Proof of Address' : 'Uthibitisho wa Anwani',
      description: currentLanguage === 'en' ?'Utility bill or bank statement (not older than 3 months)' :'Bili ya umeme au taarifa ya benki (si zaidi ya miezi 3)',
      required: false
    },
    {
      key: 'musicSample',
      title: currentLanguage === 'en' ? 'Music Sample' : 'Sampuli ya Muziki',
      description: currentLanguage === 'en' ?'Upload a high-quality sample of your original music' :'Pakia sampuli ya ubora wa juu ya muziki wako wa asili',
      required: true
    }
  ];

  const visibilityOptions = [
    { value: 'public', label: currentLanguage === 'en' ? 'Public' : 'Umma' },
    { value: 'private', label: currentLanguage === 'en' ? 'Private' : 'Binafsi' },
    { value: 'verified_only', label: currentLanguage === 'en' ? 'Verified Artists Only' : 'Wasanii Waliothibitishwa Tu' }
  ];

  const handleDocumentUpload = (documentType) => {
    setUploadingDocument(documentType);
    // Simulate file upload
    setTimeout(() => {
      setVerificationData(prev => ({
        ...prev,
        documents: {
          ...prev?.documents,
          [documentType]: {
            filename: `${documentType}_document.pdf`,
            uploadDate: new Date()?.toISOString(),
            status: 'pending'
          }
        }
      }));
      setUploadingDocument('');
    }, 2000);
  };

  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const getVerificationStatusBadge = () => {
    const statusConfig = {
      unverified: {
        color: 'text-muted-foreground bg-muted',
        icon: 'Clock',
        text: currentLanguage === 'en' ? 'Unverified' : 'Haijathibitishwa'
      },
      pending: {
        color: 'text-warning bg-warning/10',
        icon: 'Clock',
        text: currentLanguage === 'en' ? 'Pending Review' : 'Inasubiri Ukaguzi'
      },
      verified: {
        color: 'text-success bg-success/10',
        icon: 'CheckCircle',
        text: currentLanguage === 'en' ? 'Verified Artist' : 'Msanii Aliyethibitishwa'
      },
      rejected: {
        color: 'text-error bg-error/10',
        icon: 'XCircle',
        text: currentLanguage === 'en' ? 'Verification Failed' : 'Uthibitisho Umeshindwa'
      }
    };

    const config = statusConfig?.[verificationData?.status] || statusConfig?.unverified;

    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${config?.color}`}>
        <Icon name={config?.icon} size={16} />
        <span>{config?.text}</span>
      </div>
    );
  };

  const completedRequirements = verificationRequirements?.filter(req => req?.completed)?.length;
  const progressPercentage = (completedRequirements / verificationRequirements?.length) * 100;

  return (
    <div className="space-y-6">
      {/* Verification Status */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-2">
              {currentLanguage === 'en' ? 'Verification Status' : 'Hali ya Uthibitisho'}
            </h3>
            {getVerificationStatusBadge()}
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">
                {currentLanguage === 'en' ? 'Progress' : 'Maendeleo'}
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {completedRequirements}/{verificationRequirements?.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {verificationData?.status === 'verified' && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="CheckCircle" size={20} className="text-success mt-0.5" />
              <div>
                <h4 className="font-medium text-success mb-1">
                  {currentLanguage === 'en' ? 'Congratulations!' : 'Hongera!'}
                </h4>
                <p className="text-sm text-success/80">
                  {currentLanguage === 'en' ?'Your artist profile has been verified. You now have access to premium features and higher visibility.' :'Wasifu wako wa msanii umethibitishwa. Sasa una ufikiaji wa vipengele vya premium na mwonekano wa juu.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Verification Requirements */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4">
          {currentLanguage === 'en' ? 'Verification Requirements' : 'Mahitaji ya Uthibitisho'}
        </h3>
        <div className="space-y-4">
          {verificationRequirements?.map((requirement) => (
            <div key={requirement?.id} className="flex items-start space-x-4 p-4 rounded-lg border border-border">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                requirement?.completed ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon name={requirement?.completed ? 'Check' : requirement?.icon} size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-1">{requirement?.title}</h4>
                <p className="text-sm text-muted-foreground">{requirement?.description}</p>
              </div>
              {requirement?.completed && (
                <Icon name="CheckCircle" size={20} className="text-success" />
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Document Upload */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4">
          {currentLanguage === 'en' ? 'Document Upload' : 'Upakiaji wa Hati'}
        </h3>
        <div className="space-y-6">
          {documentTypes?.map((docType) => (
            <div key={docType?.key} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-foreground flex items-center space-x-2">
                    <span>{docType?.title}</span>
                    {docType?.required && (
                      <span className="text-error text-sm">*</span>
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">{docType?.description}</p>
                </div>
                {verificationData?.documents?.[docType?.key] && (
                  <div className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span className="text-sm text-success">
                      {currentLanguage === 'en' ? 'Uploaded' : 'Imepakiwa'}
                    </span>
                  </div>
                )}
              </div>

              {verificationData?.documents?.[docType?.key] ? (
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon name="FileText" size={20} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {verificationData?.documents?.[docType?.key]?.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentLanguage === 'en' ? 'Uploaded on' : 'Imepakiwa'} {' '}
                          {new Date(verificationData.documents[docType.key].uploadDate)?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDocumentUpload(docType?.key)}
                    >
                      {currentLanguage === 'en' ? 'Replace' : 'Badilisha'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleDocumentUpload(docType?.key)}
                  loading={uploadingDocument === docType?.key}
                  iconName="Upload"
                  iconPosition="left"
                  fullWidth
                >
                  {uploadingDocument === docType?.key 
                    ? (currentLanguage === 'en' ? 'Uploading...' : 'Inapakia...')
                    : (currentLanguage === 'en' ? 'Upload Document' : 'Pakia Hati')
                  }
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Additional Information */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4">
          {currentLanguage === 'en' ? 'Additional Information' : 'Taarifa za Ziada'}
        </h3>
        <div className="space-y-4">
          <Input
            label={currentLanguage === 'en' ? 'Social Media Followers' : 'Wafuasi wa Mitandao ya Kijamii'}
            type="number"
            placeholder={currentLanguage === 'en' ? 'Total followers across all platforms' : 'Jumla ya wafuasi katika majukwaa yote'}
            value={verificationData?.socialMediaFollowers}
            onChange={(e) => setVerificationData(prev => ({
              ...prev,
              socialMediaFollowers: e?.target?.value
            }))}
            description={currentLanguage === 'en' ?'This helps us understand your reach and influence' :'Hii inatusaidia kuelewa mfikio na ushawishi wako'
            }
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {currentLanguage === 'en' ? 'Performance History' : 'Historia ya Maonyesho'}
            </label>
            <textarea
              className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              placeholder={currentLanguage === 'en' ?'List notable performances, venues, or events you have participated in...' :'Orodhesha maonyesho, maeneo, au matukio muhimu uliyoshiriki...'
              }
              value={verificationData?.performanceHistory}
              onChange={(e) => setVerificationData(prev => ({
                ...prev,
                performanceHistory: e?.target?.value
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {currentLanguage === 'en' ? 'Previous Music Releases' : 'Matoleo ya Muziki ya Awali'}
            </label>
            <textarea
              className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              placeholder={currentLanguage === 'en' ?'List your previous releases, albums, or collaborations...' :'Orodhesha matoleo yako ya awali, albamu, au ushirikiano...'
              }
              value={verificationData?.musicReleases}
              onChange={(e) => setVerificationData(prev => ({
                ...prev,
                musicReleases: e?.target?.value
              }))}
            />
          </div>
        </div>
      </div>
      {/* Privacy Controls */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-foreground">
            {currentLanguage === 'en' ? 'Privacy Controls' : 'Udhibiti wa Faragha'}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrivacySettings(!showPrivacySettings)}
            iconName={showPrivacySettings ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
          >
            {currentLanguage === 'en' ? 'Privacy Settings' : 'Mipangilio ya Faragha'}
          </Button>
        </div>

        {showPrivacySettings && (
          <div className="space-y-4 pt-4 border-t border-border">
            <Select
              label={currentLanguage === 'en' ? 'Profile Visibility' : 'Mwonekano wa Wasifu'}
              options={visibilityOptions}
              value={privacySettings?.profileVisibility}
              onChange={(value) => handlePrivacyChange('profileVisibility', value)}
              description={currentLanguage === 'en' ?'Control who can see your profile' :'Dhibiti ni nani anayeweza kuona wasifu wako'
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-foreground">
                    {currentLanguage === 'en' ? 'Show Location' : 'Onyesha Mahali'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentLanguage === 'en' ? 'Display your county' : 'Onyesha kaunti yako'}
                  </p>
                </div>
                <button
                  onClick={() => handlePrivacyChange('showLocation', !privacySettings?.showLocation)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings?.showLocation ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings?.showLocation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-foreground">
                    {currentLanguage === 'en' ? 'Show Social Links' : 'Onyesha Viungo vya Kijamii'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentLanguage === 'en' ? 'Display social media' : 'Onyesha mitandao ya kijamii'}
                  </p>
                </div>
                <button
                  onClick={() => handlePrivacyChange('showSocialLinks', !privacySettings?.showSocialLinks)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings?.showSocialLinks ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings?.showSocialLinks ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Submit for Review */}
      {verificationData?.status === 'unverified' && completedRequirements >= 3 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Icon name="Star" size={20} className="text-primary mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-primary mb-2">
                {currentLanguage === 'en' ? 'Ready for Verification!' : 'Tayari kwa Uthibitisho!'}
              </h4>
              <p className="text-sm text-primary/80 mb-4">
                {currentLanguage === 'en' ?'You have completed most requirements. Submit your profile for verification review.' :'Umekamilisha mahitaji mengi. Wasilisha wasifu wako kwa ukaguzi wa uthibitisho.'
                }
              </p>
              <Button
                variant="default"
                onClick={() => {
                  setVerificationData(prev => ({ ...prev, status: 'pending' }));
                  onUpdateProfile('verification', { ...verificationData, status: 'pending' });
                }}
                iconName="Send"
                iconPosition="left"
              >
                {currentLanguage === 'en' ? 'Submit for Review' : 'Wasilisha kwa Ukaguzi'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationTab;