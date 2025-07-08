import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, AlertCircle, CheckCircle2 } from 'lucide-react';
import { VisualWorkflowNode } from '@/types/visualWorkflow';
import { NodeContextMenu } from './NodeContextMenu';

interface BaseWorkflowNodeProps extends NodeProps<VisualWorkflowNode> {
  onConfigClick?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

export const BaseWorkflowNode = memo(({ 
  data, 
  id, 
  selected, 
  onConfigClick,
  onDuplicate,
  onDelete 
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
    <NodeContextMenu
      onDuplicate={() => onDuplicate?.(id)}
      onDelete={() => onDelete?.(id)}
    >
      <div className="relative">
        <Card 
          className="min-w-[100px] max-w-[130px] shadow-md transition-all duration-200 hover:shadow-lg"
          style={nodeStyle}
        >
          <div className="p-1.5">
            {/* Node Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1">
                <div 
                  className="p-1 rounded-sm flex items-center justify-center"
                  style={{ backgroundColor: integration.color + '20' }}
                >
                  {Icon && (
                    <Icon 
                      className="h-3 w-3" 
                      style={{ color: integration.color }}
                    />
                  )}
                </div>
                <span className="font-medium text-xs text-foreground truncate">{label}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onConfigClick?.(id)}
                className={`h-3 w-3 p-0 ${getStatusColor()}`}
              >
                {getStatusIcon()}
              </Button>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-center">
              <Badge 
                variant={integration.type === 'trigger' ? 'default' : 'secondary'}
                className="text-xs px-1 py-0"
              >
                {integration.type}
              </Badge>
              {hasError && (
                <Badge variant="destructive" className="text-xs ml-1 px-1 py-0">
                  Error
                </Badge>
              )}
            </div>

            {/* Error Message */}
            {hasError && errorMessage && (
              <p className="text-xs text-destructive mt-1 line-clamp-1">{errorMessage}</p>
            )}
          </div>
        </Card>

        {/* Input Handle */}
        {integration.type !== 'trigger' && (
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-primary border-2 border-background rounded-full hover:scale-125 transition-transform"
            style={{ left: -6 }}
          />
        )}

        {/* Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-primary border-2 border-background rounded-full hover:scale-125 transition-transform"
          style={{ right: -6 }}
        />
      </div>
    </NodeContextMenu>
  );
});

BaseWorkflowNode.displayName = 'BaseWorkflowNode';