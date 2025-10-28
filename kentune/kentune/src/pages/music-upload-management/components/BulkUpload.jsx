import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const BulkUpload = ({ onClose, onBulkUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [bulkMetadata, setBulkMetadata] = useState({
    album: '',
    genre: '',
    releaseDate: '',
    copyrightInfo: '',
    distributionPlatforms: [],
    isExplicit: false
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const kenyanGenres = [
    { value: 'afrobeat', label: 'Afrobeat' },
    { value: 'benga', label: 'Benga' },
    { value: 'gospel', label: 'Gospel' },
    { value: 'hip-hop', label: 'Hip Hop' },
    { value: 'pop', label: 'Pop' },
    { value: 'reggae', label: 'Reggae' },
    { value: 'rnb', label: 'R&B' },
    { value: 'traditional', label: 'Traditional' }
  ];

  const distributionPlatforms = [
    { value: 'spotify', label: 'Spotify' },
    { value: 'apple-music', label: 'Apple Music' },
    { value: 'youtube-music', label: 'YouTube Music' },
    { value: 'boomplay', label: 'Boomplay' },
    { value: 'audiomack', label: 'Audiomack' }
  ];

  const handleFileSelection = (e) => {
    const files = Array.from(e?.target?.files);
    const audioFiles = files?.filter(file => {
      const extension = file?.name?.split('.')?.pop()?.toLowerCase();
      return ['mp3', 'wav', 'flac', 'aac', 'm4a']?.includes(extension);
    });

    const filesWithMetadata = audioFiles?.map((file, index) => ({
      id: Date.now() + index,
      file,
      title: file?.name?.replace(/\.[^/.]+$/, ""), // Remove extension
      customMetadata: {
        featuredArtists: '',
        trackNumber: index + 1
      }
    }));

    setSelectedFiles(filesWithMetadata);
  };

  const updateFileMetadata = (fileId, field, value) => {
    setSelectedFiles(prev => prev?.map(file => 
      file?.id === fileId 
        ? { ...file, customMetadata: { ...file?.customMetadata, [field]: value } }
        : file
    ));
  };

  const updateFileTitle = (fileId, title) => {
    setSelectedFiles(prev => prev?.map(file => 
      file?.id === fileId ? { ...file, title } : file
    ));
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev?.filter(file => file?.id !== fileId));
  };

  const handleBulkMetadataChange = (field, value) => {
    setBulkMetadata(prev => ({ ...prev, [field]: value }));
  };

  const handlePlatformChange = (platform, checked) => {
    setBulkMetadata(prev => ({
      ...prev,
      distributionPlatforms: checked
        ? [...prev?.distributionPlatforms, platform]
        : prev?.distributionPlatforms?.filter(p => p !== platform)
    }));
  };

  const handleBulkUpload = async () => {
    if (selectedFiles?.length === 0) return;

    setIsUploading(true);
    
    // Simulate upload progress for each file
    for (let i = 0; i < selectedFiles?.length; i++) {
      const file = selectedFiles?.[i];
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(prev => ({
          ...prev,
          [file?.id]: progress
        }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Simulate completion
    setTimeout(() => {
      setIsUploading(false);
      onBulkUpload({
        files: selectedFiles,
        bulkMetadata
      });
    }, 1000);
  };

  const totalFiles = selectedFiles?.length;
  const completedFiles = Object.values(uploadProgress)?.filter(p => p === 100)?.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1200 p-4">
      <div className="bg-background rounded-lg border border-border max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-heading font-bold text-xl text-foreground">Bulk Upload</h2>
            <p className="text-muted-foreground">Upload multiple tracks with shared metadata</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* File Selection */}
            {selectedFiles?.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept=".mp3,.wav,.flac,.aac,.m4a"
                  onChange={handleFileSelection}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Icon name="Upload" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="font-heading font-semibold text-foreground mb-2">Select Audio Files</h3>
                <p className="text-muted-foreground">
                  Choose multiple audio files to upload at once
                </p>
              </div>
            ) : (
              <>
                {/* Bulk Metadata */}
                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-lg text-foreground">Shared Metadata</h3>
                  <p className="text-sm text-muted-foreground">
                    This information will be applied to all selected tracks
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Album Name"
                      type="text"
                      placeholder="Enter album name"
                      value={bulkMetadata?.album}
                      onChange={(e) => handleBulkMetadataChange('album', e?.target?.value)}
                    />
                    
                    <Select
                      label="Genre"
                      placeholder="Select genre"
                      options={kenyanGenres}
                      value={bulkMetadata?.genre}
                      onChange={(value) => handleBulkMetadataChange('genre', value)}
                      searchable
                    />
                    
                    <Input
                      label="Release Date"
                      type="date"
                      value={bulkMetadata?.releaseDate}
                      onChange={(e) => handleBulkMetadataChange('releaseDate', e?.target?.value)}
                    />
                    
                    <Input
                      label="Copyright Info"
                      type="text"
                      placeholder="© 2024 Artist Name"
                      value={bulkMetadata?.copyrightInfo}
                      onChange={(e) => handleBulkMetadataChange('copyrightInfo', e?.target?.value)}
                    />
                  </div>

                  <Checkbox
                    label="Explicit Content"
                    description="All tracks contain explicit content"
                    checked={bulkMetadata?.isExplicit}
                    onChange={(e) => handleBulkMetadataChange('isExplicit', e?.target?.checked)}
                  />

                  {/* Distribution Platforms */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">
                      Distribution Platforms
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {distributionPlatforms?.map((platform) => (
                        <Checkbox
                          key={platform?.value}
                          label={platform?.label}
                          checked={bulkMetadata?.distributionPlatforms?.includes(platform?.value)}
                          onChange={(e) => handlePlatformChange(platform?.value, e?.target?.checked)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Individual Files */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-semibold text-lg text-foreground">
                      Individual Tracks ({selectedFiles?.length})
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.querySelector('input[type="file"]')?.click()}
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Add More
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedFiles?.map((fileItem, index) => (
                      <div key={fileItem?.id} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon name="Music" size={20} className="text-primary" />
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input
                                label="Track Title"
                                type="text"
                                value={fileItem?.title}
                                onChange={(e) => updateFileTitle(fileItem?.id, e?.target?.value)}
                              />
                              
                              <Input
                                label="Featured Artists"
                                type="text"
                                placeholder="Featured artists (optional)"
                                value={fileItem?.customMetadata?.featuredArtists}
                                onChange={(e) => updateFileMetadata(fileItem?.id, 'featuredArtists', e?.target?.value)}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>Track #{fileItem?.customMetadata?.trackNumber}</span>
                              <span>{(fileItem?.file?.size / (1024 * 1024))?.toFixed(2)} MB</span>
                            </div>

                            {/* Upload Progress */}
                            {isUploading && uploadProgress?.[fileItem?.id] !== undefined && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span>Uploading...</span>
                                  <span>{uploadProgress?.[fileItem?.id]}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1">
                                  <div 
                                    className="bg-primary h-1 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress?.[fileItem?.id]}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(fileItem?.id)}
                            disabled={isUploading}
                            className="text-muted-foreground hover:text-error flex-shrink-0"
                          >
                            <Icon name="X" size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload Progress Summary */}
                {isUploading && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">Upload Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {completedFiles} of {totalFiles} completed
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(completedFiles / totalFiles) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        {selectedFiles?.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
            <div className="text-sm text-muted-foreground">
              {selectedFiles?.length} files selected
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button 
                variant="default" 
                onClick={handleBulkUpload}
                disabled={selectedFiles?.length === 0 || isUploading}
                loading={isUploading}
              >
                <Icon name="Upload" size={16} className="mr-2" />
                {isUploading ? 'Uploading...' : `Upload ${selectedFiles?.length} Tracks`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;