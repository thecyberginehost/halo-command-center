import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Zap, Send, Database, FileText, Brain, BarChart, CreditCard, Code, GitBranch, RepeatIcon, Combine, Plus } from 'lucide-react';
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

// Node type groupings for better organization
const nodeTypeGroups = [
  {
    id: 'triggers',
    label: 'Triggers',
    icon: Zap,
    color: '#10B981',
    categories: ['triggers']
  },
  {
    id: 'actions',
    label: 'Actions',
    icon: Send,
    color: '#3B82F6',
    categories: ['communication', 'crm', 'productivity', 'payment', 'file_storage']
  },
  {
    id: 'data',
    label: 'Data',
    icon: Database,
    color: '#8B5CF6',
    categories: ['database']
  },
  {
    id: 'flow_control',
    label: 'Flow Control',
    icon: GitBranch,
    color: '#F59E0B',
    categories: ['webhook'] // This includes our router, iterator, aggregator
  },
  {
    id: 'ai',
    label: 'AI & ML',
    icon: Brain,
    color: '#EC4899',
    categories: ['ai']
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart,
    color: '#06B6D4',
    categories: ['analytics']
  },
  {
    id: 'developer',
    label: 'Developer',
    icon: Code,
    color: '#64748B',
    categories: ['developer_tools']
  }
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

  const handleDragStart = (e: React.DragEvent, integration: IntegrationNode) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(integration));
    e.dataTransfer.effectAllowed = 'move';
  };

  const NodeItem = ({ integration }: { integration: IntegrationNode }) => {
    const Icon = integration.icon;
    
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, integration)}
        className="flex items-center space-x-3 p-2 rounded-lg cursor-grab hover:bg-accent/50 transition-colors border hover:border-primary/20"
        onClick={() => {
          onAddNode(integration, { x: 100, y: 100 });
          setOpenPopover(null);
          setSearchTerm(''); // Clear search after adding
        }}
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
    <Card className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-background/95 backdrop-blur-sm border shadow-lg max-w-4xl">
      <div className="flex items-center gap-2 p-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-48 h-8 text-sm"
          />
          
          {/* Global Search Results Dropdown */}
          {hasSearchResults && (
            <Card className="absolute bottom-10 left-0 w-72 max-h-80 z-50 border shadow-lg">
              <div className="p-2 border-b">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Search className="h-3.5 w-3.5" />
                  Search Results
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {globalSearchResults.length} integration{globalSearchResults.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <ScrollArea className="max-h-64">
                <div className="p-1 space-y-1">
                  {globalSearchResults.map((integration) => (
                    <NodeItem key={integration.id} integration={integration} />
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>

        {/* Node Type Buttons - More compact */}
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
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-1.5 h-8 px-2.5 text-xs ${
                      openPopover === group.id ? 'bg-primary/10 border-primary/20' : ''
                    }`}
                    style={{ 
                      borderColor: openPopover === group.id ? group.color + '40' : undefined
                    }}
                  >
                    <Icon 
                      className="h-3.5 w-3.5" 
                      style={{ color: group.color }}
                    />
                    <span className="font-medium">{group.label}</span>
                    <Plus className="h-3 w-3 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  side="top" 
                  align="start" 
                  className="w-80 p-0 mb-2"
                  sideOffset={8}
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
                  <ScrollArea className="max-h-72">
                    <div className="p-2 space-y-1">
                      {integrations.length > 0 ? (
                        integrations.map((integration) => (
                          <NodeItem key={integration.id} integration={integration} />
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No integrations found</p>
                          <p className="text-xs">Try a different search term</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </div>
    </Card>
  );
}