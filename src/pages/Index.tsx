
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle, AlertTriangle, TrendingUp, Zap, Users, Award, Package } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useTenant } from '@/contexts/TenantContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useEnterpriseData } from '@/hooks/useEnterpriseData';
import { Link } from 'react-router-dom';

const Index = () => {
  usePageTitle('Dashboard');
  const { stats, loading: statsLoading } = useDashboardStats();
  const { workflows, loading: workflowsLoading } = useWorkflows();
  const { currentTenant, loading: tenantLoading } = useTenant();
  const { hasEnterpiseData, loading: enterpriseLoading } = useEnterpriseData();

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

          {/* Enterprise Section */}
          {hasEnterpiseData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    MASP Certification Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-primary">GOLD Certified</div>
                      <p className="text-sm text-muted-foreground">Enterprise automation provider</p>
                    </div>
                    <Link to="/enterprise">
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Response Time</span>
                      <span className="text-sm font-medium">245ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">System Uptime</span>
                      <span className="text-sm font-medium">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Error Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">0.1%</span>
                        <Link to="/performance">
                          <Button variant="outline" size="sm">Monitor</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI Assistant & Marketplace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Resonant Directive AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Enhanced AI assistant with advanced workflow generation and optimization capabilities.
                </p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                  <Link to="/ai-assist">
                    <Button size="sm">Open Assistant</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Integration Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover powerful integrations to extend your automation capabilities.
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">150+</span> integrations available
                  </div>
                  <Link to="/marketplace">
                    <Button size="sm" variant="outline">Browse</Button>
                  </Link>
                </div>
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
