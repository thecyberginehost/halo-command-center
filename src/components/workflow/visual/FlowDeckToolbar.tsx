import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Database, 
  Mail, 
  Calendar, 
  FileText,
  Settings,
  GitBranch,
  Plus
} from 'lucide-react';
import { IntegrationNode } from '@/types/integrations';
import { allIntegrations, integrationsByCategory } from '@/lib/integrations';

interface FlowDeckToolbarProps {
  onAddNode: (integration: IntegrationNode, position: { x: number; y: number }) => void;
  onChatToggle?: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  viewport: { x: number; y: number; zoom: number };
}

const categoryIcons = {
  triggers: Zap,
  communication: Mail,
  crm: FileText,
  database: Database,
  ai: Sparkles,
  productivity: Calendar,
  logic: GitBranch,
  data_transform: Settings,
  webhook: Zap,
  file_storage: FileText,
  analytics: FileText,
  payment: FileText,
  developer_tools: Settings,
  flow_control: GitBranch,
  masp_tools: Settings,
  ecommerce: FileText,
  social_media: FileText,
  marketing: FileText,
  cloud: FileText,
  business: FileText,
};

export function FlowDeckToolbar({ 
  onAddNode, 
  onChatToggle, 
  canvasRef, 
  viewport 
}: FlowDeckToolbarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('triggers');
  const [isExpanded, setIsExpanded] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const filteredIntegrations = React.useMemo(() => {
    const categoryIntegrations = integrationsByCategory[selectedCategory as keyof typeof integrationsByCategory] || [];
    
    if (!searchTerm) return categoryIntegrations;
    
    return categoryIntegrations.filter(integration =>
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedCategory, searchTerm]);

  const handleAddNode = (integration: IntegrationNode) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    // Add node at center of visible area
    const position = {
      x: (canvasRect.width / 2 - viewport.x) / viewport.zoom,
      y: (canvasRect.height / 2 - viewport.y) / viewport.zoom
    };

    onAddNode(integration, position);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      triggers: '#10B981',
      communication: '#3B82F6',
      crm: '#8B5CF6',
      database: '#F59E0B',
      ai: '#EC4899',
      productivity: '#06B6D4',
      logic: '#84CC16',
      data_transform: '#6366F1',
      webhook: '#EF4444',
      file_storage: '#14B8A6',
      analytics: '#F97316',
      payment: '#22C55E',
      developer_tools: '#6B7280',
      flow_control: '#A855F7',
      masp_tools: '#DC2626',
      ecommerce: '#059669',
      social_media: '#7C3AED',
      marketing: '#EA580C',
      cloud: '#0891B2',
      business: '#9333EA',
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  return (
    <div 
      ref={toolbarRef}
      className={`
        fixed bottom-0 left-0 right-0 z-30 
        bg-background/95 backdrop-blur-lg border-t border-border/50
        transition-all duration-300 ease-out
        ${isExpanded ? 'h-80' : 'h-16'}
      `}
    >
      {/* Toolbar Header */}
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
            <span className="ml-2">Flow Deck</span>
          </Button>

          {!isExpanded && (
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {filteredIntegrations.length} cards available
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onChatToggle && (
            <Button 
              onClick={onChatToggle}
              variant="outline"
              size="sm"
              className="bg-primary/10 hover:bg-primary/20 border-primary/20"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
          )}
          
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 h-64">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full">
            {/* Category Tabs */}
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid grid-cols-6 gap-1 h-auto p-1 bg-muted/50">
                {Object.keys(integrationsByCategory).slice(0, 6).map(category => {
                  const Icon = categoryIcons[category as keyof typeof categoryIcons] || Settings;
                  return (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="flex flex-col items-center p-2 text-xs"
                      style={{ 
                        borderBottom: selectedCategory === category 
                          ? `2px solid ${getCategoryColor(category)}` 
                          : 'none' 
                      }}
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      {category.replace('_', ' ')}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Search */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            {/* Integration Cards */}
            <div className="h-48">
              {Object.keys(integrationsByCategory).map(category => (
                <TabsContent key={category} value={category} className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="grid grid-cols-6 gap-3 pr-4">
                      {filteredIntegrations.map(integration => {
                        const Icon = integration.icon || Zap;
                        return (
                          <div
                            key={integration.id}
                            onClick={() => handleAddNode(integration)}
                            className="
                              group cursor-pointer p-3 rounded-lg border border-border/50 
                              bg-card/50 hover:bg-card hover:border-primary/50 
                              transition-all duration-200 hover:scale-105 hover:shadow-lg
                              flex flex-col items-center text-center space-y-2
                            "
                            style={{
                              borderLeftColor: integration.color,
                              borderLeftWidth: '3px',
                            }}
                          >
                            <div 
                              className="p-2 rounded-lg flex items-center justify-center"
                              style={{ 
                                backgroundColor: integration.color + '20',
                                border: `1px solid ${integration.color}40`
                              }}
                            >
                              <Icon 
                                className="h-5 w-5" 
                                style={{ color: integration.color }}
                              />
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-xs text-foreground truncate w-full">
                                {integration.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {integration.description}
                              </p>
                            </div>

                            <Badge 
                              variant="outline" 
                              className="text-xs px-1 py-0"
                              style={{
                                borderColor: integration.color + '40',
                                color: integration.color,
                              }}
                            >
                              {integration.type}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                    
                    {filteredIntegrations.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <Search className="h-8 w-8 mb-2" />
                        <p className="text-sm">No integrations found</p>
                        <p className="text-xs">Try adjusting your search or category</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      )}
    </div>
  );
}