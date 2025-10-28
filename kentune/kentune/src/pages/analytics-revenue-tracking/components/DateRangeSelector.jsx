import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DateRangeSelector = ({ selectedRange, onRangeChange, customDateRange, onCustomDateChange }) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(customDateRange?.startDate || '');
  const [tempEndDate, setTempEndDate] = useState(customDateRange?.endDate || '');

  const predefinedRanges = [
    { value: '7days', label: '7 Days', icon: 'Calendar' },
    { value: '30days', label: '30 Days', icon: 'Calendar' },
    { value: '3months', label: '3 Months', icon: 'Calendar' },
    { value: 'custom', label: 'Custom', icon: 'CalendarRange' }
  ];

  const handleRangeSelect = (range) => {
    if (range === 'custom') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      onRangeChange(range);
    }
  };

  const handleCustomDateApply = () => {
    if (tempStartDate && tempEndDate) {
      onCustomDateChange({
        startDate: tempStartDate,
        endDate: tempEndDate
      });
      onRangeChange('custom');
      setShowCustomPicker(false);
    }
  };

  const formatDateRange = () => {
    if (selectedRange === 'custom' && customDateRange) {
      const startDate = new Date(customDateRange.startDate)?.toLocaleDateString('en-GB');
      const endDate = new Date(customDateRange.endDate)?.toLocaleDateString('en-GB');
      return `${startDate} - ${endDate}`;
    }
    
    const rangeLabels = {
      '7days': 'Last 7 Days',
      '30days': 'Last 30 Days',
      '3months': 'Last 3 Months'
    };
    
    return rangeLabels?.[selectedRange] || 'Select Range';
  };

  return (
    <div className="relative">
      {/* Mobile Dropdown */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className="w-full justify-between"
          iconName="ChevronDown"
          iconPosition="right"
        >
          <div className="flex items-center space-x-2">
            <Icon name="Calendar" size={16} />
            <span className="text-sm">{formatDateRange()}</span>
          </div>
        </Button>

        {showCustomPicker && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-modal z-50">
            <div className="p-4 space-y-3">
              {predefinedRanges?.map((range) => (
                <button
                  key={range?.value}
                  onClick={() => handleRangeSelect(range?.value)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                    selectedRange === range?.value
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <Icon name={range?.icon} size={16} />
                  <span className="text-sm font-medium">{range?.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Desktop Button Group */}
      <div className="hidden lg:flex items-center space-x-2">
        {predefinedRanges?.map((range) => (
          <Button
            key={range?.value}
            variant={selectedRange === range?.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleRangeSelect(range?.value)}
            iconName={range?.icon}
            iconPosition="left"
          >
            {range?.label}
          </Button>
        ))}
      </div>
      {/* Custom Date Picker Modal */}
      {showCustomPicker && selectedRange === 'custom' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-popover border border-border rounded-lg shadow-modal w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Select Custom Date Range</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCustomPicker(false)}
                  iconName="X"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e?.target?.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e?.target?.value)}
                    min={tempStartDate}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCustomPicker(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleCustomDateApply}
                  disabled={!tempStartDate || !tempEndDate}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;