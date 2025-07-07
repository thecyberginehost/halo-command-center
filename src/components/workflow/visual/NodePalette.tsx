import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Zap, Send, Database, FileText, Brain, BarChart, CreditCard } from 'lucide-react';
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

  const NodeItem = ({ integration }: { integration: IntegrationNode }) => {
    const Icon = integration.icon;
    
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, integration)}
        className="flex items-center space-x-3 p-3 border rounded-lg cursor-grab hover:bg-accent/50 transition-colors"
        onClick={() => onAddNode(integration, { x: 100, y: 100 })}
      >
        <div 
          className="p-2 rounded flex items-center justify-center"
          style={{ backgroundColor: integration.color + '20' }}
        >
          {Icon && (
            <Icon 
              className="h-4 w-4" 
              style={{ color: integration.color }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground">{integration.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">
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

  return (
    <Card className="w-80 h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg mb-3">Node Library</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <Tabs defaultValue="communication" className="p-4">
          <TabsList className="grid grid-cols-2 gap-1 h-auto">
            {Object.entries(categoryLabels).map(([category, label]) => {
              const Icon = categoryIcons[category as IntegrationCategory];
              const count = integrationsByCategory[category as IntegrationCategory]?.length || 0;
              
              if (count === 0) return null;
              
              return (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="flex flex-col gap-1 h-auto py-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(categoryLabels).map(([category, label]) => {
            const integrations = filteredIntegrations(category as IntegrationCategory);
            
            if (integrations.length === 0) return null;

            return (
              <TabsContent key={category} value={category} className="mt-4">
                <div className="space-y-2">
                  {integrations.map((integration) => (
                    <NodeItem key={integration.id} integration={integration} />
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </ScrollArea>
    </Card>
  );
}