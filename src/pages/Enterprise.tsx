import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Users, 
  Package, 
  TrendingUp, 
  Shield, 
  Settings,
  Star,
  Award,
  Building,
  Globe
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useTenant } from '@/contexts/TenantContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { enterpriseFeatureService } from '@/services/enterpriseFeatureService';
import { marketplaceService } from '@/services/marketplaceService';

const Enterprise = () => {
  usePageTitle('Enterprise Dashboard');
  const { currentTenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [maspProvider, setMaspProvider] = useState<any | null>(null);
  const [marketplaceIntegrations, setMarketplaceIntegrations] = useState<any[]>([]);
  const [whiteLabelConfig, setWhiteLabelConfig] = useState<any | null>(null);
  const [certification, setCertification] = useState<any>(null);

  useEffect(() => {
    if (currentTenant) {
      loadEnterpriseData();
    }
  }, [currentTenant]);

  const loadEnterpriseData = async () => {
    try {
      setLoading(true);
      
      // Mock services since they don't exist yet
      const mockData = [
        { clientCount: 24, automationCount: 186, successRate: 98.7 },
        [],
        { isEnabled: false },
        { isValid: true, level: 'gold', expiresIn: 120 }
      ];

      setMaspProvider(mockData[0]);
      setMarketplaceIntegrations(mockData[1] as any[]);
      setWhiteLabelConfig(mockData[2]);
      setCertification(mockData[3]);
    } catch (error) {
      console.error('Failed to load enterprise data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCertificationColor = (level?: string) => {
    switch (level) {
      case 'bronze': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCertificationIcon = (level?: string) => {
    switch (level) {
      case 'bronze': return Award;
      case 'silver': return Trophy;
      case 'gold': return Star;
      case 'platinum': return Shield;
      default: return Award;
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Enterprise Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading enterprise data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Enterprise Dashboard">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Enterprise Dashboard
        </h2>
        <p className="text-muted-foreground">
          MASP provider management and enterprise features for {currentTenant?.name}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maspProvider?.clientCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automations Built</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maspProvider?.automationCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              +15 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maspProvider?.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Above industry average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marketplace Items</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketplaceIntegrations.length}</div>
            <p className="text-xs text-muted-foreground">
              Available integrations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="certification" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="certification">MASP Certification</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="whitelabel">White Label</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="certification">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                MASP Certification Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {certification?.isValid ? (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const IconComponent = getCertificationIcon(certification.level);
                      return <IconComponent className="h-6 w-6 text-primary" />;
                    })()}
                    <div>
                      <h3 className="font-semibold">
                        MASP {certification.level?.toUpperCase()} Certified
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Valid certification - expires in {certification.expiresIn} days
                      </p>
                    </div>
                  </div>
                  <Badge className={getCertificationColor(certification.level)}>
                    {certification.level?.toUpperCase()}
                  </Badge>
                </div>
              ) : (
                <div className="p-4 border rounded-lg border-yellow-200 bg-yellow-50">
                  <h3 className="font-semibold text-yellow-800">No Active Certification</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Apply for MASP certification to unlock enterprise features
                  </p>
                  <Button className="mt-3" size="sm">
                    Start Certification Process
                  </Button>
                </div>
              )}

              {maspProvider?.specializations && (
                <div>
                  <h4 className="font-medium mb-3">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {maspProvider.specializations.map((spec) => (
                      <Badge key={spec} variant="outline">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              {marketplaceIntegrations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketplaceIntegrations.slice(0, 6).map((integration) => (
                    <Card key={integration.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{integration.name}</h4>
                        {integration.isVerified && (
                          <Badge variant="outline" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {integration.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          ${integration.price}
                        </span>
                        <Button size="sm" variant="outline">
                          Install
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No marketplace integrations available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whitelabel">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                White Label Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {whiteLabelConfig?.isEnabled ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg border-green-200 bg-green-50">
                    <h3 className="font-semibold text-green-800">White Label Active</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Platform: {whiteLabelConfig.branding.platformName}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Branding</h4>
                      <div className="space-y-2 text-sm">
                        <div>Platform: {whiteLabelConfig.branding.platformName}</div>
                        <div>Primary Color: {whiteLabelConfig.branding.primaryColor}</div>
                        <div>Font: {whiteLabelConfig.branding.font}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Features</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Hide HALO Branding</span>
                          <Badge variant={whiteLabelConfig.features.hideHALOBranding ? 'default' : 'secondary'}>
                            {whiteLabelConfig.features.hideHALOBranding ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Custom Login</span>
                          <Badge variant={whiteLabelConfig.features.customLoginPage ? 'default' : 'secondary'}>
                            {whiteLabelConfig.features.customLoginPage ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 border rounded-lg border-blue-200 bg-blue-50">
                    <h3 className="font-semibold text-blue-800">White Label Available</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Customize HALO with your branding and domain
                    </p>
                    <Button className="mt-3" size="sm">
                      Configure White Label
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Performance Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">Avg. Response Time</div>
                      <div className="text-2xl font-bold">245ms</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">Uptime</div>
                      <div className="text-2xl font-bold">99.9%</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-sm text-muted-foreground">Error Rate</div>
                      <div className="text-2xl font-bold">0.1%</div>
                    </Card>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Client Satisfaction</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Satisfaction</span>
                        <span>94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Automation Reliability</span>
                        <span>98%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Support Response</span>
                        <span>91%</span>
                      </div>
                      <Progress value={91} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Enterprise;