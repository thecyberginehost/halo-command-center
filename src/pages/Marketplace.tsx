import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Star, 
  Download, 
  Shield, 
  Package, 
  Filter,
  Grid,
  List as ListIcon,
  Mail,
  Database,
  Bot,
  Zap
} from 'lucide-react';
import Layout from '@/components/Layout';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useTenant } from '@/contexts/TenantContext';
import { MarketplaceService, type MarketplaceIntegration } from '@/services/enterpriseFeatureService';

const Marketplace = () => {
  usePageTitle('Marketplace');
  const { currentTenant } = useTenant();
  const [integrations, setIntegrations] = useState<MarketplaceIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadMarketplaceIntegrations();
  }, [selectedCategory]);

  const loadMarketplaceIntegrations = async () => {
    try {
      setLoading(true);
      const marketplaceService = new MarketplaceService();
      const data = await marketplaceService.getMarketplaceIntegrations(
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      
      // Add some sample data if none exists
      if (data.length === 0) {
        const sampleIntegrations: MarketplaceIntegration[] = [
          {
            id: 'email-master',
            name: 'Email Master Pro',
            description: 'Advanced email automation with AI-powered personalization and analytics',
            category: 'email',
            providerId: 'halo-official',
            providerName: 'HALO Official',
            version: '2.1.0',
            price: 29.99,
            pricingModel: 'monthly',
            downloads: 1547,
            rating: 4.8,
            reviews: [],
            isVerified: true,
            isFeatured: true,
            tags: ['email', 'automation', 'ai', 'analytics'],
            screenshots: [],
            documentation: 'Complete email automation toolkit',
            supportEmail: 'support@halo.dev',
            lastUpdated: new Date(),
            integrationConfig: { nodes: [], templates: [], credentials: [] }
          },
          {
            id: 'crm-sync',
            name: 'CRM Universal Sync',
            description: 'Sync data across multiple CRM platforms with real-time updates',
            category: 'crm',
            providerId: 'automation-experts',
            providerName: 'Automation Experts',
            version: '1.5.2',
            price: 49.99,
            pricingModel: 'monthly',
            downloads: 892,
            rating: 4.6,
            reviews: [],
            isVerified: true,
            isFeatured: false,
            tags: ['crm', 'sync', 'salesforce', 'hubspot'],
            screenshots: [],
            documentation: 'Universal CRM synchronization',
            supportEmail: 'help@automationexperts.com',
            lastUpdated: new Date(),
            integrationConfig: { nodes: [], templates: [], credentials: [] }
          },
          {
            id: 'ai-content',
            name: 'AI Content Generator',
            description: 'Generate high-quality content using advanced AI models',
            category: 'ai',
            providerId: 'content-creators',
            providerName: 'Content Creators Co',
            version: '3.0.1',
            price: 0,
            pricingModel: 'free',
            downloads: 2341,
            rating: 4.9,
            reviews: [],
            isVerified: true,
            isFeatured: true,
            tags: ['ai', 'content', 'gpt', 'writing'],
            screenshots: [],
            documentation: 'AI-powered content generation',
            supportEmail: 'support@contentcreators.co',
            lastUpdated: new Date(),
            integrationConfig: { nodes: [], templates: [], credentials: [] }
          },
          {
            id: 'data-transformer',
            name: 'Data Transformer Suite',
            description: 'Transform and process data between different formats and systems',
            category: 'data',
            providerId: 'data-wizards',
            providerName: 'Data Wizards Inc',
            version: '1.8.0',
            price: 19.99,
            pricingModel: 'monthly',
            downloads: 673,
            rating: 4.4,
            reviews: [],
            isVerified: false,
            isFeatured: false,
            tags: ['data', 'transform', 'json', 'xml', 'csv'],
            screenshots: [],
            documentation: 'Complete data transformation toolkit',
            supportEmail: 'info@datawizards.com',
            lastUpdated: new Date(),
            integrationConfig: { nodes: [], templates: [], credentials: [] }
          }
        ];
        setIntegrations(sampleIntegrations);
      } else {
        setIntegrations(data);
      }
    } catch (error) {
      console.error('Failed to load marketplace integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIntegrations = integrations.filter(integration =>
    integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    integration.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categories = [
    { id: 'all', name: 'All Categories', icon: Grid },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'crm', name: 'CRM', icon: Database },
    { id: 'ai', name: 'AI & ML', icon: Bot },
    { id: 'data', name: 'Data', icon: Zap }
  ];

  const handleInstall = async (integrationId: string) => {
    try {
      const marketplaceService = new MarketplaceService();
      await marketplaceService.installIntegration(currentTenant!.id, integrationId);
      // Refresh the integrations to update download count
      await loadMarketplaceIntegrations();
    } catch (error) {
      console.error('Failed to install integration:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData?.icon || Package;
  };

  return (
    <Layout pageTitle="Marketplace">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Integration Marketplace
        </h2>
        <p className="text-muted-foreground">
          Discover and install powerful integrations to extend your automation capabilities
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Featured Section */}
      {selectedCategory === 'all' && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Featured Integrations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations
              .filter(integration => integration.isFeatured)
              .map((integration) => {
                const CategoryIcon = getCategoryIcon(integration.category);
                return (
                  <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-6 w-6 text-primary" />
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              by {integration.providerName}
                            </p>
                          </div>
                        </div>
                        {integration.isVerified && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {integration.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{integration.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{integration.downloads.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {integration.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          {integration.price === 0 ? (
                            <span className="font-semibold text-green-600">Free</span>
                          ) : (
                            <span className="font-semibold">
                              ${integration.price}
                              {integration.pricingModel === 'monthly' && '/mo'}
                            </span>
                          )}
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleInstall(integration.id)}
                        >
                          Install
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* All Integrations */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">
          {selectedCategory === 'all' ? 'All Integrations' : `${categories.find(c => c.id === selectedCategory)?.name} Integrations`}
        </h3>
        
        {loading ? (
          <div className="text-center py-8">Loading integrations...</div>
        ) : filteredIntegrations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No integrations found matching your criteria
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {filteredIntegrations.map((integration) => {
              const CategoryIcon = getCategoryIcon(integration.category);
              
              if (viewMode === 'list') {
                return (
                  <Card key={integration.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CategoryIcon className="h-8 w-8 text-primary" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{integration.name}</h4>
                            {integration.isVerified && (
                              <Shield className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {integration.description}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground">
                              by {integration.providerName}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">{integration.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{integration.downloads.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          {integration.price === 0 ? (
                            <span className="font-semibold text-green-600">Free</span>
                          ) : (
                            <span className="font-semibold">
                              ${integration.price}
                              {integration.pricingModel === 'monthly' && '/mo'}
                            </span>
                          )}
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleInstall(integration.id)}
                        >
                          Install
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              }

              return (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            by {integration.providerName}
                          </p>
                        </div>
                      </div>
                      {integration.isVerified && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {integration.description}
                    </p>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{integration.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{integration.downloads.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {integration.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {integration.price === 0 ? (
                          <span className="font-semibold text-green-600">Free</span>
                        ) : (
                          <span className="font-semibold">
                            ${integration.price}
                            {integration.pricingModel === 'monthly' && '/mo'}
                          </span>
                        )}
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleInstall(integration.id)}
                      >
                        Install
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Marketplace;