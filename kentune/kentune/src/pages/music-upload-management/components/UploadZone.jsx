import React, { useState, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UploadZone = ({ onFilesSelected, isUploading = false, uploadProgress = 0 }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const acceptedFormats = ['.mp3', '.wav', '.flac', '.aac', '.m4a'];
  const maxFileSize = 100 * 1024 * 1024; // 100MB

  const validateFile = (file) => {
    const fileExtension = '.' + file?.name?.split('.')?.pop()?.toLowerCase();
    
    if (!acceptedFormats?.includes(fileExtension)) {
      return { valid: false, error: `Unsupported format. Please use: ${acceptedFormats?.join(', ')}` };
    }
    
    if (file?.size > maxFileSize) {
      return { valid: false, error: 'File size must be less than 100MB' };
    }
    
    return { valid: true };
  };

  const handleFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    fileArray?.forEach(file => {
      const validation = validateFile(file);
      if (validation?.valid) {
        validFiles?.push(file);
      } else {
        errors?.push(`${file?.name}: ${validation?.error}`);
      }
    });

    if (validFiles?.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      onFilesSelected(validFiles);
    }

    if (errors?.length > 0) {
      // Show errors (in real app, you'd use a toast notification)
      console.error('File validation errors:', errors);
    }
  }, [onFilesSelected]);

  const handleDragOver = useCallback((e) => {
    e?.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e?.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e?.preventDefault();
    setIsDragOver(false);
    const files = e?.dataTransfer?.files;
    handleFiles(files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e) => {
    const files = e?.target?.files;
    if (files) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removeFile = (index) => {
    setUploadedFiles(prev => prev?.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : isUploading
            ? 'border-secondary bg-secondary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={acceptedFormats?.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <div className="space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors ${
            isDragOver ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <Icon name={isUploading ? "Loader2" : "Upload"} size={32} className={isUploading ? "animate-spin" : ""} />
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              {isUploading ? 'Uploading your music...' : 'Upload Your Music'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isDragOver 
                ? 'Drop your files here' :'Drag and drop your audio files here, or click to browse'
              }
            </p>
            
            {!isUploading && (
              <Button variant="outline" size="sm">
                <Icon name="FolderOpen" size={16} className="mr-2" />
                Choose Files
              </Button>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="max-w-xs mx-auto">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium text-foreground">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Format Info */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Icon name="FileAudio" size={14} />
              <span>Supported: {acceptedFormats?.join(', ')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="HardDrive" size={14} />
              <span>Max size: 100MB</span>
            </div>
          </div>
        </div>
      </div>
      {/* Uploaded Files List */}
      {uploadedFiles?.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-heading font-medium text-foreground">Selected Files ({uploadedFiles?.length})</h4>
          <div className="space-y-2">
            {uploadedFiles?.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="Music" size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{file?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file?.size / (1024 * 1024))?.toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-error flex-shrink-0"
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadZone;