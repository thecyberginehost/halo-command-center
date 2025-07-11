import React, { useCallback, useRef, useState, useEffect } from 'react';
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
  ArrowLeft,
  Cpu,
  Circle
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
  
  // Check if this is an AI node for special Cortex styling
  const isAINode = integration.category === 'ai' || integration.name.toLowerCase().includes('gpt') || integration.name.toLowerCase().includes('claude') || integration.name.toLowerCase().includes('llm');

  // Get orbital ring configuration based on integration type
  const getOrbitalConfig = () => {
    if (integration.type === 'trigger') return { rings: 1, size: 'small' };
    if (isAINode) return { rings: 3, size: 'large' }; // AI Cortex with neural patterns
    return { rings: 2, size: 'medium' };
  };

  const orbitalConfig = getOrbitalConfig();

  // Orbital station styling based on theme
  const getOrbitalStyles = () => {
    const baseStyles = "transition-all duration-500 transform-gpu";
    
    switch (theme) {
      case 'blueprint':
        return `${baseStyles} drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]`;
      case 'circuit':
        return `${baseStyles} drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]`;
      case 'organic':
        return `${baseStyles} drop-shadow-[0_0_18px_rgba(139,92,246,0.3)]`;
      default:
        return baseStyles;
    }
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
      {/* Orbital Rings */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: orbitalConfig.rings }).map((_, index) => {
          const ringSize = 100 + (index * 20);
          const animationDelay = index * 2;
          const rotationSpeed = 10 + (index * 5);
          
          return (
            <div
              key={index}
              className={`absolute rounded-full border border-dashed animate-spin ${
                isAINode ? 'border-purple-400/30' : 'border-primary/20'
              } ${isHovered ? 'border-primary/40' : ''}`}
              style={{
                width: `${ringSize}px`,
                height: `${ringSize}px`,
                left: `50%`,
                top: `50%`,
                transform: 'translate(-50%, -50%)',
                animationDuration: `${rotationSpeed}s`,
                animationDelay: `${animationDelay}s`,
                borderColor: isAINode 
                  ? `rgba(147, 51, 234, ${0.2 + index * 0.1})` 
                  : `${integration.color}${Math.round(20 + index * 10).toString(16)}`
              }}
            >
              {/* Orbital particles */}
              <div
                className={`absolute w-1.5 h-1.5 rounded-full ${
                  isAINode ? 'bg-purple-400' : 'bg-primary'
                } shadow-lg`}
                style={{
                  top: '-3px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: isAINode ? '#a855f7' : integration.color,
                  boxShadow: `0 0 8px ${isAINode ? '#a855f7' : integration.color}60`
                }}
              />
              {index === 0 && (
                <div
                  className="absolute w-1 h-1 rounded-full bg-white/60"
                  style={{
                    bottom: '-2px',
                    right: '25%',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Connection Handles - Docking Ports */}
      {integration.type !== 'trigger' && (
        <div
          className="absolute -left-4 top-1/2 w-8 h-8 rounded-full border-2 border-background 
                     cursor-crosshair hover:scale-125 transition-all duration-300 flex items-center justify-center
                     shadow-lg backdrop-blur-sm"
          style={{ 
            transform: 'translateY(-50%)',
            background: `linear-gradient(135deg, ${integration.color}40, ${integration.color}20)`,
            borderColor: integration.color,
            boxShadow: `0 0 12px ${integration.color}40`
          }}
          onMouseDown={handleConnectionStart('input')}
          onMouseUp={handleConnectionEnd('input')}
        >
          <ArrowLeft className="h-4 w-4" style={{ color: integration.color }} />
          <div className="absolute inset-0 rounded-full animate-pulse" 
               style={{ background: `radial-gradient(circle, ${integration.color}20, transparent)` }} />
        </div>
      )}

      <div
        className="absolute -right-4 top-1/2 w-8 h-8 rounded-full border-2 border-background 
                   cursor-crosshair hover:scale-125 transition-all duration-300 flex items-center justify-center
                   shadow-lg backdrop-blur-sm"
        style={{ 
          transform: 'translateY(-50%)',
          background: `linear-gradient(135deg, ${integration.color}40, ${integration.color}20)`,
          borderColor: integration.color,
          boxShadow: `0 0 12px ${integration.color}40`
        }}
        onMouseDown={handleConnectionStart('output')}
        onMouseUp={handleConnectionEnd('output')}
      >
        <ArrowRight className="h-4 w-4" style={{ color: integration.color }} />
        <div className="absolute inset-0 rounded-full animate-pulse" 
             style={{ background: `radial-gradient(circle, ${integration.color}20, transparent)` }} />
      </div>

      {/* Main Orbital Station - Central Core */}
      <div 
        className={`
          w-20 h-20 rounded-full cursor-grab active:cursor-grabbing relative overflow-hidden
          border-2 backdrop-blur-md transition-all duration-500
          ${getOrbitalStyles()}
          ${isHovered ? 'scale-110' : 'scale-100'}
          ${isDragging ? 'scale-125' : ''}
          ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
        `}
        style={{
          background: isAINode
            ? 'radial-gradient(circle, rgba(147, 51, 234, 0.2), rgba(147, 51, 234, 0.05), rgba(0, 0, 0, 0.1))'
            : `radial-gradient(circle, ${integration.color}30, ${integration.color}10, rgba(0, 0, 0, 0.05))`,
          borderColor: isAINode ? '#a855f7' : integration.color,
          boxShadow: isAINode 
            ? '0 0 30px rgba(147, 51, 234, 0.4), inset 0 0 20px rgba(147, 51, 234, 0.1)'
            : `0 0 20px ${integration.color}40, inset 0 0 15px ${integration.color}20`
        }}
      >
        {/* AI Cortex Neural Pattern */}
        {isAINode && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-2 rounded-full border border-purple-400/20 animate-pulse" />
            <div className="absolute inset-4 rounded-full border border-purple-300/30 animate-pulse delay-500" />
            <div className="absolute top-1/2 left-1/2 w-0.5 h-6 bg-purple-400/40 transform -translate-x-1/2 -translate-y-1/2 rotate-45" />
            <div className="absolute top-1/2 left-1/2 w-0.5 h-6 bg-purple-400/40 transform -translate-x-1/2 -translate-y-1/2 -rotate-45" />
            <div className="absolute top-1/2 left-1/2 w-6 h-0.5 bg-purple-400/40 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        )}

        {/* Central Icon Hub */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className={`p-2 rounded-full ${isAINode ? 'animate-pulse' : ''}`}
            style={{ 
              backgroundColor: isAINode ? 'rgba(147, 51, 234, 0.15)' : `${integration.color}15`,
            }}
          >
            {Icon ? (
              <Icon 
                className={`h-8 w-8 ${isAINode ? 'animate-pulse' : ''}`}
                style={{ color: isAINode ? '#a855f7' : integration.color }}
              />
            ) : (
              <Zap 
                className={`h-8 w-8 ${isAINode ? 'animate-pulse' : ''}`}
                style={{ color: isAINode ? '#a855f7' : integration.color }}
              />
            )}
          </div>
        </div>

        {/* Holographic Status Indicators */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <div className={`flex items-center justify-center w-4 h-4 rounded-full border ${getStatusColor()}`}
               style={{ 
                 backgroundColor: hasError ? 'rgba(239, 68, 68, 0.2)' : isConfigured ? 'rgba(34, 197, 94, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                 borderColor: hasError ? '#ef4444' : isConfigured ? '#22c55e' : '#6b7280'
               }}>
            {React.cloneElement(getStatusIcon(), { className: 'h-2 w-2' })}
          </div>
        </div>

        {/* Technical Readouts */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-xs font-mono text-muted-foreground/80 truncate max-w-20">
            {isAINode ? 'AI CORTEX' : label}
          </div>
          {config.executionCount && (
            <div className="text-[10px] font-mono text-primary/80">
              {config.executionCount} EXEC
            </div>
          )}
        </div>

        {/* Actions Menu - Tactical Panel */}
        <div className={`absolute -top-8 -right-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full backdrop-blur-sm"
                style={{ 
                  backgroundColor: `${integration.color}20`,
                  border: `1px solid ${integration.color}40`
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" style={{ color: integration.color }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 backdrop-blur-md bg-background/95">
              <DropdownMenuItem onClick={() => onConfigClick(node.id)}>
                <Settings className="h-3 w-3 mr-2" />
                Configure Node
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(node.id)}>
                <Copy className="h-3 w-3 mr-2" />
                Duplicate Station
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(node.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Decommission
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Energy Field Effects */}
        {isDragging && (
          <>
            <div className="absolute -top-2 -left-2 w-2 h-2 rounded-full animate-ping"
                 style={{ backgroundColor: integration.color }} />
            <div className="absolute -top-2 -right-2 w-1.5 h-1.5 rounded-full animate-pulse delay-100"
                 style={{ backgroundColor: `${integration.color}70` }} />
            <div className="absolute -bottom-2 -left-2 w-1.5 h-1.5 rounded-full animate-pulse delay-200"
                 style={{ backgroundColor: `${integration.color}70` }} />
            <div className="absolute -bottom-2 -right-2 w-1 h-1 rounded-full animate-ping delay-300"
                 style={{ backgroundColor: `${integration.color}50` }} />
          </>
        )}

        {/* Scan Lines */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                ${integration.color}40 2px,
                ${integration.color}40 4px
              )`
            }}
          />
        </div>
      </div>

      {/* Orbital Station Glow Field */}
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
          style={{
            width: '120px',
            height: '120px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: isAINode 
              ? 'radial-gradient(circle, rgba(147, 51, 234, 0.2), transparent 70%)'
              : `radial-gradient(circle, ${integration.color}30, transparent 70%)`,
            boxShadow: isAINode 
              ? '0 0 40px rgba(147, 51, 234, 0.3)'
              : `0 0 30px ${integration.color}40`
          }}
        />
      )}
    </div>
  );
}