import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const QuickActions = () => {
  const actions = [
    {
      title: 'Upload New Track',
      description: 'Add music to your catalog',
      icon: 'Upload',
      variant: 'default',
      path: '/music-upload-management'
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-card">
      <h3 className="font-heading font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions?.map((action, index) => (
          <Link key={index} to={action?.path} className="block">
            <Button
              variant={action?.variant}
              iconName={action?.icon}
              iconPosition="left"
              fullWidth
              className="justify-start h-auto p-4"
            >
              <div className="text-left">
                <div className="font-medium">{action?.title}</div>
                <div className="text-xs opacity-80 mt-1">{action?.description}</div>
              </div>
            </Button>
          </Link>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Need help?</span>
          <Link to="/contact">
            <Button variant="ghost" size="sm" iconName="HelpCircle" iconPosition="left">
              Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;