import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const CollaboratorsManager = ({

  mainArtists = [],
  collaborators = [],
  onMainArtistsChange,
  onCollaboratorsChange,
  hideCollaborators = false
}) => {
  const [newMainArtist, setNewMainArtist] = useState({
    name: '',
    spotify: '',
    apple: '',
    youtube: ''
  });
  // Collaborator can be: featured artist, songwriter, producer, etc.
  const [newCollaborator, setNewCollaborator] = useState({
    name: '',
    role: '',
    songwriter: '',
    spotify: '',
    apple: '',
    youtube: ''
  });

  const collaboratorRoles = [
    'Featured Artist',
    'Producer',
    'Songwriter',
    'Composer',
    'Engineer',
    'Mixer',
    'Vocalist',
    'Instrumentalist',
    'Beat Maker',
    'Other'
  ];

  const [mainArtistError, setMainArtistError] = useState('');
  const forbiddenArtistPatterns = /[,]|\b(ft|feat|featuring|x)\b/i;
  const addMainArtist = () => {
    const name = newMainArtist?.name?.trim();
    if (name) {
      if (forbiddenArtistPatterns.test(name)) {
        setMainArtistError("Artist name must not contain ',', 'x', 'ft', 'feat', 'featuring', or similar abbreviations. Only the actual artist name is allowed.");
        return;
      }
      setMainArtistError('');
      const updatedArtists = [
        ...mainArtists,
        {
          id: Date.now(),
          name,
          spotify: newMainArtist.spotify.trim(),
          apple: newMainArtist.apple.trim(),
          youtube: newMainArtist.youtube.trim(),
        },
      ];
      onMainArtistsChange(updatedArtists);
      setNewMainArtist({ name: '', spotify: '', apple: '', youtube: '' });
    }
  };

  const removeMainArtist = (id) => {
    const updatedArtists = mainArtists?.filter(artist => artist?.id !== id);
    onMainArtistsChange(updatedArtists);
  };

  // Remove featured artist logic, handled as a collaborator with role 'Featured Artist'

  const addCollaborator = () => {
    if (newCollaborator?.name?.trim() && newCollaborator?.role?.trim()) {
      const updatedCollaborators = [
        ...collaborators,
        {
          id: Date.now(),
          name: newCollaborator.name.trim(),
          role: newCollaborator.role.trim(),
          songwriter: newCollaborator.songwriter?.trim() || '',
          spotify: newCollaborator.spotify?.trim() || '',
          apple: newCollaborator.apple?.trim() || '',
          youtube: newCollaborator.youtube?.trim() || '',
        },
      ];
      onCollaboratorsChange(updatedCollaborators);
      setNewCollaborator({ name: '', role: '', songwriter: '', spotify: '', apple: '', youtube: '' });
    }
  };

  const removeCollaborator = (id) => {
    const updatedCollaborators = collaborators?.filter(collab => collab?.id !== id);
    onCollaboratorsChange(updatedCollaborators);
  };


  return (
    <div className="space-y-6">
      <h3 className="font-heading font-semibold text-lg text-foreground">Artists & Collaborators</h3>
      {/* Main Artist (Primary) */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Main Artist (Primary)</h4>
        <div className="text-xs text-warning font-semibold mb-2">
          You must enter at least one Primary Artist (Main Artist). This is required for music distribution and cannot be left blank.<br />
          <span className="text-primary font-bold">After entering your information, <u>click Add</u> to save it. If you do not click Add, your artist information will not be added.</span>
        </div>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Artist Full Names (required)"
            value={newMainArtist.name}
            onChange={e => {
              setNewMainArtist(prev => ({ ...prev, name: e.target.value }));
              if (mainArtistError) setMainArtistError('');
            }}
            onKeyPress={e => e?.key === 'Enter' && addMainArtist()}
            required
          />
          {mainArtistError && (
            <div className="text-xs text-destructive font-semibold mb-2">{mainArtistError}</div>
          )}
          <Input
            placeholder="Spotify link (optional)"
            value={newMainArtist.spotify}
            onChange={e => setNewMainArtist(prev => ({ ...prev, spotify: e.target.value }))}
          />
          <Input
            placeholder="Apple Music link (optional)"
            value={newMainArtist.apple}
            onChange={e => setNewMainArtist(prev => ({ ...prev, apple: e.target.value }))}
          />
          <Input
            placeholder="YouTube Music link (optional)"
            value={newMainArtist.youtube}
            onChange={e => setNewMainArtist(prev => ({ ...prev, youtube: e.target.value }))}
          />
          <div className="text-xs text-muted-foreground">If you don't have these links, we will create one for you.</div>
          <Button
            type="button"
            variant="outline"
            onClick={addMainArtist}
            disabled={!newMainArtist?.name?.trim()}
          >
            <Icon name="Plus" size={16} className="mr-1" />
            Add
          </Button>
        </div>
        {mainArtists?.length > 0 && (
          <div className="space-y-2">
            {mainArtists?.map((artist) => (
              <div key={artist?.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="User" size={16} className="text-primary" />
                  <span className="text-foreground font-medium">{artist?.name}</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Main</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMainArtist(artist?.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Credits (Collaborators, including Featured Artist) */}
      {!hideCollaborators && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Additional Credits</h4>
          <div className="flex flex-row items-center gap-2">
            <select
              value={newCollaborator?.role}
              onChange={e => setNewCollaborator(prev => ({ ...prev, role: e?.target?.value }))}
              className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              style={{ minWidth: 120 }}
            >
              <option value="">Credit Type</option>
              {collaboratorRoles?.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <Input
              placeholder="Full Name"
              value={newCollaborator?.name}
              onChange={e => setNewCollaborator(prev => ({ ...prev, name: e?.target?.value }))}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addCollaborator}
              disabled={!newCollaborator?.name?.trim() || !newCollaborator?.role?.trim()}
              style={{ minWidth: 60 }}
            >
              Add
            </Button>
          </div>
          {newCollaborator?.role === 'Featured Artist' && (
            <div className="flex flex-row items-center gap-2 mt-2 w-full">
              <Input
                placeholder="Spotify link (optional)"
                value={newCollaborator.spotify}
                onChange={e => setNewCollaborator(prev => ({ ...prev, spotify: e.target.value }))}
                className="flex-1"
              />
              <Input
                placeholder="Apple Music link (optional)"
                value={newCollaborator.apple}
                onChange={e => setNewCollaborator(prev => ({ ...prev, apple: e.target.value }))}
                className="flex-1"
              />
              <Input
                placeholder="YouTube Music link (optional)"
                value={newCollaborator.youtube}
                onChange={e => setNewCollaborator(prev => ({ ...prev, youtube: e.target.value }))}
                className="flex-1"
              />
            </div>
          )}
          {collaborators?.length > 0 && (
            <div className="space-y-2 mt-2">
              {collaborators?.map((collab) => (
                <div key={collab?.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon name="UserCheck" size={16} className="text-accent" />
                    <span className="text-foreground font-medium">{collab?.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">• {collab?.role}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCollaborator(collab?.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {(mainArtists?.length > 0 || collaborators?.length > 0) && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <h5 className="font-medium text-foreground mb-2">Credits Summary:</h5>
          <div className="text-sm text-muted-foreground space-y-1">
            {mainArtists?.length > 0 && (
              <p><strong>Main Artists:</strong> {mainArtists?.map(a => a?.name)?.join(', ')}</p>
            )}
            {collaborators?.filter(c => c?.role === 'Featured Artist')?.length > 0 && (
              <p><strong>Featured:</strong> {collaborators?.filter(c => c?.role === 'Featured Artist')?.map(a => a?.name)?.join(', ')}</p>
            )}
            {collaborators?.filter(c => c?.role !== 'Featured Artist')?.length > 0 && (
              <p><strong>Other Credits:</strong> {collaborators?.filter(c => c?.role !== 'Featured Artist')?.map(c => `${c?.name} (${c?.role})`)?.join(', ')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaboratorsManager;