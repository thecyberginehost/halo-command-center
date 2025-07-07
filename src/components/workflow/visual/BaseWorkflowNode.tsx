import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, AlertCircle, CheckCircle2 } from 'lucide-react';
import { VisualWorkflowNode } from '@/types/visualWorkflow';

interface BaseWorkflowNodeProps extends NodeProps<VisualWorkflowNode> {
  onConfigClick?: (nodeId: string) => void;
}

export const BaseWorkflowNode = memo(({ 
  data, 
  id, 
  selected, 
  onConfigClick 
}: BaseWorkflowNodeProps) => {
  const { integration, config, label, isConfigured, hasError, errorMessage } = data;
  const Icon = integration.icon;

  const getStatusColor = () => {
    if (hasError) return 'text-destructive';
    if (isConfigured) return 'text-success';
    return 'text-muted-foreground';
  };

  const getStatusIcon = () => {
    if (hasError) return <AlertCircle className="h-4 w-4" />;
    if (isConfigured) return <CheckCircle2 className="h-4 w-4" />;
    return <Settings className="h-4 w-4" />;
  };

  const nodeStyle = {
    borderColor: selected ? 'hsl(var(--primary))' : hasError ? 'hsl(var(--destructive))' : 'hsl(var(--border))',
    borderWidth: '2px',
    backgroundColor: 'hsl(var(--card))',
  };

  return (
    <Card 
      className="min-w-[200px] shadow-lg transition-all duration-200 hover:shadow-xl"
      style={nodeStyle}
    >
      <div className="p-4">
        {/* Node Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div 
              className="p-1 rounded flex items-center justify-center"
              style={{ backgroundColor: integration.color + '20' }}
            >
              {Icon && (
                <Icon 
                  className="h-4 w-4" 
                  style={{ color: integration.color }}
                />
              )}
            </div>
            <span className="font-medium text-sm text-foreground">{label}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onConfigClick?.(id)}
            className={`h-6 w-6 p-0 ${getStatusColor()}`}
          >
            {getStatusIcon()}
          </Button>
        </div>

        {/* Node Description */}
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {integration.description}
        </p>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge 
            variant={integration.type === 'trigger' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {integration.type}
          </Badge>
          {hasError && (
            <Badge variant="destructive" className="text-xs">
              Error
            </Badge>
          )}
        </div>

        {/* Error Message */}
        {hasError && errorMessage && (
          <p className="text-xs text-destructive mt-2">{errorMessage}</p>
        )}
      </div>

      {/* Input Handle */}
      {integration.type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-primary border-2 border-background"
        />
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
    </Card>
  );
});

BaseWorkflowNode.displayName = 'BaseWorkflowNode';