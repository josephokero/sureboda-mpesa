import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StreamingTrendsChart = ({ data, timeRange }) => {
  const formatTooltipValue = (value, name) => {
    if (name === 'streams') {
      return [`${value?.toLocaleString()} streams`, 'Total Streams'];
    }
    if (name === 'revenue') {
      return [`KSh ${value?.toLocaleString()}`, 'Revenue'];
    }
    return [value, name];
  };

  const formatXAxisLabel = (tickItem) => {
    const date = new Date(tickItem);
    if (timeRange === '7days') {
      return date?.toLocaleDateString('en-GB', { weekday: 'short' });
    }
    if (timeRange === '30days') {
      return date?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    }
    return date?.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 lg:p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Streaming Trends</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-muted-foreground">Streams</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-secondary rounded-full"></div>
            <span className="text-muted-foreground">Revenue</span>
          </div>
        </div>
      </div>
      
      <div className="h-64 lg:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              yAxisId="streams"
              orientation="left"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              yAxisId="revenue"
              orientation="right"
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
            <Line 
              yAxisId="streams"
              type="monotone" 
              dataKey="streams" 
              stroke="var(--color-primary)" 
              strokeWidth={2}
              dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'var(--color-primary)', strokeWidth: 2 }}
            />
            <Line 
              yAxisId="revenue"
              type="monotone" 
              dataKey="revenue" 
              stroke="var(--color-secondary)" 
              strokeWidth={2}
              dot={{ fill: 'var(--color-secondary)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'var(--color-secondary)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StreamingTrendsChart;