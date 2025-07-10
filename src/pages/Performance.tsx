import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Zap,
  Database,
  Server,
  Network
} from 'lucide-react';
import Layout from '@/components/Layout';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useTenant } from '@/contexts/TenantContext';

interface PerformanceMetrics {
  responseTime: number;
  uptime: number;
  errorRate: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
  dbConnections: number;
  activeWorkflows: number;
}

interface SystemAlert {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  resolved: boolean;
}

const Performance = () => {
  usePageTitle('Performance Monitoring');
  const { currentTenant } = useTenant();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 245,
    uptime: 99.9,
    errorRate: 0.1,
    throughput: 1250,
    memoryUsage: 68,
    cpuUsage: 42,
    dbConnections: 15,
    activeWorkflows: 28
  });
  
  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      level: 'warning',
      message: 'Memory usage approaching 70% threshold',
      timestamp: '2024-01-10T10:30:00Z',
      resolved: false
    },
    {
      id: '2',
      level: 'info',
      message: 'Database optimization completed successfully',
      timestamp: '2024-01-10T09:15:00Z',
      resolved: true
    },
    {
      id: '3',
      level: 'error',
      message: 'Failed workflow execution in automation #1247',
      timestamp: '2024-01-10T08:45:00Z',
      resolved: false
    }
  ]);

  const [loading, setLoading] = useState(false);

  const refreshMetrics = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        responseTime: Math.floor(Math.random() * 100) + 200,
        cpuUsage: Math.floor(Math.random() * 20) + 35,
        memoryUsage: Math.floor(Math.random() * 15) + 60,
        throughput: Math.floor(Math.random() * 500) + 1000
      }));
      setLoading(false);
    }, 1000);
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'error': return AlertTriangle;
      case 'warning': return Clock;
      case 'info': return CheckCircle;
      default: return Activity;
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMetricTrend = (value: number, threshold: number) => {
    if (value > threshold) return { icon: TrendingUp, color: 'text-red-500' };
    return { icon: TrendingDown, color: 'text-green-500' };
  };

  return (
    <Layout pageTitle="Performance Monitoring">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Performance Monitoring
            </h2>
            <p className="text-muted-foreground">
              Real-time system performance and health metrics for {currentTenant?.name}
            </p>
          </div>
          <Button onClick={refreshMetrics} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Metrics'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Target: &lt;300ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate}%</div>
            <p className="text-xs text-muted-foreground">
              Target: &lt;1%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.throughput.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              requests/hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>System Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm">{metrics.cpuUsage}%</span>
              </div>
              <Progress value={metrics.cpuUsage} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm">{metrics.memoryUsage}%</span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <Database className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{metrics.dbConnections}</div>
                <div className="text-xs text-muted-foreground">DB Connections</div>
              </div>
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{metrics.activeWorkflows}</div>
                <div className="text-xs text-muted-foreground">Active Workflows</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => {
                const IconComponent = getAlertIcon(alert.level);
                return (
                  <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <IconComponent className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getAlertColor(alert.level)}>
                          {alert.level.toUpperCase()}
                        </Badge>
                        {alert.resolved && (
                          <Badge variant="outline" className="text-green-600">
                            RESOLVED
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Database Optimization</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Consider adding indexes to frequently queried workflow tables to improve response times.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg border-yellow-200 bg-yellow-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Memory Management</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Memory usage is approaching 70%. Consider implementing workflow result caching to reduce memory pressure.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg border-green-200 bg-green-50">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Scaling Opportunity</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your system is performing well. Consider enabling auto-scaling for peak traffic periods.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Performance;