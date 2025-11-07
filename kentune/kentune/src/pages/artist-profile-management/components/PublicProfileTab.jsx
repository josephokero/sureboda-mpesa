import { getAuth } from 'firebase/auth';
import React, { useState, useRef } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PublicProfileTab = ({ profileData, onUpdateProfile, currentLanguage }) => {
  const [formData, setFormData] = useState({
    stageName: profileData?.stageName || '',
    bio: profileData?.bio || '',
    profilePhoto: profileData?.profilePhoto || '',
    genres: profileData?.genres || [],
    location: profileData?.location || '',
    socialLinks: profileData?.socialLinks || {
      instagram: '',
      twitter: '',
      facebook: '',
      youtube: '',
      tiktok: ''
    }
  });

  const [bioCharCount, setBioCharCount] = useState(formData?.bio?.length || 0);
  const [showImageCrop, setShowImageCrop] = useState(false);
  const [cropImageType, setCropImageType] = useState('');
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef();

  const maxBioLength = 500;
  const kenyanCounties = [
  { value: 'baringo', label: 'Baringo' },
  { value: 'bomet', label: 'Bomet' },
  { value: 'bungoma', label: 'Bungoma' },
  { value: 'busia', label: 'Busia' },
  { value: 'elgeyo marakwet', label: 'Elgeyo Marakwet' },
  { value: 'embu', label: 'Embu' },
  { value: 'garissa', label: 'Garissa' },
  { value: 'homa bay', label: 'Homa Bay' },
  { value: 'isiolo', label: 'Isiolo' },
  { value: 'kajiado', label: 'Kajiado' },
  { value: 'kakamega', label: 'Kakamega' },
  { value: 'kericho', label: 'Kericho' },
  { value: 'kiambu', label: 'Kiambu' },
  { value: 'kilifi', label: 'Kilifi' },
  { value: 'kirinyaga', label: 'Kirinyaga' },
  { value: 'kisii', label: 'Kisii' },
  { value: 'kisumu', label: 'Kisumu' },
  { value: 'kitui', label: 'Kitui' },
  { value: 'kwale', label: 'Kwale' },
  { value: 'laikipia', label: 'Laikipia' },
  { value: 'lamu', label: 'Lamu' },
  { value: 'machakos', label: 'Machakos' },
  { value: 'makueni', label: 'Makueni' },
  { value: 'mandera', label: 'Mandera' },
  { value: 'marsabit', label: 'Marsabit' },
  { value: 'meru', label: 'Meru' },
  { value: 'migori', label: 'Migori' },
  { value: 'mombasa', label: 'Mombasa' },
  { value: 'muranga', label: 'Murang’a' },
  { value: 'nairobi', label: 'Nairobi' },
  { value: 'nakuru', label: 'Nakuru' },
  { value: 'nandi', label: 'Nandi' },
  { value: 'narok', label: 'Narok' },
  { value: 'nyamira', label: 'Nyamira' },
  { value: 'nyandarua', label: 'Nyandarua' },
  { value: 'nyeri', label: 'Nyeri' },
  { value: 'samburu', label: 'Samburu' },
  { value: 'siaya', label: 'Siaya' },
  { value: 'taita taveta', label: 'Taita Taveta' },
  { value: 'tana river', label: 'Tana River' },
  { value: 'tharaka nithi', label: 'Tharaka Nithi' },
  { value: 'trans nzoia', label: 'Trans Nzoia' },
  { value: 'turkana', label: 'Turkana' },
  { value: 'uasin gishu', label: 'Uasin Gishu' },
  { value: 'vihiga', label: 'Vihiga' },
  { value: 'wajir', label: 'Wajir' },
  { value: 'west pokot', label: 'West Pokot' }
  ];

  const musicGenres = [
    { value: 'afrobeat', label: 'Afrobeat' },
    { value: 'benga', label: 'Benga' },
    { value: 'gospel', label: 'Gospel' },
    { value: 'hip-hop', label: 'Hip Hop' },
    { value: 'pop', label: 'Pop' },
    { value: 'reggae', label: 'Reggae' },
    { value: 'rnb', label: 'R&B' },
    { value: 'traditional', label: currentLanguage === 'en' ? 'Traditional' : 'Jadi' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'bio') {
      setBioCharCount(value?.length);
    }

    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev?.socialLinks,
        [platform]: value
      }
    }));
  };

  const validateSocialLink = (platform, url) => {
    if (!url) return true;
    
    const patterns = {
      instagram: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/,
      twitter: /^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+\/?$/,
      facebook: /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+\/?$/,
      youtube: /^https?:\/\/(www\.)?youtube\.com\/(channel\/|user\/|c\/)?[a-zA-Z0-9_-]+\/?$/,
      tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.]+\/?$/
    };

    return patterns?.[platform]?.test(url) || false;
  };

  const handleImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
  const storage = getStorage(undefined, "gs://astute-pro-music-hub.firebasestorage.app");
      const user = getAuth().currentUser;
      if (!user) {
        setErrors(prev => ({ ...prev, profilePhoto: 'User not authenticated' }));
        setUploading(false);
        return;
      }
      const storageRef = ref(storage, `profile_photos/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, profilePhoto: url }));
      setShowImageCrop(false);
    } catch (err) {
      setErrors(prev => ({ ...prev, profilePhoto: 'Failed to upload image' }));
    }
    setUploading(false);
  };

  const handleSave = async () => {
    const newErrors = {};

    // Validate required fields
    if (!formData?.stageName?.trim()) {
      newErrors.stageName = currentLanguage === 'en' ? 'Stage name is required' : 'Jina la jukwaani linahitajika';
    }

    if (!formData?.bio?.trim()) {
      newErrors.bio = currentLanguage === 'en' ? 'Bio is required' : 'Maelezo yanahitajika';
    }

    if (formData?.bio?.length > maxBioLength) {
      newErrors.bio = currentLanguage === 'en' 
        ? `Bio must be ${maxBioLength} characters or less` 
        : `Maelezo yanapaswa kuwa herufi ${maxBioLength} au chini`;
    }

    // Validate social links
    Object.entries(formData?.socialLinks)?.forEach(([platform, url]) => {
      if (url && !validateSocialLink(platform, url)) {
        newErrors[`social_${platform}`] = currentLanguage === 'en' 
          ? `Invalid ${platform} URL` 
          : `URL ya ${platform} si sahihi`;
      }
    });

    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setErrors(prev => ({ ...prev, form: 'User not authenticated' }));
        setSaving(false);
        return;
      }
      // Save to Firestore
      await setDoc(doc(db, 'profiles', user.uid), formData, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      // Update parent state so changes persist after navigation
      onUpdateProfile('public', formData);
    } catch (err) {
      setErrors(prev => ({ ...prev, form: 'Failed to save profile' }));
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Save Success Popup */}
      {saveSuccess && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded shadow-lg flex items-center space-x-2">
          <Icon name="CheckCircle" size={20} className="text-white" />
          <span>{currentLanguage === 'en' ? 'Saved successfully!' : 'Imehifadhiwa kikamilifu!'}</span>
        </div>
      )}
      {/* Profile Photo Section */}
      <div className="bg-card rounded-lg border border-border p-6">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <h3 className="font-heading font-semibold text-foreground mb-4">
          {currentLanguage === 'en' ? 'Profile Photo' : 'Picha ya Wasifu'}
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border">
              {formData?.profilePhoto ? (
                <Image
                  src={formData?.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="User" size={32} className="text-muted-foreground" />
                </div>
              )}
            </div>
            <button
              onClick={handleImageUpload}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
              disabled={uploading}
            >
              {uploading ? (
                <Icon name="Loader" size={16} className="animate-spin" />
              ) : (
                <Icon name="Camera" size={16} />
              )}
            </button>
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">
              {currentLanguage === 'en' ?'Upload a professional photo that represents your brand. Recommended size: 400x400px.' :'Pakia picha ya kitaalamu inayowakilisha chapa yako. Ukubwa unaopendekezwa: 400x400px.'
              }
            </p>
            {/* Preview button removed as requested */}
          </div>
        </div>
      </div>
      {/* Banner Image Section */}

      {/* Basic Information */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4">
          {currentLanguage === 'en' ? 'Basic Information' : 'Taarifa za Msingi'}
        </h3>
        <div className="space-y-4">
          <Input
            label={currentLanguage === 'en' ? 'Stage Name' : 'Jina la Jukwaani'}
            type="text"
            placeholder={currentLanguage === 'en' ? 'Enter your stage name' : 'Ingiza jina lako la jukwaani'}
            value={formData?.stageName}
            onChange={(e) => handleInputChange('stageName', e?.target?.value)}
            error={errors?.stageName}
            required
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {currentLanguage === 'en' ? 'Bio' : 'Maelezo'}
              <span className="text-error ml-1">*</span>
            </label>
            <textarea
              className="w-full min-h-[120px] px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              placeholder={currentLanguage === 'en' ?'Tell your fans about yourself, your music journey, and what inspires you...' :'Waambie mashabiki wako kuhusu wewe, safari yako ya muziki, na kinachokuvutia...'
              }
              value={formData?.bio}
              onChange={(e) => handleInputChange('bio', e?.target?.value)}
              maxLength={maxBioLength}
            />
            <div className="flex justify-between items-center mt-2">
              {errors?.bio && (
                <p className="text-sm text-error">{errors?.bio}</p>
              )}
              <p className={`text-sm ml-auto ${
                bioCharCount > maxBioLength * 0.9 ? 'text-warning' : 'text-muted-foreground'
              }`}>
                {bioCharCount}/{maxBioLength}
              </p>
            </div>
          </div>

          <Select
            label={currentLanguage === 'en' ? 'Location (County)' : 'Mahali (Kaunti)'}
            placeholder={currentLanguage === 'en' ? 'Select your county' : 'Chagua kaunti yako'}
            options={kenyanCounties}
            value={formData?.location}
            onChange={(value) => handleInputChange('location', value)}
            searchable
          />

          <Select
            label={currentLanguage === 'en' ? 'Music Genres' : 'Aina za Muziki'}
            description={currentLanguage === 'en' ? 'Select up to 3 genres that best describe your music' : 'Chagua hadi aina 3 za muziki zinazobainisha muziki wako'}
            placeholder={currentLanguage === 'en' ? 'Select genres' : 'Chagua aina'}
            options={musicGenres}
            value={formData?.genres}
            onChange={(value) => handleInputChange('genres', value)}
            multiple
            searchable
          />
        </div>
      </div>
      {/* Save Button */}
      <div className="flex justify-end pt-4 gap-4">
        <Button
          variant="default"
          onClick={handleSave}
          iconName="Save"
          iconPosition="left"
          disabled={saving}
        >
          {saving
            ? (currentLanguage === 'en' ? 'Saving...' : 'Inahifadhi...')
            : (currentLanguage === 'en' ? 'Save Changes' : 'Hifadhi Mabadiliko')}
        </Button>
        <Button
          variant="secondary"
          iconName="Youtube"
          iconPosition="left"
          onClick={() => window.location.href = '/youtube-connect-astutepromusic'}
        >
          {currentLanguage === 'en' ? 'Connect YouTube Channel' : 'Unganisha Channel ya YouTube'}
        </Button>
        {errors?.form && (
          <div className="text-error text-sm mt-2">{errors.form}</div>
        )}
      </div>
  {/* Image Crop Modal removed: now direct upload and preview */}
    </div>
  );
};

export default PublicProfileTab;