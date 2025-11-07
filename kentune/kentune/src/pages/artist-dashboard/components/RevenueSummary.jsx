import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';

// Helper to check if user is new (<3 months)
function isNewUser(userProfile) {
  if (!userProfile?.createdAt) return false;
  const created = new Date(userProfile.createdAt);
  const now = new Date();
  const diffMonths = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
  return diffMonths < 3;
}

const defaultProfile = {
  thisMonth: 0,
  totalEarnings: 0,
  revenueChange: '+0%',
  pendingAmount: 0,
  nextPaymentDate: '',
  monthlyTrends: [],
  paymentMethods: [],
};

const RevenueSummary = () => {
  const { userProfile } = useAuth();
  const profile = { ...defaultProfile, ...userProfile };
  const chartData = profile.monthlyTrends;
  const maxAmount = chartData.length > 0 ? Math.max(...chartData.map(d => d?.amount || 0)) : 1;

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-semibold text-foreground">Revenue Summary</h3>
        <Button variant="ghost" size="sm" iconName="ExternalLink">
          View Details
        </Button>
      </div>
      {/* Pending Payment Alert */}
      {profile.pendingAmount && profile.nextPaymentDate && !isNewUser(profile) && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <Icon name="Clock" size={16} color="white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground text-sm">Pending M-Pesa Payment</h4>
              <p className="text-sm text-muted-foreground">KSh {profile.pendingAmount?.toLocaleString()} will be sent on {profile.nextPaymentDate}</p>
            </div>
          </div>
        </div>
      )}
      {/* Revenue Stats or Waiting Message */}
      {isNewUser(profile) ? (
        <div className="text-center p-6">
          <Icon name="Clock" size={32} className="mx-auto text-warning mb-2" />
          <p className="font-heading font-semibold text-lg text-foreground mb-2">Earnings Not Yet Available</p>
          <p className="text-muted-foreground">Your earnings and analytics will be available after 3 months of activity. Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-heading font-bold text-foreground">
              KSh {profile.thisMonth?.toLocaleString?.() || '0'}
            </p>
            <p className="text-sm text-muted-foreground">This Month</p>
            <div className="flex items-center justify-center space-x-1 mt-1">
              <Icon name="TrendingUp" size={12} className="text-success" />
              <span className="text-xs text-success">{profile.revenueChange || '+0%'}</span>
            </div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-heading font-bold text-foreground">
              KSh {profile.totalEarnings?.toLocaleString?.() || '0'}
            </p>
            <p className="text-sm text-muted-foreground">Total Earned</p>
            <div className="flex items-center justify-center space-x-1 mt-1">
              <Icon name="Calendar" size={12} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">All Time</span>
            </div>
          </div>
        </div>
      )}
      {/* Simple Chart */}
      {!isNewUser(profile) && (
        <div className="mb-6">
          <h4 className="font-medium text-foreground text-sm mb-3">Monthly Trends</h4>
          <div className="flex items-end justify-between space-x-2 h-24">
            {chartData?.length === 0 ? (
              <div className="text-muted-foreground">No data</div>
            ) : chartData?.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-primary rounded-t-sm transition-all duration-500 animate-spring"
                  style={{ 
                    height: `${(data?.amount / maxAmount) * 80}px`,
                    minHeight: '4px'
                  }}
                ></div>
                <span className="text-xs text-muted-foreground mt-2">{data?.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Payment Methods */}
      {!isNewUser(profile) && (
        <div className="pt-4 border-t border-border">
          <h4 className="font-medium text-foreground text-sm mb-3">Payment Methods</h4>
          <div className="space-y-2">
            {profile.paymentMethods?.length > 0 ? profile.paymentMethods.map((method, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-success rounded-lg flex items-center justify-center">
                    <Icon name="Smartphone" size={16} color="white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{method.type || 'M-Pesa'}</p>
                    <p className="text-xs text-muted-foreground">{method.number || method.details || ''}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 ${method.active ? 'bg-success' : 'bg-warning'} rounded-full`}></div>
                  <span className={`text-xs ${method.active ? 'text-success' : 'text-warning'}`}>{method.active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            )) : (
              <div className="text-muted-foreground">No payment methods</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueSummary;