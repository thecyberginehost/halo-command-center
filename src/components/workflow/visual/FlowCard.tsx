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

  // Card styling based on theme - Playing card inspired
  const getThemeStyles = () => {
    const baseStyles = "transition-all duration-300 transform-gpu rounded-xl";
    
    switch (theme) {
      case 'blueprint':
        return `${baseStyles} border-2 backdrop-blur-sm bg-gradient-to-br from-card/95 to-card/85 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)]`;
      case 'circuit':
        return `${baseStyles} border-2 border-primary/20 bg-gradient-to-br from-card/98 via-card/95 to-card/90 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]`;
      case 'organic':
        return `${baseStyles} rounded-2xl border-2 border-background/20 bg-gradient-to-br from-card/98 to-background/85 shadow-[0_6px_24px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.18)]`;
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

      {/* Main Card - Playing Card Style */}
      <Card 
        className={`
          w-48 h-32 p-3 cursor-grab active:cursor-grabbing relative overflow-hidden
          ${getThemeStyles()} ${getCardBorder()}
          ${isHovered ? 'scale-105 rotate-1' : 'scale-100'}
          ${isDragging ? 'rotate-3 scale-110' : ''}
        `}
        style={{
          backgroundColor: isHovered 
            ? `${integration.color}10` 
            : 'hsl(var(--card))',
          borderColor: isSelected 
            ? 'hsl(var(--primary))' 
            : hasError 
            ? 'hsl(var(--destructive))' 
            : integration.color + '30',
        }}
      >
        {/* Playing Card Corner Decorations */}
        <div 
          className="absolute top-1 left-1 flex flex-col items-center text-xs font-bold opacity-70"
          style={{ color: integration.color }}
        >
          <div className="w-3 h-3 flex items-center justify-center">
            {Icon && <Icon className="w-2 h-2" />}
          </div>
          <div className="text-[8px] mt-0.5 leading-none">
            {integration.type.substring(0, 1).toUpperCase()}
          </div>
        </div>
        
        <div 
          className="absolute bottom-1 right-1 flex flex-col items-center text-xs font-bold opacity-70 rotate-180"
          style={{ color: integration.color }}
        >
          <div className="w-3 h-3 flex items-center justify-center">
            {Icon && <Icon className="w-2 h-2" />}
          </div>
          <div className="text-[8px] mt-0.5 leading-none">
            {integration.type.substring(0, 1).toUpperCase()}
          </div>
        </div>

        {/* Card Suit/Category Badge */}
        <div className="absolute top-1 right-1">
          <Badge 
            variant="outline"
            className="text-[8px] px-1 py-0 h-4 border-0"
            style={{
              backgroundColor: integration.color + '20',
              color: integration.color,
            }}
          >
            {integration.category.split('_')[0].substring(0, 3).toUpperCase()}
          </Badge>
        </div>
        {/* Card Header - Centered like playing card */}
        <div className="flex flex-col items-center justify-center h-full pt-4 pb-2">
          {/* Main Icon - Larger and centered */}
          <div 
            className="p-2.5 rounded-xl flex items-center justify-center shadow-lg mb-2"
            style={{ 
              backgroundColor: integration.color + '15',
              border: `2px solid ${integration.color}30`,
              boxShadow: `0 4px 12px ${integration.color}20`
            }}
          >
            {Icon ? (
              <Icon 
                className="h-8 w-8" 
                style={{ color: integration.color }}
              />
            ) : (
              <Zap 
                className="h-8 w-8"
                style={{ color: integration.color }}
              />
            )}
          </div>
          
          {/* Card Title - Centered */}
          <div className="text-center">
            <h4 className="font-bold text-sm text-foreground truncate max-w-32">
              {label}
            </h4>
            <p className="text-xs text-muted-foreground truncate max-w-32">
              {integration.name}
            </p>
          </div>

          {/* Actions Menu - Subtle on hover */}
          <div className={`absolute top-2 right-6 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-primary/10 rounded-full"
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
        </div>

        {/* Card Footer - Status indicators */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center justify-between">
            {/* Status Indicator */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onConfigClick(node.id);
              }}
              className={`h-5 w-5 p-0 ${getStatusColor()} hover:scale-110 transition-transform`}
            >
              {getStatusIcon()}
            </Button>

            {/* Execution Count Badge */}
            {config.executionCount && (
              <Badge 
                variant="outline" 
                className="text-[10px] px-1 py-0 h-4 border-0"
                style={{
                  backgroundColor: integration.color + '15',
                  color: integration.color,
                }}
              >
                {config.executionCount}
              </Badge>
            )}
          </div>

          {/* Error/Success Status Bar */}
          {(hasError || isConfigured) && (
            <div className="mt-1">
              {hasError ? (
                <div className="w-full h-1 bg-destructive/20 rounded-full">
                  <div className="h-full bg-destructive rounded-full w-full animate-pulse" />
                </div>
              ) : isConfigured ? (
                <div className="w-full h-1 bg-green-500/20 rounded-full">
                  <div className="h-full bg-green-500 rounded-full w-full" />
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Physics Animation Sparkles */}
        {isDragging && (
          <>
            <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-1 h-1 bg-primary/70 rounded-full animate-pulse delay-100" />
            <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-primary/70 rounded-full animate-pulse delay-200" />
          </>
        )}
      </Card>

      {/* Playing Card Glow Effect */}
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none animate-pulse"
          style={{
            boxShadow: `0 0 20px ${integration.color}40, inset 0 0 20px ${integration.color}10`,
            border: `1px solid ${integration.color}50`
          }}
        />
      )}
    </div>
  );
}