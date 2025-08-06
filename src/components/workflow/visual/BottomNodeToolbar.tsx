import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IntegrationNode, IntegrationCategory } from '@/types/integrations';
import { NodeRegistryEntry } from '@/types/haloNode';
import { integrationsByCategory } from '@/lib/integrations';
import nodeRegistry from '@/nodeRegistry';
import { NodeSearchInput } from './NodeSearchInput';
import { NodeCategoryPanel } from './NodeCategoryPanel';
import { CategoryButton } from './CategoryButton';
import { AIAssistantButton } from './AIAssistantButton';
import { nodeTypeGroups } from './nodeTypeGroups';
import { ChevronUp, Plus } from 'lucide-react';

interface BottomNodeToolbarProps {
  onAddNode: (integration: IntegrationNode, position: { x: number; y: number }) => void;
  onAddHaloNode?: (node: NodeRegistryEntry, position: { x: number; y: number }) => void;
  onChatToggle?: () => void;
}

export function BottomNodeToolbar({ onAddNode, onAddHaloNode, onChatToggle }: BottomNodeToolbarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Handle integration node clicks
  const handleIntegrationClick = (integration: IntegrationNode, event?: React.MouseEvent) => {
    console.log('Integration clicked:', integration.name);
    
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    onAddNode(integration, { x: 100, y: 100 });
    console.log('Integration node added');
  };

  // Handle halo node clicks
  const handleHaloNodeClick = (node: NodeRegistryEntry, event?: React.MouseEvent) => {
    console.log('Halo node clicked:', node.displayName);
    
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (onAddHaloNode) {
      onAddHaloNode(node, { x: 100, y: 100 });
      console.log('Halo node added');
    }
  };

  // Get all available integrations and nodes
  const globalSearchResults = getGlobalSearchResults();
  const filteredHaloNodes = nodeRegistry.filter(node =>
    node.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedGroup = selectedCategory ? nodeTypeGroups.find(g => g.id === selectedCategory) : null;
  const categoryIntegrations = selectedGroup ? getFilteredIntegrationsForGroup(selectedGroup) : [];
  const categoryInfo = selectedGroup ? {
    label: selectedGroup.label,
    icon: selectedGroup.icon,
    color: selectedGroup.color
  } : undefined;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center">
      {/* Expanded Panel - Search Results or Category Content */}
      {isExpanded && (
        <Card className="bg-background/95 backdrop-blur-sm border shadow-xl mb-4 w-96 max-h-80 overflow-hidden">
          <div className="p-4">
            {/* Search Results */}
            {searchTerm && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Search Results</h3>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {/* Integration Results */}
                  {globalSearchResults.map((integration) => (
                    <button
                      key={integration.id}
                      onClick={(e) => handleIntegrationClick(integration, e)}
                      className="w-full text-left p-2 rounded hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <integration.icon className="h-4 w-4" style={{ color: integration.color }} />
                        <div>
                          <div className="text-sm font-medium">{integration.name}</div>
                          <div className="text-xs text-muted-foreground">{integration.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {/* Halo Node Results */}
                  {filteredHaloNodes.map((node) => (
                    <button
                      key={node.name}
                      onClick={(e) => handleHaloNodeClick(node, e)}
                      className="w-full text-left p-2 rounded hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-primary/20 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">N</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{node.displayName}</div>
                          <div className="text-xs text-muted-foreground">{node.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {globalSearchResults.length === 0 && filteredHaloNodes.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No nodes found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Category Results */}
            {selectedCategory && categoryIntegrations.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {categoryInfo && <categoryInfo.icon className="h-4 w-4" style={{ color: categoryInfo.color }} />}
                  {categoryInfo?.label}
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {categoryIntegrations.map((integration) => (
                    <button
                      key={integration.id}
                      onClick={(e) => handleIntegrationClick(integration, e)}
                      className="w-full text-left p-2 rounded hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <integration.icon className="h-4 w-4" style={{ color: integration.color }} />
                        <div>
                          <div className="text-sm font-medium">{integration.name}</div>
                          <div className="text-xs text-muted-foreground">{integration.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Default view - show all halo nodes when no search/category */}
            {!searchTerm && !selectedCategory && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Available Nodes</h3>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {nodeRegistry.slice(0, 10).map((node) => (
                    <button
                      key={node.name}
                      onClick={(e) => handleHaloNodeClick(node, e)}
                      className="w-full text-left p-2 rounded hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-primary/20 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">N</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{node.displayName}</div>
                          <div className="text-xs text-muted-foreground">{node.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {nodeRegistry.length > 10 && (
                    <div className="text-center text-muted-foreground text-xs py-2">
                      And {nodeRegistry.length - 10} more nodes...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Main Toolbar - Compact with expand button */}
      <Card className="bg-background/95 backdrop-blur-sm border shadow-xl">
        <div className="flex items-center gap-2 p-3">
          {/* Expand/Collapse Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            <ChevronUp className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>

          {/* Search Input - only show when expanded */}
          {isExpanded && (
            <>
              <div className="w-px h-6 bg-border" />
              <NodeSearchInput 
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </>
          )}

          {/* Separator */}
          <div className="w-px h-6 bg-border" />

          {/* Node Type Buttons - Icon-only for maximum compactness */}
          <div className="flex items-center gap-1">
            {nodeTypeGroups.map((group) => {
              const totalIntegrations = getIntegrationsForGroup(group);

              return (
                <CategoryButton
                  key={group.id}
                  id={group.id}
                  label={group.label}
                  icon={group.icon}
                  color={group.color}
                  totalIntegrations={totalIntegrations.length}
                  isSelected={selectedCategory === group.id}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === group.id ? null : group.id);
                    setIsExpanded(true);
                  }}
                />
              );
            })}
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-border" />

          {/* Resonant Directive AI Assistant */}
          {onChatToggle && (
            <AIAssistantButton onChatToggle={onChatToggle} />
          )}

          {/* Separator */}
          <div className="w-px h-6 bg-border" />

          {/* Quick Help */}
          <div className="text-xs text-muted-foreground font-medium">
            {isExpanded ? 'Click nodes above' : 'Expand to add nodes'}
          </div>
        </div>
      </Card>
    </div>
  );
}