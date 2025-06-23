
import DashboardWidget from './DashboardWidget';
import { Button } from '@/components/ui/button';

const ActiveWorkflowsWidget = () => {
  const workflows = [
    {
      name: "Customer Onboarding",
      progress: 78,
      status: "running",
      eta: "5 min"
    },
    {
      name: "Invoice Processing",
      progress: 100,
      status: "completed",
      eta: "Done"
    },
    {
      name: "Data Backup",
      progress: 45,
      status: "running",
      eta: "12 min"
    },
    {
      name: "Report Generation",
      progress: 23,
      status: "running",
      eta: "25 min"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running': return 'status-indicator bg-blue-100 text-blue-800';
      case 'completed': return 'status-indicator status-success';
      case 'paused': return 'status-indicator status-warning';
      default: return 'status-indicator status-error';
    }
  };

  return (
    <DashboardWidget title="Active Workflows">
      <div className="space-y-4">
        {workflows.map((workflow, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-halo-text">{workflow.name}</span>
              <span className={getStatusBadge(workflow.status)}>
                {workflow.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      workflow.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${workflow.progress}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-halo-textSecondary">{workflow.eta}</span>
            </div>
            {workflow.status === 'running' && (
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="text-xs">
                  Pause
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  Details
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
};

export default ActiveWorkflowsWidget;
