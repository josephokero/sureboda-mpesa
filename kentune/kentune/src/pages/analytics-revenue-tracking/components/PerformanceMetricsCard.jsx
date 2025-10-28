import React from 'react';
import Icon from '../../../components/AppIcon';

const PerformanceMetricsCard = ({ title, value, change, changeType, icon, currency = false }) => {
  const formatValue = (val) => {
    if (currency) {
      return `KSh ${val?.toLocaleString()}`;
    }
    if (val >= 1000000) {
      return `${(val / 1000000)?.toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000)?.toFixed(1)}K`;
    }
    return val?.toLocaleString();
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-error';
    return 'text-muted-foreground';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return 'TrendingUp';
    if (changeType === 'negative') return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 lg:p-6 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={icon} size={16} className="text-primary" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
        <div className={`flex items-center space-x-1 ${getChangeColor()}`}>
          <Icon name={getChangeIcon()} size={14} />
          <span className="text-xs font-medium">{Math.abs(change)}%</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl lg:text-3xl font-bold text-foreground">{formatValue(value)}</p>
        <p className="text-xs text-muted-foreground">
          {changeType === 'positive' ? 'Increase' : changeType === 'negative' ? 'Decrease' : 'No change'} from last period
        </p>
      </div>
    </div>
  );
};

export default PerformanceMetricsCard;