import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, 
  Users, 
  TrendingUp, 
  Shield, 
  Star, 
  Download, 
  Store,
  Crown,
  Sparkles,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { 
  MASPCertificationService, 
  MarketplaceService, 
  WhiteLabelService,
  MASPProvider,
  MarketplaceIntegration,
  WhiteLabelConfig
} from '@/services/enterpriseFeatureService';

export function EnterpriseDashboard() {
  const { currentTenant } = useTenant();
  const [maspProvider, setMaspProvider] = useState<MASPProvider | null>(null);
  const [marketplaceIntegrations, setMarketplaceIntegrations] = useState<MarketplaceIntegration[]>([]);
  const [whiteLabelConfig, setWhiteLabelConfig] = useState<WhiteLabelConfig | null>(null);
  const [certification, setCertification] = useState<any>(null);
  const [whiteLabelEligibility, setWhiteLabelEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const maspService = new MASPCertificationService();
  const marketplaceService = new MarketplaceService();
  const whiteLabelService = new WhiteLabelService();

  useEffect(() => {
    if (currentTenant) {
      loadEnterpriseData();
    }
  }, [currentTenant]);

  const loadEnterpriseData = async () => {
    if (!currentTenant) return;
    
    setLoading(true);
    try {
      const [
        providerData,
        certificationData,
        marketplaceData,
        whiteLabelData,
        eligibilityData
      ] = await Promise.all([
        maspService.getMASPProvider(currentTenant.id),
        maspService.validateCertification(currentTenant.id),
        marketplaceService.getMarketplaceIntegrations(),
        whiteLabelService.getWhiteLabelConfig(currentTenant.id),
        whiteLabelService.validateWhiteLabelEligibility(currentTenant.id)
      ]);

      setMaspProvider(providerData);
      setCertification(certificationData);
      setMarketplaceIntegrations(marketplaceData);
      setWhiteLabelConfig(whiteLabelData);
      setWhiteLabelEligibility(eligibilityData);
    } catch (error) {
      console.error('Failed to load enterprise data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCertificationColor = (level?: string) => {
    switch (level) {
      case 'platinum': return 'text-purple-600 bg-purple-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'bronze': return 'text-amber-600 bg-amber-100';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getCertificationIcon = (level?: string) => {
    switch (level) {
      case 'platinum': return <Crown className="h-4 w-4" />;
      case 'gold': return <Award className="h-4 w-4" />;
      case 'silver': return <Star className="h-4 w-4" />;
      case 'bronze': return <Shield className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Dashboard</h1>
          <p className="text-muted-foreground">
            MASP Provider Portal & Marketplace Management
          </p>
        </div>
        
        {maspProvider && (
          <Badge 
            variant="secondary" 
            className={`${getCertificationColor(certification?.level)} px-3 py-1`}
          >
            <div className="flex items-center gap-2">
              {getCertificationIcon(certification?.level)}
              <span>MASP {certification?.level?.toUpperCase() || 'UNVERIFIED'}</span>
            </div>
          </Badge>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Active Clients</p>
                <p className="text-2xl font-bold">{maspProvider?.clientCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Automations Built</p>
                <p className="text-2xl font-bold">{maspProvider?.automationCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold">{maspProvider?.successRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Store className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Marketplace Items</p>
                <p className="text-2xl font-bold">{marketplaceIntegrations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="certification" className="space-y-4">
        <TabsList>
          <TabsTrigger value="certification">MASP Certification</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="white-label">White Label</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="certification" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Certification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certification Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {certification?.isValid ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Current Level</span>
                      <Badge className={getCertificationColor(certification.level)}>
                        {certification.level?.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Expires in</span>
                      <span className="text-sm">{certification.expiresIn} days</span>
                    </div>
                    {certification.renewalRequired && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">Renewal Required</span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">
                          Your certification expires soon. Complete renewal process.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900">Not MASP Certified</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Get certified to unlock premium features and client trust
                    </p>
                    <Button>Start Certification Process</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Certification Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Certification Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Automations Built</span>
                      <span>{maspProvider?.automationCount || 0}/50</span>
                    </div>
                    <Progress value={((maspProvider?.automationCount || 0) / 50) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Active Clients</span>
                      <span>{maspProvider?.clientCount || 0}/10</span>
                    </div>
                    <Progress value={((maspProvider?.clientCount || 0) / 10) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Success Rate</span>
                      <span>{maspProvider?.successRate || 0}%/95%</span>
                    </div>
                    <Progress value={maspProvider?.successRate || 0} />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {maspProvider?.specializations?.map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    )) || (
                      <p className="text-sm text-muted-foreground">No specializations yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Marketplace Integrations
                </CardTitle>
                <Button>Submit New Integration</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketplaceIntegrations.slice(0, 6).map((integration) => (
                  <Card key={integration.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm">{integration.name}</h3>
                        {integration.isVerified && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {integration.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline">{integration.category}</Badge>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          <span>{integration.downloads}</span>
                        </div>
                      </div>
                      {integration.price > 0 && (
                        <div className="mt-2 text-sm font-medium">
                          ${integration.price}/{integration.pricingModel}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="white-label" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                White Label Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {whiteLabelEligibility?.eligible ? (
                <div className="space-y-4">
                  {whiteLabelConfig?.isEnabled ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">White Label Active</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><strong>Platform Name:</strong> {whiteLabelConfig.branding.platformName}</p>
                        <p><strong>Custom Domain:</strong> {whiteLabelConfig.customDomain || 'Not configured'}</p>
                        <p><strong>SSO Enabled:</strong> {whiteLabelConfig.sso.enabled ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Crown className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <h3 className="font-medium">White Label Available</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Configure your branded automation platform
                      </p>
                      <Button>Configure White Label</Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">White Label Requirements</span>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {whiteLabelEligibility?.requirements?.map((req: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-yellow-600 rounded-full"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Monthly Revenue</span>
                    <span className="text-2xl font-bold">
                      ${maspProvider?.billing?.monthlyRevenue?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Client Seats</span>
                    <span className="font-medium">{maspProvider?.billing?.clientSeats || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Plan Type</span>
                    <Badge variant="outline">
                      {maspProvider?.billing?.plan?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Success Rate</span>
                    <span className="text-2xl font-bold text-green-600">
                      {maspProvider?.successRate || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Automations</span>
                    <span className="font-medium">{maspProvider?.automationCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Client Satisfaction</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.8/5.0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}