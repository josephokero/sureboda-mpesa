import React from 'react';
import Icon from '../../../components/AppIcon';

const RevenueBreakdown = ({ revenueData, paymentData }) => {
  const totalRevenue = revenueData?.reduce((sum, item) => sum + item?.amount, 0);

  return (
    <div className="bg-card rounded-lg border border-border p-4 lg:p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Revenue Breakdown</h3>
        <div className="text-sm text-muted-foreground">
          Current month
        </div>
      </div>
      {/* Total Revenue */}
      <div className="bg-primary/5 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-foreground">KSh {totalRevenue?.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="DollarSign" size={24} className="text-primary" />
          </div>
        </div>
      </div>
      {/* Revenue Sources */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-medium text-foreground">Revenue Sources</h4>
        {revenueData?.map((source) => (
          <div key={source?.source} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Icon name={source?.icon} size={16} className="text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{source?.source}</p>
                <p className="text-xs text-muted-foreground">{source?.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">KSh {source?.amount?.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {((source?.amount / totalRevenue) * 100)?.toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Payment Status */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Payment Status</h4>
        {paymentData?.map((payment) => (
          <div key={payment?.id} className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  payment?.status === 'completed' ? 'bg-success' :
                  payment?.status === 'pending'? 'bg-warning' : 'bg-error'
                }`}></div>
                <span className="text-sm font-medium text-foreground">{payment?.method}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                payment?.status === 'completed' ? 'bg-success/10 text-success' :
                payment?.status === 'pending'? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
              }`}>
                {payment?.status?.charAt(0)?.toUpperCase() + payment?.status?.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">KSh {payment?.amount?.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{payment?.date}</p>
              </div>
              {payment?.status === 'pending' && (
                <div className="text-xs text-muted-foreground">
                  Expected: {payment?.expectedDate}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Tax Information */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="bg-accent/5 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={16} className="text-accent mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Tax Information</p>
              <p className="text-xs text-muted-foreground mt-1">
                All payments are subject to Kenyan tax regulations. Withholding tax of 5% applies to royalty payments. 
                Consult with a tax advisor for detailed information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueBreakdown;