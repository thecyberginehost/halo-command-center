import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Settings, MoreVertical } from 'lucide-react';

const Automations = () => {
  // Mock data for automations
  const automations = [
    {
      id: 1,
      name: "Contact Form to CRM",
      description: "Automatically add form submissions to Salesforce",
      status: "active",
      executions: 127,
      lastRun: "2 hours ago"
    },
    {
      id: 2,
      name: "Slack Notifications",
      description: "Send team notifications for critical alerts",
      status: "active",
      executions: 89,
      lastRun: "15 minutes ago"
    },
    {
      id: 3,
      name: "Data Backup",
      description: "Daily backup of customer data to S3",
      status: "paused",
      executions: 45,
      lastRun: "1 day ago"
    }
  ];

  return (
    <div className="h-screen bg-halo-background flex w-full overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-halo-text mb-2">
                  Automations
                </h2>
                <p className="text-halo-textSecondary">
                  Manage and monitor your workflow automations
                </p>
              </div>
              <Button className="bg-halo-accent hover:bg-halo-accent/90">
                Create Automation
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {automations.map((automation) => (
              <Card key={automation.id} className="bg-white border-halo-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold text-halo-text">
                      {automation.name}
                    </CardTitle>
                    <p className="text-sm text-halo-textSecondary">
                      {automation.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={automation.status === 'active' ? 'default' : 'secondary'}
                      className={automation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    >
                      {automation.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="text-sm">
                        <span className="text-halo-textSecondary">Executions:</span>
                        <span className="ml-1 font-medium text-halo-text">{automation.executions}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-halo-textSecondary">Last run:</span>
                        <span className="ml-1 font-medium text-halo-text">{automation.lastRun}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={automation.status === 'active' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {automation.status === 'active' ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Automations;