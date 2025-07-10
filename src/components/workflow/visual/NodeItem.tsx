import { Badge } from '@/components/ui/badge';
import { IntegrationNode } from '@/types/integrations';

interface NodeItemProps {
  integration: IntegrationNode;
  onNodeClick: (integration: IntegrationNode, event?: React.MouseEvent) => void;
}

export function NodeItem({ integration, onNodeClick }: NodeItemProps) {
  const Icon = integration.icon;
  
  return (
    <div
      className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors border hover:border-primary/20"
      onClick={(e) => onNodeClick(integration, e)}
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
}