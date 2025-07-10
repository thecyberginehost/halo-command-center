import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { IntegrationNode, IntegrationCategory } from '@/types/integrations';
import { integrationsByCategory } from '@/lib/integrations';
import { NodeSearchInput } from './NodeSearchInput';
import { NodeCategoryPanel } from './NodeCategoryPanel';
import { CategoryButton } from './CategoryButton';
import { AIAssistantButton } from './AIAssistantButton';
import { nodeTypeGroups } from './nodeTypeGroups';

interface BottomNodeToolbarProps {
  onAddNode: (integration: IntegrationNode, position: { x: number; y: number }) => void;
  onChatToggle?: () => void;
}

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

  const globalSearchResults = getGlobalSearchResults();
  
  const selectedGroup = selectedCategory ? nodeTypeGroups.find(g => g.id === selectedCategory) : null;
  const categoryIntegrations = selectedGroup ? getFilteredIntegrationsForGroup(selectedGroup) : [];
  const categoryInfo = selectedGroup ? {
    label: selectedGroup.label,
    icon: selectedGroup.icon,
    color: selectedGroup.color
  } : undefined;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center">
      {/* Search Results or Category Content - Above everything */}
      <NodeCategoryPanel
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        globalSearchResults={globalSearchResults}
        categoryIntegrations={categoryIntegrations}
        categoryInfo={categoryInfo}
        onNodeClick={handleNodeClick}
        onClose={() => setSelectedCategory(null)}
      />

      {/* Main Toolbar - Redesigned for maximum compactness */}
      <Card className="bg-background/95 backdrop-blur-sm border shadow-xl">
        <div className="flex items-center gap-2 p-3">
          {/* Search Input */}
          <NodeSearchInput 
            value={searchTerm}
            onChange={setSearchTerm}
          />

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
                  onClick={() => setSelectedCategory(selectedCategory === group.id ? null : group.id)}
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
            Click to add
          </div>
        </div>
      </Card>
    </div>
  );
}