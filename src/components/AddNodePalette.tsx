import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { nodeRegistry } from '../nodeRegistry';
import { NodeRegistryEntry } from '../types/haloNode';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';

interface AddNodePaletteProps {
  onSelect: (node: NodeRegistryEntry) => void;
  onAIAssistantClick?: () => void;
  className?: string;
}

const useTheme = () => {
  // Simple theme detection - you can replace this with your actual theme hook
  const [isDark, setIsDark] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return { isDark };
};

export function AddNodePalette({ onSelect, onAIAssistantClick, className = '' }: AddNodePaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { isDark } = useTheme();

  // Group nodes by category
  const nodesByGroup = React.useMemo(() => {
    const filtered = nodeRegistry.filter(node =>
      node.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped: Record<string, NodeRegistryEntry[]> = {};
    
    filtered.forEach(node => {
      node.group.forEach(groupName => {
        if (!grouped[groupName]) {
          grouped[groupName] = [];
        }
        grouped[groupName].push(node);
      });
    });

    return grouped;
  }, [searchTerm]);

  const categories = Object.keys(nodesByGroup).sort();

  const handleNodeClick = (node: NodeRegistryEntry) => {
    onSelect(node);
  };

  const handleDragStart = (e: React.DragEvent, node: NodeRegistryEntry) => {
    e.dataTransfer.setData('application/json', JSON.stringify(node));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className={`flex flex-col h-full bg-background border-r ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Add Node</h2>
        
        {/* AI Assistant Button */}
        {onAIAssistantClick && (
          <Button 
            onClick={onAIAssistantClick} 
            className="w-full mb-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Ask AI Assistant
          </Button>
        )}
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Node List */}
      <ScrollArea className="flex-1">
        {categories.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No nodes found matching "{searchTerm}"
          </div>
        ) : categories.length === 1 ? (
          // Single category - show nodes directly
          <div className="p-4 space-y-2">
            {nodesByGroup[categories[0]].map((node) => (
              <NodeCard
                key={node.name}
                node={node}
                isDark={isDark}
                onClick={() => handleNodeClick(node)}
                onDragStart={(e) => handleDragStart(e, node)}
              />
            ))}
          </div>
        ) : (
          // Multiple categories - show in tabs
          <Tabs defaultValue={categories[0]} className="h-full">
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
              {categories.slice(0, 2).map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((category) => (
              <TabsContent key={category} value={category} className="p-4 space-y-2 mt-0">
                {nodesByGroup[category].map((node) => (
                  <NodeCard
                    key={node.name}
                    node={node}
                    isDark={isDark}
                    onClick={() => handleNodeClick(node)}
                    onDragStart={(e) => handleDragStart(e, node)}
                  />
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </ScrollArea>

      {/* Footer tip */}
      <div className="p-4 border-t text-sm text-muted-foreground">
        Drag and drop nodes to add them to your workflow
      </div>
    </div>
  );
}

interface NodeCardProps {
  node: NodeRegistryEntry;
  isDark: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

function NodeCard({ node, isDark, onClick, onDragStart }: NodeCardProps) {
  const iconUrl = isDark && node.darkIconUrl ? node.darkIconUrl : node.iconUrl;

  return (
    <Card
      className="p-3 cursor-pointer hover:bg-accent transition-colors group border"
      onClick={onClick}
      draggable
      onDragStart={onDragStart}
    >
      <div className="flex items-center gap-3">
        {/* Node Icon */}
        <div 
          className="w-8 h-8 rounded flex items-center justify-center text-white"
          style={{ backgroundColor: node.defaults.color }}
        >
          {iconUrl ? (
            <img 
              src={iconUrl} 
              alt={node.displayName}
              className="w-5 h-5"
            />
          ) : (
            <div className="w-5 h-5 bg-white/20 rounded" />
          )}
        </div>

        {/* Node Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm truncate">{node.displayName}</h3>
            <Badge variant="secondary" className="text-xs">
              v{node.version}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {node.description}
          </p>
        </div>

        {/* Add indicator */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <span className="text-xs font-medium">+</span>
          </div>
        </div>
      </div>
    </Card>
  );
}