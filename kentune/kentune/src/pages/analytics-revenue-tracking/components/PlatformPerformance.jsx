import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PlatformPerformance = ({ data }) => {
  const [sortBy, setSortBy] = useState('streams');
  const [sortOrder, setSortOrder] = useState('desc');

  const sortedData = [...data]?.sort((a, b) => {
    const aValue = a?.[sortBy];
    const bValue = b?.[sortBy];
    
    if (sortOrder === 'asc') {
      return aValue - bValue;
    }
    return bValue - aValue;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return 'ArrowUpDown';
    return sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      'Spotify': 'Music',
      'Apple Music': 'Music2',
      'YouTube Music': 'Play',
      'Boomplay': 'Radio',
      'Audiomack': 'Headphones',
      'SoundCloud': 'Volume2'
    };
    return icons?.[platform] || 'Music';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 lg:p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Platform Performance</h3>
        <div className="text-sm text-muted-foreground">
          Click headers to sort
        </div>
      </div>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {sortedData?.map((platform) => (
          <div key={platform?.platform} className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={getPlatformIcon(platform?.platform)} size={16} className="text-primary" />
                </div>
                <span className="font-medium text-foreground">{platform?.platform}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">KSh {platform?.revenue?.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{platform?.percentage}%</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Streams</p>
                <p className="font-medium text-foreground">{platform?.streams?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg. Revenue</p>
                <p className="font-medium text-foreground">KSh {platform?.avgRevenue?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2">
                <button
                  onClick={() => handleSort('platform')}
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Platform</span>
                  <Icon name={getSortIcon('platform')} size={14} />
                </button>
              </th>
              <th className="text-right py-3 px-2">
                <button
                  onClick={() => handleSort('streams')}
                  className="flex items-center justify-end space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Streams</span>
                  <Icon name={getSortIcon('streams')} size={14} />
                </button>
              </th>
              <th className="text-right py-3 px-2">
                <button
                  onClick={() => handleSort('revenue')}
                  className="flex items-center justify-end space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Revenue</span>
                  <Icon name={getSortIcon('revenue')} size={14} />
                </button>
              </th>
              <th className="text-right py-3 px-2">
                <button
                  onClick={() => handleSort('avgRevenue')}
                  className="flex items-center justify-end space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Avg/Stream</span>
                  <Icon name={getSortIcon('avgRevenue')} size={14} />
                </button>
              </th>
              <th className="text-right py-3 px-2">
                <span className="text-sm font-medium text-muted-foreground">Share</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData?.map((platform) => (
              <tr key={platform?.platform} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name={getPlatformIcon(platform?.platform)} size={16} className="text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{platform?.platform}</span>
                  </div>
                </td>
                <td className="py-4 px-2 text-right">
                  <span className="text-foreground">{platform?.streams?.toLocaleString()}</span>
                </td>
                <td className="py-4 px-2 text-right">
                  <span className="font-medium text-foreground">KSh {platform?.revenue?.toLocaleString()}</span>
                </td>
                <td className="py-4 px-2 text-right">
                  <span className="text-foreground">KSh {platform?.avgRevenue?.toFixed(2)}</span>
                </td>
                <td className="py-4 px-2 text-right">
                  <span className="text-muted-foreground">{platform?.percentage}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlatformPerformance;