
import React, { useEffect, useState, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { db } from '../../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../contexts/AuthContext';

// Utility to format Firestore timestamps to "x minutes ago"
function timeAgo(date) {
  if (!date) return '';
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

// Call this function from anywhere to log an activity
export async function logArtistActivity(userId, activity) {
  if (!userId) return;
  await addDoc(collection(db, 'activity_logs'), {
    userId,
    ...activity,
    createdAt: serverTimestamp(),
  });
}

const RecentActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    // Fetch recent uploads as activity
    const q = query(
      collection(db, 'music_releases'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setActivities(
        snapshot.docs.map(doc => ({
          id: doc.id,
          type: 'upload',
          title: doc.data().title,
          status: 'info',
          createdAt: doc.data().createdAt,
          timestamp: timeAgo(doc.data().createdAt?.toDate?.() || new Date()),
          message: `Uploaded new track: ${doc.data().title}`
        }))
      );
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  const getStatusBadge = (status) => {
    const badges = {
      processing: { color: 'bg-warning/10 text-warning', text: 'Processing' },
      success: { color: 'bg-success/10 text-success', text: 'Complete' },
      info: { color: 'bg-primary/10 text-primary', text: 'New' },
      updated: { color: 'bg-info/10 text-info', text: 'Updated' },
      login: { color: 'bg-accent/10 text-accent', text: 'Login' },
      photo: { color: 'bg-secondary/10 text-secondary', text: 'Photo' },
    };
    return badges?.[status] || badges?.info;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-semibold text-foreground">Recent Activity</h3>
        <Button variant="ghost" size="sm" iconName="MoreHorizontal">
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="text-muted-foreground">Loading activity...</div>
        ) : activities.length === 0 ? (
          <div className="text-muted-foreground">No recent activity yet.</div>
        ) : activities?.map((activity) => {
          const badge = getStatusBadge(activity?.status);
          return (
            <div key={activity?.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors animate-spring">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity?.color || 'bg-primary'} flex-shrink-0`}>
                <Icon name={activity?.icon || 'Activity'} size={16} color="white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-foreground text-sm">{activity?.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge?.color}`}>
                    {badge?.text}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{activity?.description}</p>
                <p className="text-xs text-muted-foreground">{activity?.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-center">
          <Button variant="outline" size="sm" iconName="RefreshCw" iconPosition="left" onClick={() => window.location.reload()}>
            Refresh Activity
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;