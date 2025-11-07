import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import CollaboratorsManager from './CollaboratorsManager';
import StreamingLinksManager from './StreamingLinksManager';
import TrackListManager from './TrackListManager';

import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../../contexts/AuthContext';
const MetadataForm = ({ onSubmit, isSubmitting = false, initialReleaseType = 'single' }) => {
  const [releaseType, setReleaseType] = useState(initialReleaseType); // 'single', 'ep', 'album'
  const [planType, setPlanType] = useState('');
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    let unsub = null;
    const subRef = doc(db, 'subscriptions', user.uid);
    unsub = onSnapshot(subRef, (docSnap) => {
      if (docSnap.exists()) {
        setPlanType(docSnap.data().planType || '');
      } else {
        setPlanType('');
      }
    });
    return () => { if (unsub) unsub(); };
  }, [user]);
  const [formData, setFormData] = useState({
    releaseType: initialReleaseType,
    title: '',
    album: '',
    genre: '',
    releaseDate: '',
    language: 'en',
    isrcCode: '', // Optional
    mainArtists: [],
    featuredArtists: [],
    streamingLinks: {
      spotify: '',
      appleMusic: '',
      youtube: '',
      autoGenerate: true
    },
    coverArt: null,
  isExplicit: false,
  copyrightInfo: '',
  distributionPlatforms: [],
  tracks: [], // For EP and Album
  trackFile: null // For single
  });

  const [coverArtPreview, setCoverArtPreview] = useState(null);
  const [coverArtError, setCoverArtError] = useState('');
  const [trackFileName, setTrackFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0); // percent (0-100)

  const releaseTypes = [
    { value: 'single', label: 'Single', icon: 'Music', description: 'One track release' },
    { value: 'ep', label: 'EP', icon: 'Disc3', description: '3-6 tracks release' },
    { value: 'album', label: 'Album', icon: 'Album', description: '7+ tracks release' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'zh', label: 'Chinese (Mandarin)' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ar', label: 'Arabic' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'ja', label: 'Japanese' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'ko', label: 'Korean' },
    { value: 'tr', label: 'Turkish' },
    { value: 'sw', label: 'Swahili' },
    { value: 'ki', label: 'Kikuyu' },
    { value: 'luo', label: 'Luo' },
    { value: 'kam', label: 'Kamba' },
    { value: 'luy', label: 'Luyha' },
    { value: 'mer', label: 'Meru' },
    { value: 'yo', label: 'Yoruba' },
    { value: 'ig', label: 'Igbo' },
    { value: 'zu', label: 'Zulu' },
    { value: 'ha', label: 'Hausa' },
    { value: 'fa', label: 'Persian' },
    { value: 'th', label: 'Thai' },
    { value: 'pl', label: 'Polish' },
    { value: 'nl', label: 'Dutch' },
    { value: 'el', label: 'Greek' },
    { value: 'he', label: 'Hebrew' },
    { value: 'vi', label: 'Vietnamese' },
    { value: 'ta', label: 'Tamil' },
    { value: 'bn', label: 'Bengali' },
    { value: 'other', label: 'Other' }
  ];

  // Save all form data to Firestore, uploading coverArt to Storage first if present
  const handleSaveToFirebase = async () => {
    // For album/EP, aggregate main artists from tracks before validation
    let mainArtistsToValidate = formData.mainArtists;
    if (formData.releaseType === 'album' || formData.releaseType === 'ep') {
      // Collect all unique main artists from tracks
      const allTrackArtists = (formData.tracks || [])
        .flatMap(track => Array.isArray(track.mainArtists) ? track.mainArtists : [])
        .filter(artist => artist && artist.name && artist.name.trim() !== '');
      // Remove duplicates by name
      const uniqueArtists = [];
      const seenNames = new Set();
      for (const artist of allTrackArtists) {
        if (!seenNames.has(artist.name)) {
          uniqueArtists.push(artist);
          seenNames.add(artist.name);
        }
      }
      mainArtistsToValidate = uniqueArtists;
      // Set to formData for saving
      formData.mainArtists = uniqueArtists;
    }
    // Require at least one main artist
    if (!mainArtistsToValidate || mainArtistsToValidate.length === 0 || !mainArtistsToValidate[0] || (typeof mainArtistsToValidate[0] === 'object' && !mainArtistsToValidate[0].name)) {
      setErrorMsg('You must enter at least one Primary Artist (Main Artist). This is required for music distribution.');
      setUploading(false);
      return;
    }
    setUploading(true);
    setSuccessMsg('');
    setErrorMsg('');
    setUploadProgress(0);
    try {
      let coverArtUrl = null;
      let trackFileUrl = null;
      const storage = getStorage();
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setErrorMsg('You must be logged in to upload music. Please log in and try again.');
        setUploading(false);
        return;
      }
      const userId = user.uid;
      // File size check (limit to 100MB for uploads)
      const maxSize = 100 * 1024 * 1024;
      if (formData.coverArt && formData.coverArt.size > maxSize) throw new Error('Cover art file is too large (max 100MB)');
      if (formData.trackFile && formData.trackFile.size > maxSize) throw new Error('Track file is too large (max 100MB)');

      // Helper for resumable upload with progress
      async function uploadWithProgress(storageRef, file, onProgress) {
        return new Promise((resolve, reject) => {
          const uploadTask = uploadBytesResumable(storageRef, file);
          uploadTask.on('state_changed',
            (snapshot) => {
              const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              if (onProgress) onProgress(percent);
            },
            (error) => reject(error),
            () => resolve(uploadTask.snapshot)
          );
        });
      }

      // Upload cover art
      if (formData.coverArt && formData.coverArt instanceof File) {
        const storageRef = ref(storage, `submissions/${userId}/coverArt/${formData.coverArt.name}`);
        await uploadWithProgress(storageRef, formData.coverArt, (percent) => setUploadProgress(percent * 0.5));
        coverArtUrl = await getDownloadURL(storageRef);
      }
      // Upload track file (for single)
      if (formData.trackFile && formData.trackFile instanceof File) {
        const trackRef = ref(storage, `submissions/${userId}/tracks/${formData.trackFile.name}`);
        await uploadWithProgress(trackRef, formData.trackFile, (percent) => setUploadProgress(coverArtUrl ? 50 + percent * 0.5 : percent));
        trackFileUrl = await getDownloadURL(trackRef);
      }
      // Upload each EP/album track file and set fileUrl
      let processedTracks = formData.tracks;
      if (Array.isArray(formData.tracks) && formData.tracks.length > 0) {
        processedTracks = await Promise.all(formData.tracks.map(async (track, idx) => {
          if (track.file && track.file instanceof File) {
            const trackStorageRef = ref(storage, `submissions/${userId}/tracks/${Date.now()}_${track.file.name}`);
            await uploadWithProgress(trackStorageRef, track.file);
            const fileUrl = await getDownloadURL(trackStorageRef);
            const { file, ...rest } = track;
            return { ...rest, fileUrl };
          } else {
            const { file, ...rest } = track;
            return rest;
          }
        }));
      }
      setUploadProgress(100);
      const dataToSave = {
        // Basic info
        releaseType: formData.releaseType,
        title: formData.title,
        album: formData.album,
        genre: formData.genre,
        releaseDate: formData.releaseDate,
        language: formData.language,
        isrcCode: formData.isrcCode,
        songwriter: formData.songwriter || '', // Ensure not undefined
        // Artists
        mainArtists: formData.mainArtists,
        featuredArtists: formData.featuredArtists,
        collaborators: Array.isArray(formData.collaborators) ? formData.collaborators : [],
        // Streaming
        streamingLinks: formData.streamingLinks,
        // Distribution
        distributionPlatforms: formData.distributionPlatforms,
        territory: formData.territory,
        // Tracks (for EP/Album)
  tracks: processedTracks,
        // Files
        coverArt: coverArtUrl || null,
        trackFile: trackFileUrl || null,
        artwork: coverArtUrl || null,
        // Status & system fields
        createdAt: serverTimestamp(),
        status: 'pending',
        duration: 0, // Placeholder, update if you have duration
        streams: 0,
        earnings: 0,
        userId: userId,
        // Copyright & legal
        isExplicit: formData.isExplicit,
        copyrightInfo: formData.copyrightInfo,
        copyright1: formData.copyright1,
        copyright2: formData.copyright2,
        copyright3: formData.copyright3,
        copyright4: formData.copyright4,
        copyright5: formData.copyright5,
        copyright6: formData.copyright6,
        // For MusicCatalogPreview
        artist: (formData.mainArtists && formData.mainArtists.length > 0)
          ? (typeof formData.mainArtists[0] === 'object' ? formData.mainArtists[0].name : formData.mainArtists[0])
          : '',
      };
      // Save to music_releases (for admin/review and dashboard)
      try {
        await addDoc(collection(db, 'music_releases'), dataToSave);
        setSuccessMsg('Release submitted successfully!');
        setFormData({
          releaseType: initialReleaseType,
          title: '',
          album: '',
          genre: '',
          releaseDate: '',
          language: 'en',
          isrcCode: '',
          mainArtists: [],
          featuredArtists: [],
          streamingLinks: {
            spotify: '',
            appleMusic: '',
            youtube: '',
            autoGenerate: true
          },
          coverArt: null,
          isExplicit: false,
          copyrightInfo: '',
          distributionPlatforms: [],
          tracks: [],
          trackFile: null
        });
        setCoverArtPreview(null);
        setTrackFileName('');
        if (typeof onSubmit === 'function') onSubmit();
      } catch (firestoreError) {
        setErrorMsg('Error saving to Firestore: ' + firestoreError.message);
      }
    } catch (error) {
      setErrorMsg('Error: ' + error.message);
    }
    setUploading(false);
    setTimeout(() => setUploadProgress(0), 2000);
  };

  const worldGenres = [
    { value: 'pop', label: 'Pop' },
    { value: 'rock', label: 'Rock' },
    { value: 'hiphop', label: 'Hip Hop' },
    { value: 'rnb', label: 'R&B' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'dance', label: 'Dance' },
    { value: 'house', label: 'House' },
    { value: 'reggae', label: 'Reggae' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'blues', label: 'Blues' },
    { value: 'country', label: 'Country' },
    { value: 'classical', label: 'Classical' },
    { value: 'metal', label: 'Metal' },
    { value: 'folk', label: 'Folk' },
    { value: 'afrobeat', label: 'Afrobeat' },
    { value: 'latin', label: 'Latin' },
    { value: 'kpop', label: 'K-Pop' },
    { value: 'gospel', label: 'Gospel' },
    { value: 'alternative', label: 'Alternative' },
    { value: 'indie', label: 'Indie' },
    { value: 'soul', label: 'Soul' },
    { value: 'punk', label: 'Punk' },
    { value: 'trap', label: 'Trap' },
    { value: 'drumandbass', label: 'Drum & Bass' },
    { value: 'dubstep', label: 'Dubstep' },
    { value: 'world', label: 'World' },
    { value: 'edm', label: 'EDM' },
    { value: 'soca', label: 'Soca' },
    { value: 'bhangra', label: 'Bhangra' },
    { value: 'samba', label: 'Samba' },
    { value: 'bluegrass', label: 'Bluegrass' },
    { value: 'grime', label: 'Grime' },
    { value: 'disco', label: 'Disco' },
    { value: 'techno', label: 'Techno' },
    { value: 'ska', label: 'Ska' },
    { value: 'flamenco', label: 'Flamenco' },
    { value: 'cumbia', label: 'Cumbia' },
    { value: 'tango', label: 'Tango' },
    { value: 'highlife', label: 'Highlife' },
    { value: 'jpop', label: 'J-Pop' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'celtic', label: 'Celtic' },
    { value: 'opera', label: 'Opera' },
    { value: 'ambient', label: 'Ambient' },
    { value: 'lofi', label: 'Lo-fi' },
    { value: 'newage', label: 'New Age' },
    { value: 'other', label: 'Other' }
  ];

  const distributionPlatforms = [
    { value: 'spotify', label: 'Spotify', description: 'Global streaming platform' },
    { value: 'apple-music', label: 'Apple Music', description: 'Apple\'s music service' },
    { value: 'youtube-music', label: 'YouTube Music', description: 'Google\'s music platform' },
    { value: 'boomplay', label: 'Boomplay', description: 'Popular in Africa' },
    { value: 'audiomack', label: 'Audiomack', description: 'Free music streaming' },
    { value: 'deezer', label: 'Deezer', description: 'International streaming' },
    { value: 'tidal', label: 'Tidal', description: 'High-quality audio' },
    { value: 'amazon-music', label: 'Amazon Music', description: 'Amazon\'s platform' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReleaseTypeChange = (type) => {
    setReleaseType(type);
    setFormData(prev => ({
      ...prev,
      releaseType: type,
      tracks: type === 'single' ? [] : prev?.tracks
    }));
  };

  const handleCoverArtChange = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      setCoverArtError('');
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new window.Image();
        img.onload = () => {
          if (img.width !== 3000 || img.height !== 3000) {
            setCoverArtError('Cover art must be exactly 3000 x 3000 pixels. Please convert your cover photo to the required size.');
            setFormData(prev => ({ ...prev, coverArt: null }));
            setCoverArtPreview(null);
          } else {
            setFormData(prev => ({ ...prev, coverArt: file }));
            setCoverArtPreview(ev?.target?.result);
          }
        };
        img.onerror = () => {
          setCoverArtError('Could not process image. Please upload a valid image file.');
          setFormData(prev => ({ ...prev, coverArt: null }));
          setCoverArtPreview(null);
        };
        img.src = ev?.target?.result;
      };
      reader?.readAsDataURL(file);
    }
  };

  const handlePlatformChange = (platform, checked) => {
    setFormData(prev => ({
      ...prev,
      distributionPlatforms: checked
        ? [...prev?.distributionPlatforms, platform]
        : prev?.distributionPlatforms?.filter(p => p !== platform)
    }));
  };


  const handleMainArtistsChange = (artists) => {
    setFormData(prev => ({
      ...prev,
      mainArtists: artists
    }));
  };
  const handleFeaturedArtistsChange = (artists) => {
    setFormData(prev => ({
      ...prev,
      featuredArtists: artists
    }));
  };

  const handleStreamingLinksUpdate = (links) => {
    setFormData(prev => ({
      ...prev,
      streamingLinks: links
    }));
  };

  const handleTracksUpdate = (tracks) => {
    setFormData(prev => ({
      ...prev,
      tracks
    }));
  };

  const generateISRC = () => {
    // Generate a sample ISRC code
    const country = 'KE';
    const registrant = '001';
    const year = new Date()?.getFullYear()?.toString()?.slice(-2);
    const designation = Math.floor(Math.random() * 100000)?.toString()?.padStart(5, '0');
    const isrc = `${country}${registrant}${year}${designation}`;
    handleInputChange('isrcCode', isrc);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    // Validation
    let missing = [];
    if (!formData.title) missing.push('Title (Basic Information section)');
    if (!formData.releaseDate) missing.push('Release Date (Basic Information section)');
    // Genre is now optional
    if (!formData.coverArt) missing.push('Cover Art (Cover Art section)');
    if (!formData.territory) missing.push('Territory (Territory section)');
    if (releaseType === 'single' && !formData.trackFile) missing.push('Track File (Track Upload section)');
    if (releaseType !== 'single' && (!formData.tracks || formData.tracks.length < (releaseType === 'ep' ? 3 : 7))) missing.push(`Tracks (Track List section, minimum required: ${releaseType === 'ep' ? 3 : 7})`);
    // Copyright checkboxes
    for (let i = 1; i <= 6; i++) {
      if (!formData[`copyright${i}`]) missing.push(`Copyright Confirmation ${i} (Copyright Confirmation section)`);
    }
    if (missing.length > 0) {
      setErrorMsg('Please fill in or select the following fields: ' + missing.join('; '));
      return;
    }
    await handleSaveToFirebase();
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date?.toISOString()?.split('T')?.[0];
  };

  // No loading text, always show UI. Buttons will be disabled if planType is not allowed.
  return (
  <form onSubmit={handleSubmit} className="space-y-8 w-full mx-auto p-12" style={{ background: '#fff', borderRadius: '1rem', width: '100%' }}>
      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMsg}</span>
        </div>
      )}
      {/* Release Type Selection */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">Release Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {releaseTypes?.map((type) => {
            const isStarter = planType.toLowerCase() === 'starter';
            const isDisabled = isStarter && type.value !== 'single';
            return (
              <div
                key={type?.value}
                onClick={() => !isDisabled && handleReleaseTypeChange(type?.value)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  releaseType === type?.value
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : isDisabled
                      ? 'border-border bg-muted cursor-not-allowed opacity-60'
                      : 'border-border hover:border-primary/50'
                }`}
                style={isDisabled ? { pointerEvents: 'none' } : {}}
              >
                <div className="flex items-center space-x-3">
                  <Icon 
                    name={type?.icon} 
                    size={24} 
                    className={releaseType === type?.value ? 'text-primary' : 'text-muted-foreground'} 
                  />
                  <div>
                    <h4 className="font-medium text-foreground">{type?.label}</h4>
                    <p className="text-sm text-muted-foreground">{type?.description}</p>
                    {isDisabled && <span className="text-xs text-warning mt-2 block">Upgrade to unlock {type.label} uploads</span>}
                  </div>
                </div>
                {/* HELLO text removed */}
              </div>
            );
          })}
        </div>
        {planType.toLowerCase() === 'starter' && <div className="mt-4 text-warning text-sm">Your current plan only allows Single uploads. <a href="/pricing" className="underline text-primary">Upgrade your plan</a> to unlock EP and Album uploads.</div>}
      </div>

  {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">
          {releaseType === 'single' ? 'Track' : releaseType === 'ep' ? 'EP' : 'Album'} Information
        </h3>
        

        <div className="flex flex-col gap-4">
          <Input
            label={`${releaseType === 'single' ? 'Track' : releaseType === 'ep' ? 'EP' : 'Album'} Title`}
            type="text"
            placeholder={`Enter ${releaseType} title`}
            value={formData?.title}
            onChange={(e) => handleInputChange('title', e?.target?.value)}
            required
            className="border border-black"
            style={{ borderWidth: '1px', borderColor: '#000' }}
          />
          <Input
            label="UPC (Universal Product Code)"
            type="text"
            placeholder="Enter UPC (leave blank if you don't have one)"
            description="A UPC is a unique code for your release. If you don't have one, leave this blank and we will assign one for you."
            value={formData?.upc || ''}
            onChange={e => handleInputChange('upc', e?.target?.value)}
            className="border border-black"
            style={{ borderWidth: '1px', borderColor: '#000' }}
          />
          {/* HELLO text removed */}
            {/* Move Main Artist(s) & Collaborators section here */}
            <div className="border border-primary/20 rounded-lg p-6 bg-primary/5 mb-8 space-y-2">
              <h4 className="font-heading font-semibold text-base text-foreground mb-2">Main Artist(s) & Collaborators</h4>
              <div className="text-sm text-muted-foreground">
                <b>Note:</b> The first name you enter will be the main artist for this song. Any additional names you add will be collaborators, and their names will appear beside yours. Collaborators will also see this song in their account.
              </div>
              <div className="my-2 p-3 rounded-lg bg-destructive/10 border border-destructive text-center">
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#d35400', display: 'block' }}>
                  IMPORTANT: Do NOT put 'feature', 'ft', 'x', or similar in the artist name field.<br />
                  Only enter the actual artist name. If you include 'feature', 'ft', 'x', or similar, your song will be rejected.<br />
                  <span style={{ fontWeight: 'normal', color: '#d35400' }}>
                    To add a featured artist, use the <b>Additional Credits</b> section below.
                  </span>
                </span>
              </div>
            </div>
            {releaseType === 'single' && (
              <CollaboratorsManager
                mainArtists={formData?.mainArtists}
                collaborators={formData?.collaborators}
                onMainArtistsChange={handleMainArtistsChange}
                onCollaboratorsChange={collaborators => setFormData(prev => ({ ...prev, collaborators }))}
                hideCollaborators={false}
              />
            )}
          {/* Songwriter, genre, language, ISRC, and track upload for single */}
          {releaseType === 'single' && (
            <>
              {/* Songwriter field with validation for forbidden abbreviations */}
              <Input
                label="Songwriter (required)"
                type="text"
                placeholder="Enter songwriter's full name"
                value={formData?.songwriter || ''}
                onChange={e => {
                  const value = e.target.value;
                  handleInputChange('songwriter', value);
                  const forbidden = /[.,]|\b(ft|feat|featuring|x)\b/i;
                  if (forbidden.test(value)) {
                    setSongwriterError("Songwriter name must not contain ',', '.', 'x', 'ft', 'feat', 'featuring', or similar abbreviations. Only the actual name is allowed.");
                  } else {
                    setSongwriterError('');
                  }
                }}
                required
                className="border border-black"
                style={{ borderWidth: '1px', borderColor: '#000' }}
              />
              {typeof songwriterError !== 'undefined' && songwriterError && (
                <div className="text-xs text-destructive font-semibold mb-2">{songwriterError}</div>
              )}
              <div className="mt-4">
                <label className="block text-sm font-medium text-foreground mb-2">Upload Track File <span className="text-destructive">*</span></label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    setFormData(prev => ({ ...prev, trackFile: file }));
                    setTrackFileName(file ? file.name : '');
                  }}
                  required
                  className="block w-full text-sm text-foreground border border-black rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  style={{ borderWidth: '1px', borderColor: '#000' }}
                />
                {trackFileName && <div className="text-xs text-muted-foreground mt-1">Selected: {trackFileName}</div>}
              </div>
            </>
          )}
          {/* Album name removed for single releases */}
          {releaseType !== 'single' && (
            <Input
              label="Number of Tracks"
              type="number"
              min={releaseType === 'ep' ? 3 : 7}
              max={releaseType === 'ep' ? 6 : 30}
              placeholder={`${releaseType === 'ep' ? '3-6' : '7-30'} tracks`}
              value={formData?.tracks?.length}
              readOnly
            />
          )}
        </div>



        {/* Genre, Language, ISRC only for single; Release Date always shown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {releaseType === 'single' && (
            <>
              <Select
                label="Genre"
                placeholder="Select genre"
                options={worldGenres}
                value={formData?.genre}
                onChange={(value) => handleInputChange('genre', value)}
                searchable
                required
                className="border border-black"
                style={{ borderWidth: '1px', borderColor: '#000' }}
              />
              <Select
                label="Language"
                placeholder="Select language"
                options={languages}
                value={formData?.language}
                onChange={(value) => handleInputChange('language', value)}
                required
                className="border border-black"
                style={{ borderWidth: '1px', borderColor: '#000' }}
              />
            </>
          )}
          <Input
            label="Release Date"
            type="date"
            value={formatDateForInput(formData?.releaseDate)}
            onChange={(e) => handleInputChange('releaseDate', e?.target?.value)}
            required
            className="border border-black"
            style={{ borderWidth: '1px', borderColor: '#000' }}
            min={(() => {
              const today = new Date();
              today.setDate(today.getDate() + 7);
              return today.toISOString().split('T')[0];
            })()}
          />
        </div>
        {/* ISRC Code (Optional) only for single */}
        {releaseType === 'single' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="ISRC Code (Optional)"
              type="text"
              placeholder="e.g., KE-001-24-00001"
              value={formData?.isrcCode}
              onChange={(e) => handleInputChange('isrcCode', e?.target?.value)}
              description="International Standard Recording Code for your track (optional)"
              className="border border-black"
              style={{ borderWidth: '1px', borderColor: '#000' }}
            />
          </div>
        )}
      </div>


      {/* Main Artist(s) & Collaborators section moved above */}

      {/* Streaming Platform Links */}
      <StreamingLinksManager
        links={formData?.streamingLinks}
        onChange={handleStreamingLinksUpdate}
      />

      {/* Track List for EP/Album */}
      {releaseType !== 'single' && (
        <TrackListManager
          releaseType={releaseType}
          tracks={formData?.tracks}
          onChange={handleTracksUpdate}
          parentGenre={formData?.genre}
          parentLanguage={formData?.language}
        />
      )}

      {/* Cover Art */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">Cover Art</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Upload Cover Art
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverArtChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Icon name="ImagePlus" size={32} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload cover art
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 3000x3000px, JPG/PNG
                </p>
              </div>
            </div>
          </div>
          
          {coverArtError && (
            <div className="text-xs text-destructive font-semibold mb-2">
              {coverArtError}
              <br />
              <a href="https://www.imageresizer.work/resize-image-to-3000x3000" target="_blank" rel="noopener noreferrer" className="text-primary underline">Convert your cover photo here</a>
            </div>
          )}
          {coverArtPreview && !coverArtError && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Preview
              </label>
              <div className="w-32 h-32 rounded-lg overflow-hidden border border-border">
                <Image
                  src={coverArtPreview}
                  alt="Cover art preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Options */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">Advanced Options</h3>
        <div className="space-y-4">
          <Checkbox
            label="Explicit Content"
            description="Check if this release contains explicit content"
            checked={formData?.isExplicit}
            onChange={(e) => handleInputChange('isExplicit', e?.target?.checked)}
          />
        </div>
      </div>


      {/* Territory selection at the bottom */}
      <div className="flex flex-col gap-4 mb-4 mt-6">
        <label className="font-medium text-foreground mb-1">Territory <span className="text-destructive">*</span></label>
        <select
          className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
          value={formData?.territory || ''}
          onChange={e => handleInputChange('territory', e.target.value)}
          required
        >
          <option value="">Select territory</option>
          <option value="worldwide">Worldwide</option>
          <option value="africa">Africa</option>
          <option value="europe">Europe</option>
          <option value="north-america">North America</option>
          <option value="south-america">South America</option>
          <option value="asia">Asia</option>
          <option value="oceania">Oceania</option>
          <option value="other">Other</option>
        </select>
      </div>
      {/* Copyright checkboxes at the bottom */}

      <div className="mt-6">
        <label className="font-medium text-foreground mb-2 block">Copyright Confirmation <span className="text-destructive">*</span></label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col sm:flex-row items-start gap-2 p-4 rounded-lg bg-muted/50 border border-border">
            <input type="checkbox" required checked={formData?.copyright1 || false} onChange={e => handleInputChange('copyright1', e.target.checked)} className="w-6 h-6 mb-2 sm:mb-0" />
            <span className="text-base leading-snug">I confirm I own or have the rights to distribute this music.</span>
          </label>
          <label className="flex flex-col sm:flex-row items-start gap-2 p-4 rounded-lg bg-muted/50 border border-border">
            <input type="checkbox" required checked={formData?.copyright2 || false} onChange={e => handleInputChange('copyright2', e.target.checked)} className="w-6 h-6 mb-2 sm:mb-0" />
            <span className="text-base leading-snug">I confirm this music does not infringe on any third-party copyrights.</span>
          </label>
          <label className="flex flex-col sm:flex-row items-start gap-2 p-4 rounded-lg bg-muted/50 border border-border">
            <input type="checkbox" required checked={formData?.copyright3 || false} onChange={e => handleInputChange('copyright3', e.target.checked)} className="w-6 h-6 mb-2 sm:mb-0" />
            <span className="text-base leading-snug">I confirm all samples and interpolations are cleared.</span>
          </label>
          <label className="flex flex-col sm:flex-row items-start gap-2 p-4 rounded-lg bg-muted/50 border border-border">
            <input type="checkbox" required checked={formData?.copyright4 || false} onChange={e => handleInputChange('copyright4', e.target.checked)} className="w-6 h-6 mb-2 sm:mb-0" />
            <span className="text-base leading-snug">I confirm all featured artists have given permission.</span>
          </label>
          <label className="flex flex-col sm:flex-row items-start gap-2 p-4 rounded-lg bg-muted/50 border border-border">
            <input type="checkbox" required checked={formData?.copyright5 || false} onChange={e => handleInputChange('copyright5', e.target.checked)} className="w-6 h-6 mb-2 sm:mb-0" />
            <span className="text-base leading-snug">I confirm this music is not already signed to another label or distributor.</span>
          </label>
          <label className="flex flex-col sm:flex-row items-start gap-2 p-4 rounded-lg bg-muted/50 border border-border">
            <input type="checkbox" required checked={formData?.copyright6 || false} onChange={e => handleInputChange('copyright6', e.target.checked)} className="w-6 h-6 mb-2 sm:mb-0" />
            <span className="text-base leading-snug">I confirm all information provided is accurate and true.</span>
          </label>
        </div>
      </div>

      {/* Upload Progress Bar */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
        <div className="w-full">
          {uploading && (
            <div className="mb-2 w-full">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="bg-primary h-3 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground mt-1 text-center">{Math.round(uploadProgress)}% uploaded</div>
            </div>
          )}
          <Button
            type="submit"
            variant="default"
            loading={uploading || isSubmitting}
            disabled={uploading || isSubmitting}
            className="flex-1 sm:flex-none w-full"
          >
            <Icon name="Upload" size={16} className="mr-2" />
            {(uploading || isSubmitting) ? 'Uploading...' : `Upload ${releaseType?.charAt(0)?.toUpperCase() + releaseType?.slice(1)}`}
          </Button>
        </div>
      </div>

      {/* Lyrics and Music Video Coming Soon Info */}
      <div className="mt-8 space-y-6">
        <div>
          <div className="font-semibold text-foreground mb-1">Lyrics (optional):</div>
          <div className="bg-muted/50 border border-border rounded p-3">
            <span className="font-bold text-yellow-400">Lyrics upload and editing is coming soon!</span><br />
            <span className="text-yellow-300">For now, please keep your lyrics ready. Stay tuned for updates.</span>
          </div>
        </div>
        <div>
          <div className="font-semibold text-foreground mb-1">Music Video (coming soon):</div>
          <div className="bg-muted/50 border border-border rounded p-3">
            <span className="font-bold text-yellow-400">Music video upload and management is coming soon!</span><br />
            <span className="text-yellow-300">For more information, please <a href="mailto:support@kentunez.com" className="underline">contact support</a>.</span>
          </div>
        </div>
      </div>
    </form>
  );
};

export default MetadataForm;