import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Zap, Send, Database, FileText, Brain, BarChart, CreditCard, Code, GitBranch, Bot, Sparkles } from 'lucide-react';
import { IntegrationNode, IntegrationCategory } from '@/types/integrations';
import { integrationsByCategory } from '@/lib/integrations';

interface BottomNodeToolbarProps {
  onAddNode: (integration: IntegrationNode, position: { x: number; y: number }) => void;
  onChatToggle?: () => void;
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

export function BottomNodeToolbar({ onAddNode, onChatToggle }: BottomNodeToolbarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
  const handleNodeClick = (integration: IntegrationNode, event?: React.MouseEvent) => {
    console.log('Node clicked:', integration.name);
    console.log('Current selectedCategory:', selectedCategory);
    
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    onAddNode(integration, { x: 100, y: 100 }); // Default position
    console.log('Node added, keeping category open');
    // Keep category open so users can add multiple nodes quickly
  };

  const NodeItem = ({ integration }: { integration: IntegrationNode }) => {
    const Icon = integration.icon;
    
    return (
      <div
        className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors border hover:border-primary/20"
        onClick={(e) => handleNodeClick(integration, e)}
        data-node-item
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
      {/* Search Results or Category Content - Above everything */}
      {(hasSearchResults || selectedCategory) && (
        <Card className="mb-2 w-80 max-h-80 border shadow-xl bg-background">
          <div className="p-3 border-b">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              {hasSearchResults ? (
                <>
                  <Search className="h-4 w-4" />
                  Search Results
                </>
              ) : selectedCategory ? (
                <>
                  {(() => {
                    const group = nodeTypeGroups.find(g => g.id === selectedCategory);
                    const Icon = group?.icon || Search;
                    return <Icon className="h-4 w-4" style={{ color: group?.color }} />;
                  })()}
                  {nodeTypeGroups.find(g => g.id === selectedCategory)?.label}
                </>
              ) : null}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {hasSearchResults 
                ? `${globalSearchResults.length} integration${globalSearchResults.length !== 1 ? 's' : ''} found`
                : selectedCategory 
                  ? `Click to add multiple nodes`
                  : ''
              }
            </p>
            {selectedCategory && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedCategory(null)}
                className="mt-2 h-6 px-2 text-xs"
              >
                Close
              </Button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            <div className="p-2 space-y-1">
              {hasSearchResults 
                ? globalSearchResults.map((integration) => (
                    <NodeItem key={integration.id} integration={integration} />
                  ))
                : selectedCategory 
                  ? (() => {
                      const group = nodeTypeGroups.find(g => g.id === selectedCategory);
                      const integrations = group ? getFilteredIntegrationsForGroup(group) : [];
                      return integrations.map((integration) => (
                        <NodeItem key={integration.id} integration={integration} />
                      ));
                    })()
                : null
              }
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
                <Button
                  key={group.id}
                  variant="ghost"
                  size="sm"
                  className={`relative h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
                    selectedCategory === group.id
                      ? 'bg-primary/10 scale-110 shadow-md' 
                      : 'hover:bg-accent hover:scale-105'
                  }`}
                  title={`${group.label} (${totalIntegrations.length} integrations)`}
                  onClick={() => setSelectedCategory(selectedCategory === group.id ? null : group.id)}
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
              );
            })}
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-border" />

          {/* Resonant Directive AI Assistant */}
          {onChatToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onChatToggle}
              className="relative h-8 px-3 bg-gradient-to-r from-halo-primary/10 to-halo-accent/10 hover:from-halo-primary/20 hover:to-halo-accent/20 border border-halo-primary/20 hover:border-halo-primary/30 rounded-lg transition-all duration-200"
              title="Open Resonant Directive AI Assistant"
            >
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <Bot className="h-3.5 w-3.5 text-halo-primary" />
                  <Sparkles className="h-2 w-2 text-halo-accent absolute -top-0.5 -right-0.5 animate-pulse" />
                </div>
                <span className="text-xs font-medium text-halo-text">AI</span>
              </div>
            </Button>
          )}

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