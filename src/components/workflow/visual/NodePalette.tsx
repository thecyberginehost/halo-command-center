import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Zap, Send, Database, FileText, Brain, BarChart, CreditCard, Code, Plus } from 'lucide-react';
import { IntegrationNode, IntegrationCategory } from '@/types/integrations';
import { integrationsByCategory } from '@/lib/integrations';

interface NodePaletteProps {
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

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIntegrations = (category: IntegrationCategory) => {
    const integrations = integrationsByCategory[category] || [];
    return integrations.filter(integration =>
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleDragStart = (e: React.DragEvent, integration: IntegrationNode) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(integration));
    e.dataTransfer.effectAllowed = 'move';
  };

  const NodeCard = ({ integration }: { integration: IntegrationNode }) => {
    const Icon = integration.icon;
    
    return (
      <Card
        draggable
        onDragStart={(e) => handleDragStart(e, integration)}
        className="group relative p-3 cursor-grab hover:shadow-md transition-all duration-200 hover:scale-[1.02] border hover:border-primary/20 bg-card/50 hover:bg-card animate-fade-in"
        onClick={() => {
          onAddNode(integration, { x: 100, y: 100 });
        }}
      >
        <div className="flex flex-col items-center text-center space-y-2">
          {/* Icon with background */}
          <div 
            className="p-2.5 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow"
            style={{ 
              backgroundColor: integration.color + '15',
              border: `1px solid ${integration.color}20`
            }}
          >
            {Icon && (
              <Icon 
                className="h-5 w-5" 
                style={{ color: integration.color }}
              />
            )}
          </div>

          {/* Node name */}
          <h4 className="font-medium text-sm text-foreground leading-tight">
            {integration.name}
          </h4>

          {/* Type badge */}
          <Badge 
            variant={integration.type === 'trigger' ? 'default' : 'secondary'}
            className="text-xs px-2 py-0.5"
          >
            {integration.type}
          </Badge>

          {/* Hover overlay with plus icon */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Plus className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>
    );
  };

  // Get categories with integrations
  const availableCategories = Object.entries(categoryLabels).filter(([category]) => {
    const count = integrationsByCategory[category as IntegrationCategory]?.length || 0;
    return count > 0;
  });

  return (
    <Card className="w-80 h-full flex flex-col bg-background/95 backdrop-blur-sm border shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg text-foreground">Node Library</h3>
          <Badge variant="outline" className="text-xs">
            {Object.values(integrationsByCategory).flat().length} nodes
          </Badge>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <Tabs defaultValue={availableCategories[0]?.[0]} className="p-4">
          {/* Category tabs - compact grid */}
          <TabsList className="grid grid-cols-3 gap-1 h-auto mb-4 bg-muted/50">
            {availableCategories.slice(0, 6).map(([category, label]) => {
              const Icon = categoryIcons[category as IntegrationCategory];
              const count = integrationsByCategory[category as IntegrationCategory]?.length || 0;
              
              return (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="flex flex-col gap-1 h-auto py-2 px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium truncate">{label}</span>
                  <span className="text-xs text-muted-foreground">({count})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Additional categories if any */}
          {availableCategories.length > 6 && (
            <TabsList className="grid grid-cols-3 gap-1 h-auto mb-4 bg-muted/50">
              {availableCategories.slice(6).map(([category, label]) => {
                const Icon = categoryIcons[category as IntegrationCategory];
                const count = integrationsByCategory[category as IntegrationCategory]?.length || 0;
                
                return (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="flex flex-col gap-1 h-auto py-2 px-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium truncate">{label}</span>
                    <span className="text-xs text-muted-foreground">({count})</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          )}

          {/* Node grids for each category */}
          {availableCategories.map(([category, label]) => {
            const integrations = filteredIntegrations(category as IntegrationCategory);
            
            if (integrations.length === 0) return null;

            return (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-2 gap-3">
                  {integrations.map((integration) => (
                    <NodeCard key={integration.id} integration={integration} />
                  ))}
                </div>
                
                {/* Empty state for search */}
                {searchTerm && integrations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No integrations found in {label}</p>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </ScrollArea>

      {/* Footer tip */}
      <div className="p-3 border-t bg-muted/20">
        <p className="text-xs text-muted-foreground text-center">
          Drag & drop or click to add nodes
        </p>
      </div>
    </Card>
  );
}