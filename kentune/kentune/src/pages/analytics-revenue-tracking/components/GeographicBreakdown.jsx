import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GeographicBreakdown = ({ data }) => {
  const formatTooltipValue = (value, name) => {
    if (name === 'streams') {
      return [`${value?.toLocaleString()} streams`, 'Total Streams'];
    }
    if (name === 'percentage') {
      return [`${value}%`, 'Share'];
    }
    return [value, name];
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 lg:p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Geographic Performance</h3>
        <div className="text-sm text-muted-foreground">
          Top locations by streams
        </div>
      </div>
      <div className="h-64 lg:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="location" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip 
              formatter={formatTooltipValue}
              labelStyle={{ color: 'var(--color-foreground)' }}
              contentStyle={{ 
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="streams" 
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Top Locations List */}
      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-medium text-foreground">Top Performing Locations</h4>
        <div className="space-y-2">
          {data?.slice(0, 5)?.map((location, index) => (
            <div key={location?.location} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">{index + 1}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{location?.location}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{location?.streams?.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{location?.percentage}% of total</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeographicBreakdown;