import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus } from 'lucide-react';
import { IntegrationNode, IntegrationCategory } from '@/types/integrations';
import { integrationsByCategory, getTriggerIntegrations, getActionIntegrations } from '@/lib/integrations';
import * as Icons from 'lucide-react';

interface IntegrationPaletteProps {
  onSelectIntegration: (integration: IntegrationNode) => void;
  className?: string;
}

export const IntegrationPalette = ({ onSelectIntegration, className }: IntegrationPaletteProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'all'>('all');

  const categories: Array<{ key: IntegrationCategory | 'all'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'communication', label: 'Communication' },
    { key: 'crm', label: 'CRM' },
    { key: 'webhook', label: 'Webhooks' },
    { key: 'database', label: 'Database' },
    { key: 'file_storage', label: 'Storage' },
    { key: 'ai', label: 'AI' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'payment', label: 'Payment' }
  ];

  const getFilteredIntegrations = () => {
    let integrations = selectedCategory === 'all' 
      ? [...getTriggerIntegrations(), ...getActionIntegrations()]
      : integrationsByCategory[selectedCategory as IntegrationCategory] || [];

    if (searchTerm) {
      integrations = integrations.filter(integration =>
        integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return integrations;
  };

  const renderIntegrationCard = (integration: IntegrationNode) => {
    const IconComponent = Icons[integration.icon as keyof typeof Icons] as any;
    
    return (
      <div
        key={integration.id}
        className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
        onClick={() => onSelectIntegration(integration)}
      >
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${integration.color}`}>
            <IconComponent className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-halo-text truncate">
                {integration.name}
              </h4>
              <Badge variant={integration.type === 'trigger' ? 'default' : 'secondary'} className="text-xs">
                {integration.type}
              </Badge>
            </div>
            <p className="text-xs text-halo-textSecondary mt-1 line-clamp-2">
              {integration.description}
            </p>
            {integration.requiresAuth && (
              <Badge variant="outline" className="text-xs mt-2">
                Auth Required
              </Badge>
            )}
          </div>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white border-r ${className}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-halo-text mb-3">Integration Library</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search integrations..."
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)} className="flex-1">
        <TabsList className="grid w-full grid-cols-3 p-1 m-1">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="communication">Comm</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 p-4">
          <TabsContent value={selectedCategory} className="space-y-3 mt-0">
            {getFilteredIntegrations().map(renderIntegrationCard)}
            
            {getFilteredIntegrations().length === 0 && (
              <div className="text-center py-8">
                <p className="text-halo-textSecondary">
                  {searchTerm ? 'No integrations found matching your search.' : 'No integrations available in this category.'}
                </p>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};