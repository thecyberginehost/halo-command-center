
import DashboardWidget from './DashboardWidget';

const RecentActivityWidget = () => {
  const activities = [
    { 
      time: '2 min ago', 
      action: 'Workflow "Invoice Processing" completed',
      status: 'success'
    },
    { 
      time: '5 min ago', 
      action: 'Data sync initiated for CRM integration',
      status: 'info'
    },
    { 
      time: '12 min ago', 
      action: 'Alert: Email delivery rate below threshold',
      status: 'warning'
    },
    { 
      time: '18 min ago', 
      action: 'User onboarding automation triggered',
      status: 'success'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <DashboardWidget title="Recent Activity">
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-50 last:border-b-0">
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
              activity.status === 'success' ? 'bg-green-500' :
              activity.status === 'warning' ? 'bg-yellow-500' :
              activity.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-halo-text">{activity.action}</p>
              <p className="text-xs text-halo-textSecondary mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
};

export default RecentActivityWidget;
