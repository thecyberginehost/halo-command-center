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
  console.log('=== NODE RENDER DEBUG ===');
  console.log('Node ID:', id);
  console.log('Node data:', data);
  console.log('Integration:', data.integration);
  console.log('Selected:', selected);
  
  const { integration, config, label, isConfigured, hasError, errorMessage } = data;
  const Icon = integration.icon;
  
  // Validate required properties
  if (!integration) {
    console.error('Node missing integration data:', id);
    return <div>Error: Missing integration</div>;
  }
  
  if (!Icon) {
    console.warn('Node missing icon:', id, integration);
  }
  
  console.log('Icon component:', Icon);
  console.log('Integration color:', integration.color);
  console.log('=== END NODE RENDER DEBUG ===');

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
  
  console.log('Node style applied:', nodeStyle);

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
                  style={{ backgroundColor: integration.color + '20' }}
                >
                   {Icon ? (
                     <Icon 
                       className="h-2.5 w-2.5" 
                       style={{ color: integration.color || 'currentColor' }}
                     />
                   ) : (
                     <div className="h-2.5 w-2.5 bg-muted rounded" />
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