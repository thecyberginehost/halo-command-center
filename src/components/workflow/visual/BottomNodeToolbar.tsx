import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Zap, Send, Database, FileText, Brain, BarChart, CreditCard, Code, GitBranch } from 'lucide-react';
import { IntegrationNode, IntegrationCategory } from '@/types/integrations';
import { integrationsByCategory } from '@/lib/integrations';

interface BottomNodeToolbarProps {
  onAddNode: (integration: IntegrationNode, position: { x: number; y: number }) => void;
}

const categoryIcons: Record<IntegrationCategory, any> = {
  communication: Send,
  crm: Database,
  webhook: Zap,
  database: Database,
  file_storage: FileText,
  ai: Brain,
  analytics: BarChart,
  payment: CreditCard,
  productivity: FileText,
  developer_tools: Code,
  triggers: Zap,
};

const categoryLabels: Record<IntegrationCategory, string> = {
  communication: 'Communication',
  crm: 'CRM',
  webhook: 'Webhooks',
  database: 'Database',
  file_storage: 'File Storage',
  ai: 'AI & ML',
  analytics: 'Analytics',
  payment: 'Payments',
  productivity: 'Productivity',
  developer_tools: 'Dev Tools',
  triggers: 'Triggers',
};

// Redesigned for ultra-compact display - all node types fit without scrolling
const nodeTypeGroups = [
  { id: 'triggers', label: 'Triggers', icon: Zap, color: '#10B981', categories: ['triggers'] },
  { id: 'actions', label: 'Actions', icon: Send, color: '#3B82F6', categories: ['communication', 'crm', 'productivity', 'payment', 'file_storage'] },
  { id: 'data', label: 'Data', icon: Database, color: '#8B5CF6', categories: ['database'] },
  { id: 'flow', label: 'Flow', icon: GitBranch, color: '#F59E0B', categories: ['webhook'] },
  { id: 'ai', label: 'AI', icon: Brain, color: '#EC4899', categories: ['ai'] },
  { id: 'analytics', label: 'Stats', icon: BarChart, color: '#06B6D4', categories: ['analytics'] },
  { id: 'dev', label: 'Dev', icon: Code, color: '#64748B', categories: ['developer_tools'] }
];

export function BottomNodeToolbar({ onAddNode }: BottomNodeToolbarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const getIntegrationsForGroup = (group: typeof nodeTypeGroups[0]) => {
    const allIntegrations: IntegrationNode[] = [];
    group.categories.forEach(category => {
      const categoryIntegrations = integrationsByCategory[category as IntegrationCategory] || [];
      allIntegrations.push(...categoryIntegrations);
    });
    return allIntegrations;
  };

  const getFilteredIntegrationsForGroup = (group: typeof nodeTypeGroups[0]) => {
    const allIntegrations = getIntegrationsForGroup(group);
    return allIntegrations.filter(integration =>
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Global search across all integrations
  const getGlobalSearchResults = () => {
    if (!searchTerm) return [];
    
    const allIntegrations: IntegrationNode[] = [];
    nodeTypeGroups.forEach(group => {
      allIntegrations.push(...getIntegrationsForGroup(group));
    });
    
    return allIntegrations.filter(integration =>
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Remove drag functionality - just use click
  const handleNodeClick = (integration: IntegrationNode) => {
    onAddNode(integration, { x: 100, y: 100 }); // Default position
    setOpenPopover(null);
    setSearchTerm(''); // Clear search after adding
  };

  const NodeItem = ({ integration }: { integration: IntegrationNode }) => {
    const Icon = integration.icon;
    
    return (
      <div
        className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors border hover:border-primary/20"
        onClick={() => handleNodeClick(integration)}
      >
        <div 
          className="p-1.5 rounded flex items-center justify-center min-w-[28px] h-7"
          style={{ backgroundColor: integration.color + '15' }}
        >
          {Icon && (
            <Icon 
              className="h-3.5 w-3.5" 
              style={{ color: integration.color }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground">{integration.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {integration.description}
          </p>
          <Badge 
            variant={integration.type === 'trigger' ? 'default' : 'secondary'}
            className="text-xs mt-1"
          >
            {integration.type}
          </Badge>
        </div>
      </div>
    );
  };

  const globalSearchResults = getGlobalSearchResults();
  const hasSearchResults = searchTerm && globalSearchResults.length > 0;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center">
      {/* Search Results Dropdown - Above everything */}
      {hasSearchResults && (
        <Card className="mb-2 w-80 max-h-80 border shadow-xl bg-background">
          <div className="p-3 border-b">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Results
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {globalSearchResults.length} integration{globalSearchResults.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <div className="p-2 space-y-1">
              {globalSearchResults.map((integration) => (
                <NodeItem key={integration.id} integration={integration} />
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Main Toolbar - Redesigned for maximum compactness */}
      <Card className="bg-background/95 backdrop-blur-sm border shadow-xl">
        <div className="flex items-center gap-2 p-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-40 h-8 text-sm"
            />
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-border" />

          {/* Node Type Buttons - Icon-only for maximum compactness */}
          <div className="flex items-center gap-1">
            {nodeTypeGroups.map((group) => {
              const integrations = getFilteredIntegrationsForGroup(group);
              const totalIntegrations = getIntegrationsForGroup(group);
              const Icon = group.icon;
              
              if (totalIntegrations.length === 0) return null;

              return (
                <Popover 
                  key={group.id} 
                  open={openPopover === group.id} 
                  onOpenChange={(open) => setOpenPopover(open ? group.id : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`relative h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
                        openPopover === group.id 
                          ? 'bg-primary/10 scale-110 shadow-md' 
                          : 'hover:bg-accent hover:scale-105'
                      }`}
                      title={`${group.label} (${totalIntegrations.length} integrations)`}
                    >
                      <Icon 
                        className="h-4 w-4" 
                        style={{ color: group.color }}
                      />
                      {/* Integration count badge */}
                      <span 
                        className="absolute -top-1 -right-1 h-4 w-4 text-xs font-medium text-white rounded-full flex items-center justify-center"
                        style={{ backgroundColor: group.color }}
                      >
                        {totalIntegrations.length}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    side="top" 
                    align="start" 
                     className="w-80 p-0 mb-2"
                     sideOffset={12}
                   >
                     <div className="p-3 border-b">
                       <h4 className="font-semibold text-sm flex items-center gap-2">
                         <Icon className="h-4 w-4" style={{ color: group.color }} />
                         {group.label}
                       </h4>
                       <p className="text-xs text-muted-foreground mt-1">
                         {integrations.length} of {totalIntegrations.length} integration{totalIntegrations.length !== 1 ? 's' : ''}
                         {searchTerm && integrations.length !== totalIntegrations.length && ' (filtered)'}
                       </p>
                     </div>
                     <div className="max-h-64 overflow-y-auto">
                       <div className="p-2 space-y-1 max-h-60">
                         {integrations.length > 0 ? (
                           integrations.map((integration) => (
                             <NodeItem key={integration.id} integration={integration} />
                           ))
                         ) : (
                           <div className="text-center py-6 text-muted-foreground">
                             <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                             <p className="text-sm font-medium">No integrations found</p>
                             <p className="text-xs">Try a different search term</p>
                           </div>
                         )}
                       </div>
                     </div>
                  </PopoverContent>
                </Popover>
              );
            })}
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-border" />

          {/* Quick Help */}
          <div className="text-xs text-muted-foreground font-medium">
            Click to add
          </div>
        </div>
      </Card>
    </div>
  );
}