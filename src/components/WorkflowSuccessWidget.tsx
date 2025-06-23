
import DashboardWidget from './DashboardWidget';

const WorkflowSuccessWidget = () => {
  const successRate = 94.7;

  return (
    <DashboardWidget title="Workflow Success Rate">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {successRate}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${successRate}%` }}
            ></div>
          </div>
        </div>
        <div className="ml-4 text-right">
          <div className="text-sm text-halo-textSecondary">Last 24h</div>
          <div className="text-xs text-green-600 font-medium">↗ +2.3%</div>
        </div>
      </div>
    </DashboardWidget>
  );
};

export default WorkflowSuccessWidget;
