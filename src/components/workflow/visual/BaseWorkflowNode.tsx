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
          className="w-20 h-20 shadow-md transition-all duration-200 hover:shadow-lg border-2 rounded-2xl"
          style={nodeStyle}
        >
          <div className="h-full flex flex-col items-center justify-center p-2">
            {/* Main Icon - Large and centered */}
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center mb-1 shadow-sm"
              style={{ backgroundColor: nodeColor }}
            >
              {Icon ? (
                <Icon 
                  className="h-5 w-5 text-white" 
                />
              ) : (
                <div 
                  className="h-5 w-5 rounded-lg bg-white/30" 
                />
              )}
            </div>
            
            {/* Label */}
            <span className="font-medium text-xs text-foreground text-center leading-tight truncate w-full">
              {integration.name || label}
            </span>
            
            {/* Status indicator */}
            <div className="absolute top-1 right-1">
              <div className={`w-2 h-2 rounded-full ${
                hasError ? 'bg-destructive' : 
                isConfigured ? 'bg-green-500' : 'bg-muted-foreground/30'
              }`} />
            </div>

            {/* Configuration button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onConfigClick?.(id);
              }}
              className="absolute bottom-1 right-1 h-3 w-3 p-0 opacity-0 hover:opacity-100 transition-opacity"
            >
              <Settings className="h-2 w-2" />
            </Button>
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