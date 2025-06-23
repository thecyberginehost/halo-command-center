
import DashboardWidget from './DashboardWidget';

const AutomationHealthWidget = () => {
  const healthData = [
    { name: 'API Gateway', status: 'healthy', color: 'bg-green-500' },
    { name: 'Data Pipeline', status: 'healthy', color: 'bg-green-500' },
    { name: 'Email Service', status: 'warning', color: 'bg-yellow-500' },
    { name: 'Database', status: 'healthy', color: 'bg-green-500' },
  ];

  return (
    <DashboardWidget title="Automation Health">
      <div className="space-y-3">
        {healthData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <span className="text-sm font-medium text-halo-text">{item.name}</span>
            </div>
            <span className={`status-indicator ${
              item.status === 'healthy' ? 'status-success' : 
              item.status === 'warning' ? 'status-warning' : 'status-error'
            }`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-sm text-halo-textSecondary">
          Overall Health: <span className="font-medium text-green-600">Good</span>
        </div>
      </div>
    </DashboardWidget>
  );
};

export default AutomationHealthWidget;
