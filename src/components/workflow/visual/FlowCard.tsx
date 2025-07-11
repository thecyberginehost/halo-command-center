import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Settings, 
  AlertCircle, 
  CheckCircle2, 
  MoreHorizontal, 
  Copy, 
  Trash2, 
  Zap,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { VisualWorkflowNode } from '@/types/visualWorkflow';

interface FlowCardProps {
  node: VisualWorkflowNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onConfigClick: (nodeId: string) => void;
  onPositionChange: (nodeId: string, position: { x: number; y: number }) => void;
  onConnectionStart: (nodeId: string, handle: string, event: React.MouseEvent) => void;
  onConnectionEnd: (nodeId: string, handle: string) => void;
  onDuplicate: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  theme: 'blueprint' | 'circuit' | 'organic';
  zoomLevel: number;
}

export function FlowCard({
  node,
  isSelected,
  onSelect,
  onConfigClick,
  onPositionChange,
  onConnectionStart,
  onConnectionEnd,
  onDuplicate,
  onDelete,
  theme,
  zoomLevel
}: FlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  const { integration, config, label, isConfigured, hasError, errorMessage } = node.data;
  const Icon = integration.icon;

  // Card styling based on theme
  const getThemeStyles = () => {
    const baseStyles = "transition-all duration-300 transform-gpu";
    
    switch (theme) {
      case 'blueprint':
        return `${baseStyles} border-2 backdrop-blur-sm bg-gradient-to-br from-card/90 to-card/70 shadow-lg hover:shadow-xl`;
      case 'circuit':
        return `${baseStyles} border border-primary/30 bg-gradient-to-r from-card via-card/95 to-card shadow-md hover:shadow-lg`;
      case 'organic':
        return `${baseStyles} rounded-2xl border-0 bg-gradient-to-br from-card/95 to-background/80 shadow-md hover:shadow-xl`;
      default:
        return baseStyles;
    }
  };

  const getCardBorder = () => {
    if (isSelected) return 'border-primary shadow-primary/20';
    if (hasError) return 'border-destructive shadow-destructive/20';
    if (isHovered) return 'border-primary/50 shadow-primary/10';
    return 'border-border/50';
  };

  const getStatusColor = () => {
    if (hasError) return 'text-destructive';
    if (isConfigured) return 'text-green-500';
    return 'text-muted-foreground';
  };

  const getStatusIcon = () => {
    if (hasError) return <AlertCircle className="h-3 w-3" />;
    if (isConfigured) return <CheckCircle2 className="h-3 w-3" />;
    return <Settings className="h-3 w-3" />;
  };

  // Drag handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    });
    
    onSelect(node.id);
  }, [node.position, node.id, onSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    
    onPositionChange(node.id, newPosition);
  }, [isDragging, dragStart, node.id, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Connection handle events
  const handleConnectionStart = useCallback((handle: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onConnectionStart(node.id, handle, e);
  }, [node.id, onConnectionStart]);

  const handleConnectionEnd = useCallback((handle: string) => () => {
    onConnectionEnd(node.id, handle);
  }, [node.id, onConnectionEnd]);

  // Effects
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Scale based on zoom level for readability
  const cardScale = Math.max(0.8, Math.min(1.2, 1 / zoomLevel));

  return (
    <div
      ref={cardRef}
      className="absolute cursor-pointer select-none"
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: `scale(${cardScale})`,
        transformOrigin: 'center',
        zIndex: isSelected ? 100 : isHovered ? 50 : 10,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Connection Handles */}
      {integration.type !== 'trigger' && (
        <div
          className="absolute -left-3 top-1/2 w-6 h-6 bg-primary rounded-full border-2 border-background 
                     cursor-crosshair hover:scale-125 transition-transform flex items-center justify-center
                     shadow-lg hover:shadow-primary/50"
          style={{ transform: 'translateY(-50%)' }}
          onMouseDown={handleConnectionStart('input')}
          onMouseUp={handleConnectionEnd('input')}
        >
          <ArrowLeft className="h-3 w-3 text-primary-foreground" />
        </div>
      )}

      <div
        className="absolute -right-3 top-1/2 w-6 h-6 bg-primary rounded-full border-2 border-background 
                   cursor-crosshair hover:scale-125 transition-transform flex items-center justify-center
                   shadow-lg hover:shadow-primary/50"
        style={{ transform: 'translateY(-50%)' }}
        onMouseDown={handleConnectionStart('output')}
        onMouseUp={handleConnectionEnd('output')}
      >
        <ArrowRight className="h-3 w-3 text-primary-foreground" />
      </div>

      {/* Main Card */}
      <Card 
        className={`
          w-44 min-h-28 p-4 cursor-grab active:cursor-grabbing
          ${getThemeStyles()} ${getCardBorder()}
          ${isHovered ? 'scale-105' : 'scale-100'}
          ${isDragging ? 'rotate-1 scale-110' : ''}
        `}
        style={{
          backgroundColor: isHovered 
            ? `${integration.color}08` 
            : 'hsl(var(--card))',
          borderColor: isSelected 
            ? 'hsl(var(--primary))' 
            : hasError 
            ? 'hsl(var(--destructive))' 
            : integration.color + '40',
        }}
      >
        {/* Card Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div 
              className="p-2 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ 
                backgroundColor: integration.color + '20',
                border: `1px solid ${integration.color}40`
              }}
            >
              {Icon ? (
                <Icon 
                  className="h-5 w-5" 
                  style={{ color: integration.color }}
                />
              ) : (
                <Zap 
                  className="h-5 w-5"
                  style={{ color: integration.color }}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-foreground truncate">
                {label}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {integration.description || integration.name}
              </p>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-primary/10"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => onConfigClick(node.id)}>
                <Settings className="h-3 w-3 mr-2" />
                Configure
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(node.id)}>
                <Copy className="h-3 w-3 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(node.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Card Content */}
        <div className="space-y-2">
          {/* Type Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              variant={integration.type === 'trigger' ? 'default' : 'secondary'}
              className="text-xs px-2 py-0.5"
              style={{
                backgroundColor: integration.type === 'trigger' 
                  ? integration.color + '20' 
                  : 'hsl(var(--muted))',
                color: integration.type === 'trigger' 
                  ? integration.color 
                  : 'hsl(var(--muted-foreground))',
                border: `1px solid ${integration.color}30`
              }}
            >
              {integration.type}
            </Badge>

            {/* Status Indicator */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onConfigClick(node.id);
              }}
              className={`h-6 w-6 p-0 ${getStatusColor()}`}
            >
              {getStatusIcon()}
            </Button>
          </div>

          {/* Configuration Status */}
          {isConfigured && (
            <div className="text-xs text-green-600 bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
              Configured
            </div>
          )}

          {/* Error Message */}
          {hasError && errorMessage && (
            <div className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
              {errorMessage}
            </div>
          )}

          {/* Execution Count (if available) */}
          {config.executionCount && (
            <div className="text-xs text-muted-foreground">
              Executions: {config.executionCount}
            </div>
          )}
        </div>

        {/* Physics Animation Indicator */}
        {isDragging && (
          <div className="absolute -top-2 -left-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
        )}
      </Card>

      {/* Magnetic Snap Indicator */}
      {isHovered && (
        <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-lg pointer-events-none animate-pulse" />
      )}
    </div>
  );
}