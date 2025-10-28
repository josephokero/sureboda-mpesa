import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationCenter = ({ notifications }) => {
  const [showAll, setShowAll] = useState(false);
  const displayNotifications = showAll ? notifications : notifications?.slice(0, 3);

  const getNotificationIcon = (type) => {
    const icons = {
      upload: 'Upload',
      distribution: 'Globe',
      payment: 'DollarSign',
      analytics: 'BarChart3',
      system: 'Bell',
      promotion: 'Megaphone'
    };
    return icons?.[type] || 'Bell';
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'bg-error';
    
    const colors = {
      upload: 'bg-primary',
      distribution: 'bg-success',
      payment: 'bg-accent',
      analytics: 'bg-secondary',
      system: 'bg-muted-foreground',
      promotion: 'bg-primary'
    };
    return colors?.[type] || 'bg-muted-foreground';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h3 className="font-heading font-semibold text-foreground">Notifications</h3>
          {notifications?.filter(n => n?.unread)?.length > 0 && (
            <span className="bg-error text-error-foreground text-xs px-2 py-1 rounded-full font-medium">
              {notifications?.filter(n => n?.unread)?.length}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" iconName="Settings">
          Settings
        </Button>
      </div>
      <div className="space-y-3">
        {displayNotifications?.map((notification) => (
          <div 
            key={notification?.id} 
            className={`flex items-start space-x-3 p-3 rounded-lg transition-colors animate-spring ${
              notification?.unread ? 'bg-accent/5 border border-accent/20' : 'hover:bg-muted/50'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification?.type, notification?.priority)}`}>
              <Icon name={getNotificationIcon(notification?.type)} size={14} color="white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-sm font-medium ${notification?.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {notification?.title}
                </h4>
                {notification?.unread && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{notification?.message}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(notification?.timestamp)}
                </span>
                {notification?.actionable && (
                  <Button variant="ghost" size="xs" className="text-primary">
                    {notification?.actionText || 'View'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {notifications?.length > 3 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button 
            variant="ghost" 
            size="sm" 
            fullWidth
            onClick={() => setShowAll(!showAll)}
            iconName={showAll ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
          >
            {showAll ? 'Show Less' : `View All ${notifications?.length} Notifications`}
          </Button>
        </div>
      )}
      {notifications?.filter(n => n?.unread)?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="outline" size="sm" fullWidth iconName="CheckCheck" iconPosition="left">
            Mark All as Read
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;