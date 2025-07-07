
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useTenant } from '@/contexts/TenantContext';
import { usePageTitle } from '@/hooks/usePageTitle';

const Index = () => {
  usePageTitle('Dashboard');
  const { stats, loading: statsLoading } = useDashboardStats();
  const { workflows, loading: workflowsLoading } = useWorkflows();
  const { currentTenant, loading: tenantLoading } = useTenant();

  if (tenantLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-lg">Loading HALO...</div>
      </div>
    );
  }

  return (
    <Layout pageTitle="Dashboard">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Welcome back to HALO
            </h2>
            <p className="text-muted-foreground">
              {currentTenant?.name} - Here's what's happening with your automation systems today.
            </p>
          </div>
          
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {/* Stats Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stats.totalWorkflows}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeWorkflows} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : `${stats.successRate}%`}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stats.totalExecutions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Good</div>
                <p className="text-xs text-muted-foreground">
                  99.9% uptime
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Workflows */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              {workflowsLoading ? (
                <div className="text-center py-8">Loading workflows...</div>
              ) : workflows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No workflows created yet. Start by creating your first automation!
                </div>
              ) : (
                <div className="space-y-4">
                  {workflows.slice(0, 5).map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{workflow.name}</h4>
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      </div>
                      <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                        {workflow.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
    </Layout>
  );
};

export default Index;
