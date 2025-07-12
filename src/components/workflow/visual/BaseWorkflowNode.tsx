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
  
  // Validate required properties
  if (!integration) {
    console.error('Node missing integration data:', id);
    return (
      <Card className="min-w-[90px] max-w-[110px] shadow-md border-destructive">
        <div className="p-2 text-center">
          <AlertCircle className="h-4 w-4 text-destructive mx-auto mb-1" />
          <span className="text-xs text-destructive">Invalid Node</span>
        </div>
      </Card>
    );
  }
  
  const Icon = integration.icon;
  const nodeColor = integration.color || '#6b7280'; // fallback color

  const getStatusColor = () => {
    if (hasError) return 'text-destructive';
    if (isConfigured) return 'text-success';
    return 'text-muted-foreground';
  };

  const getStatusIcon = () => {
    if (hasError) return <AlertCircle className="h-2 w-2" />;
    if (isConfigured) return <CheckCircle2 className="h-2 w-2" />;
    return <Settings className="h-2 w-2" />;
  };

  const nodeStyle = {
    borderColor: selected ? 'hsl(var(--primary))' : hasError ? 'hsl(var(--destructive))' : 'hsl(var(--border))',
    borderWidth: '2px',
    backgroundColor: 'hsl(var(--card))',
    minHeight: '60px',
    minWidth: '90px',
  };
  return (
    <NodeContextMenu
      onDuplicate={() => onDuplicate?.(id)}
      onDelete={() => onDelete?.(id)}
    >
      <div className="relative">
        <Card 
          className="min-w-[90px] max-w-[110px] shadow-md transition-all duration-200 hover:shadow-lg"
          style={nodeStyle}
        >
          <div className="p-1">
            {/* Node Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1 flex-1 min-w-0">
                <div 
                  className="p-0.5 rounded-sm flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: nodeColor + '20' }}
                >
                   {Icon ? (
                     <Icon 
                       className="h-2.5 w-2.5" 
                       style={{ color: nodeColor }}
                     />
                   ) : (
                     <div 
                       className="h-2.5 w-2.5 rounded" 
                       style={{ backgroundColor: nodeColor + '40' }}
                     />
                   )}
                </div>
                <span className="font-medium text-xs text-foreground truncate">{label}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfigClick?.(id);
                }}
                className={`h-2.5 w-2.5 p-0 flex-shrink-0 ${getStatusColor()}`}
              >
                {getStatusIcon()}
              </Button>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-center">
              <Badge 
                variant={integration.type === 'trigger' ? 'default' : 'secondary'}
                className="text-xs px-1 py-0 text-xs"
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