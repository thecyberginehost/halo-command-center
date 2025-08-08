import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { 
  Copy, 
  Trash2, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw, 
  Eye,
  Edit,
  Link,
  TestTube
} from 'lucide-react';

interface NodeContextMenuProps {
  children: React.ReactNode;
  node: any;
  onConfigure: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onTest?: () => void;
  onEnable?: () => void;
  onDisable?: () => void;
  onViewDetails?: () => void;
}

export function NodeContextMenu({ 
  children, 
  node,
  onConfigure,
  onDuplicate, 
  onDelete,
  onTest,
  onEnable,
  onDisable,
  onViewDetails
}: NodeContextMenuProps) {
  const isEnabled = node.data.config?.enabled !== false;
  const isConfigured = node.data.isConfigured;
  
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onConfigure} className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configure
        </ContextMenuItem>
        
        {isConfigured && (
          <ContextMenuItem onClick={onTest} className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Test Connection
          </ContextMenuItem>
        )}
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onViewDetails} className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          View Details
        </ContextMenuItem>
        
        {isEnabled ? (
          <ContextMenuItem onClick={onDisable} className="flex items-center gap-2">
            <Pause className="h-4 w-4" />
            Disable
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={onEnable} className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Enable
          </ContextMenuItem>
        )}
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onDuplicate} className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          Duplicate
        </ContextMenuItem>
        
        <ContextMenuItem 
          onClick={onDelete} 
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}