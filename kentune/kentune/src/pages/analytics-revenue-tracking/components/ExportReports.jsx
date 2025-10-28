import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExportReports = ({ onExport }) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'pdf',
    includeCharts: true,
    includeTrackDetails: true,
    includeRevenue: true,
    includeGeographic: false,
    dateRange: '30days'
  });
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    { value: 'pdf', label: 'PDF Report', icon: 'FileText', description: 'Comprehensive report with charts and data' },
    { value: 'csv', label: 'CSV Data', icon: 'Download', description: 'Raw data for spreadsheet analysis' },
    { value: 'excel', label: 'Excel Workbook', icon: 'FileSpreadsheet', description: 'Formatted data with multiple sheets' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onExport) {
        onExport(exportOptions);
      }
      
      // Generate mock download
      const fileName = `kentune-analytics-${new Date()?.toISOString()?.split('T')?.[0]}.${exportOptions?.format}`;
      console.log(`Exporting ${fileName} with options:`, exportOptions);
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const updateOption = (key, value) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowExportModal(true)}
        iconName="Download"
        iconPosition="left"
        className="w-full sm:w-auto"
      >
        Export Report
      </Button>
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-popover border border-border rounded-lg shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Export Analytics Report</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowExportModal(false)}
                  iconName="X"
                />
              </div>

              <div className="space-y-6">
                {/* Export Format */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Export Format</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {exportFormats?.map((format) => (
                      <button
                        key={format?.value}
                        onClick={() => updateOption('format', format?.value)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          exportOptions?.format === format?.value
                            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <Icon name={format?.icon} size={20} className="text-primary" />
                          <span className="font-medium text-foreground">{format?.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{format?.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Date Range</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['7days', '30days', '3months', '6months']?.map((range) => (
                      <button
                        key={range}
                        onClick={() => updateOption('dateRange', range)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          exportOptions?.dateRange === range
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        {range === '7days' ? '7 Days' :
                         range === '30days' ? '30 Days' :
                         range === '3months' ? '3 Months' : '6 Months'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Include Options */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Include in Report</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'includeCharts', label: 'Charts and Graphs', description: 'Visual representations of data' },
                      { key: 'includeTrackDetails', label: 'Track Analytics', description: 'Individual track performance data' },
                      { key: 'includeRevenue', label: 'Revenue Breakdown', description: 'Detailed financial information' },
                      { key: 'includeGeographic', label: 'Geographic Data', description: 'Location-based analytics' }
                    ]?.map((option) => (
                      <div key={option?.key} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                        <button
                          onClick={() => updateOption(option?.key, !exportOptions?.[option?.key])}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            exportOptions?.[option?.key]
                              ? 'bg-primary border-primary' :'border-border hover:border-primary/50'
                          }`}
                        >
                          {exportOptions?.[option?.key] && (
                            <Icon name="Check" size={12} color="white" />
                          )}
                        </button>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{option?.label}</p>
                          <p className="text-xs text-muted-foreground">{option?.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Preview */}
                <div className="bg-accent/5 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="Info" size={16} className="text-accent mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Export Preview</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your report will include {Object.values(exportOptions)?.filter(v => v === true)?.length} sections 
                        covering the last {exportOptions?.dateRange?.replace('days', ' days')?.replace('months', ' months')} 
                        in {exportOptions?.format?.toUpperCase()} format.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowExportModal(false)}
                  disabled={isExporting}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleExport}
                  loading={isExporting}
                  iconName="Download"
                  iconPosition="left"
                >
                  {isExporting ? 'Exporting...' : 'Export Report'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportReports;