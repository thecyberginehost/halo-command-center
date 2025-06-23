
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import WorkflowSuccessWidget from '../components/WorkflowSuccessWidget';
import AutomationHealthWidget from '../components/AutomationHealthWidget';
import SystemUptimeWidget from '../components/SystemUptimeWidget';
import RecentActivityWidget from '../components/RecentActivityWidget';
import AISuggestionsWidget from '../components/AISuggestionsWidget';
import ActiveWorkflowsWidget from '../components/ActiveWorkflowsWidget';
import ResonantDirective from '../components/ResonantDirective';

const Index = () => {
  return (
    <div className="h-screen bg-halo-background flex w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <Header />
        
        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-halo-text mb-2">
              Welcome back, Alex
            </h2>
            <p className="text-halo-textSecondary">
              Here's what's happening with your automation systems today.
            </p>
          </div>
          
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Row 1 */}
            <WorkflowSuccessWidget />
            <AutomationHealthWidget />
            <SystemUptimeWidget />
            
            {/* Row 2 */}
            <div className="md:col-span-2">
              <RecentActivityWidget />
            </div>
            <AISuggestionsWidget />
            
            {/* Row 3 */}
            <div className="lg:col-span-2">
              <ActiveWorkflowsWidget />
            </div>
            <div className="widget-card">
              <h3 className="text-lg font-semibold text-halo-text mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-halo-text text-sm">Create New Workflow</div>
                  <div className="text-xs text-halo-textSecondary">Build automation from scratch</div>
                </button>
                <button className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-halo-text text-sm">View System Logs</div>
                  <div className="text-xs text-halo-textSecondary">Check recent activity details</div>
                </button>
                <button className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="font-medium text-halo-text text-sm">Performance Report</div>
                  <div className="text-xs text-halo-textSecondary">Generate monthly analytics</div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Floating AI Assistant */}
      <ResonantDirective />
    </div>
  );
};

export default Index;
