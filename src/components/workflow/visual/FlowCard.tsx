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
  Circle,
  Mail,
  Users,
  Database,
  Calendar,
  FileText,
  MessageSquare,
  Phone,
  DollarSign,
  BarChart3,
  Clock,
  Globe,
  Shield,
  Code,
  Workflow,
  Bot,
  Webhook,
  Cloud,
  Server
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

function getBrandConfig(integration: any) {
  const iconName = integration.id || integration.displayName?.toLowerCase() || '';
  
  // Gmail - Red envelope command station
  if (iconName.includes('gmail')) {
    return {
      shape: 'envelope',
      primaryColor: '#EA4335',
      secondaryColor: '#FBBC04',
      icon: <Mail size={18} className="text-white" />,
      brandName: 'GMAIL'
    };
  }
  
  // HubSpot - Orange gear command station  
  if (iconName.includes('hubspot')) {
    return {
      shape: 'gear',
      primaryColor: '#FF7A59',
      secondaryColor: '#FF5C35',
      icon: <Users size={18} className="text-white" />,
      brandName: 'HUBSPOT'
    };
  }
  
  // Salesforce - Blue cloud command station
  if (iconName.includes('salesforce')) {
    return {
      shape: 'cloud',
      primaryColor: '#00A1E0',
      secondaryColor: '#1798C1',
      icon: <Users size={18} className="text-white" />,
      brandName: 'SALESFORCE'
    };
  }
  
  // Slack - Purple hash command station
  if (iconName.includes('slack')) {
    return {
      shape: 'hash',
      primaryColor: '#4A154B',
      secondaryColor: '#611F69',
      icon: <MessageSquare size={18} className="text-white" />,
      brandName: 'SLACK'
    };
  }
  
  // Notion - Clean minimalist command station
  if (iconName.includes('notion')) {
    return {
      shape: 'clean',
      primaryColor: '#000000',
      secondaryColor: '#37352F',
      icon: <FileText size={18} className="text-white" />,
      brandName: 'NOTION'
    };
  }
  
  // Stripe - Purple gradient command station
  if (iconName.includes('stripe')) {
    return {
      shape: 'stripe',
      primaryColor: '#635BFF',
      secondaryColor: '#0A2540',
      icon: <DollarSign size={18} className="text-white" />,
      brandName: 'STRIPE'
    };
  }
  
  // Google Calendar - Blue calendar command station
  if (iconName.includes('calendar') || iconName.includes('google-calendar')) {
    return {
      shape: 'calendar',
      primaryColor: '#4285F4',
      secondaryColor: '#34A853',
      icon: <Calendar size={18} className="text-white" />,
      brandName: 'CALENDAR'
    };
  }
  
  // Database stations - Green data vault
  if (iconName.includes('database') || iconName.includes('sql') || iconName.includes('postgres')) {
    return {
      shape: 'vault',
      primaryColor: '#22C55E',
      secondaryColor: '#16A34A',
      icon: <Database size={18} className="text-white" />,
      brandName: 'DATABASE'
    };
  }
  
  // Analytics - Indigo chart command station
  if (iconName.includes('analytics') || iconName.includes('mixpanel') || iconName.includes('amplitude')) {
    return {
      shape: 'chart',
      primaryColor: '#6366F1',
      secondaryColor: '#4F46E5',
      icon: <BarChart3 size={18} className="text-white" />,
      brandName: 'ANALYTICS'
    };
  }
  
  // AI integrations - Keep existing neural design
  if (iconName.includes('openai') || iconName.includes('ai') || iconName.includes('gpt')) {
    return {
      shape: 'neural',
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      icon: <Bot size={18} className="text-white" />,
      brandName: 'AI'
    };
  }
  
  // Default configurations
  if (integration.type === 'trigger') {
    return {
      shape: 'trigger',
      primaryColor: '#EAB308',
      secondaryColor: '#F59E0B',
      icon: <Zap size={18} className="text-white" />,
      brandName: 'TRIGGER'
    };
  }
  
  return {
    shape: 'standard',
    primaryColor: integration.color || '#3B82F6',
    secondaryColor: integration.color || '#2563EB',
    icon: <Workflow size={18} className="text-white" />,
    brandName: 'STANDARD'
  };
}

function getStationShape(shape: string) {
  switch (shape) {
    case 'envelope':
      return {
        clipPath: 'polygon(0% 25%, 50% 0%, 100% 25%, 100% 100%, 0% 100%)',
        transform: 'none'
      };
    case 'gear':
      return {
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        transform: 'none'
      };
    case 'cloud':
      return {
        clipPath: 'polygon(25% 60%, 5% 60%, 5% 40%, 10% 25%, 25% 10%, 45% 10%, 55% 15%, 70% 10%, 90% 25%, 95% 40%, 95% 60%, 75% 60%, 75% 75%, 25% 75%)',
        transform: 'none'
      };
    case 'hash':
      return {
        clipPath: 'polygon(20% 0%, 40% 0%, 45% 35%, 80% 35%, 80% 55%, 45% 55%, 50% 90%, 30% 90%, 25% 55%, 0% 55%, 0% 35%, 25% 35%)',
        transform: 'none'
      };
    case 'clean':
      return {
        clipPath: 'polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)',
        transform: 'none'
      };
    case 'stripe':
      return {
        clipPath: 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',
        transform: 'none'
      };
    case 'calendar':
      return {
        clipPath: 'polygon(10% 15%, 90% 15%, 90% 25%, 100% 25%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 25%, 10% 25%)',
        transform: 'none'
      };
    case 'vault':
      return {
        clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
        transform: 'none'
      };
    case 'chart':
      return {
        clipPath: 'polygon(0% 100%, 0% 60%, 25% 40%, 50% 20%, 75% 30%, 100% 10%, 100% 100%)',
        transform: 'none'
      };
    case 'neural':
      return {
        clipPath: 'circle(50% at 50% 50%)',
        transform: 'none'
      };
    case 'trigger':
      return {
        clipPath: 'polygon(50% 0%, 80% 30%, 60% 30%, 60% 70%, 80% 70%, 50% 100%, 20% 70%, 40% 70%, 40% 30%, 20% 30%)',
        transform: 'none'
      };
    default:
      return {
        clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
        transform: 'none'
      };
  }
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
  
  // Get brand-specific configuration
  const brandConfig = getBrandConfig(integration);
  const stationShape = getStationShape(brandConfig.shape);
  
  // Check if this is an AI node for special Neural Command Center styling
  const isAINode = brandConfig.shape === 'neural';

  // Get command station configuration based on brand
  const getStationConfig = () => {
    if (brandConfig.shape === 'trigger') return { type: 'trigger', size: 'small', faction: 'unsc' };
    if (brandConfig.shape === 'neural') return { type: 'ai', size: 'large', faction: 'forerunner' };
    if (brandConfig.shape === 'vault') return { type: 'database', size: 'medium', faction: 'covenant' };
    return { type: 'standard', size: 'medium', faction: 'unsc' };
  };

  const stationConfig = getStationConfig();

  // Command station styling based on faction and theme
  const getStationStyles = () => {
    const baseStyles = "transition-all duration-500 transform-gpu";
    
    switch (stationConfig.faction) {
      case 'unsc':
        return `${baseStyles} drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]`;
      case 'covenant':
        return `${baseStyles} drop-shadow-[0_0_18px_rgba(147,51,234,0.4)]`;
      case 'forerunner':
        return `${baseStyles} drop-shadow-[0_0_25px_rgba(255,215,0,0.4)]`;
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
      {/* Command Station Structure */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Brand-Specific Command Frame */}
        <div 
          className={`absolute rounded-lg border-2 ${isHovered ? 'animate-pulse' : ''}`}
          style={{
            width: '120px',
            height: '120px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) rotate(0deg)',
            clipPath: stationShape.clipPath,
            borderColor: brandConfig.primaryColor,
            backgroundColor: `${brandConfig.primaryColor}20`
          }}
        />
        
        {/* Neural Data Rings for AI nodes */}
        {isAINode && (
          <>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="absolute rounded-full border border-dashed animate-spin"
                style={{
                  width: `${140 + index * 25}px`,
                  height: `${140 + index * 25}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  borderColor: `rgba(255, 215, 0, ${0.3 - index * 0.1})`,
                  animationDuration: `${15 + index * 10}s`,
                  animationDelay: `${index * 2}s`,
                  animationDirection: index % 2 === 0 ? 'normal' : 'reverse'
                }}
              >
                <div
                  className="absolute w-2 h-2 rounded-full bg-yellow-400"
                  style={{
                    top: '-4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    boxShadow: '0 0 10px #ffd700'
                  }}
                />
              </div>
            ))}
          </>
        )}
        
        {/* Tactical Grid Overlay */}
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute border-dashed border-l border-b"
              style={{
                left: `${i * 20}%`,
                top: `${i * 20}%`,
                width: '20%',
                height: '20%',
                borderColor: brandConfig.primaryColor + '30'
              }}
            />
          ))}
        </div>
      </div>

      {/* Slipspace Connection Ports - Docked to Station Hull */}
      {integration.type !== 'trigger' && (
        <div
          className="absolute left-0 top-1/2 w-8 h-8 border-2 border-background 
                     cursor-crosshair hover:scale-125 transition-all duration-300 flex items-center justify-center
                     shadow-lg backdrop-blur-sm"
          style={{ 
            transform: 'translateY(-50%)',
            clipPath: 'circle(50% at 50% 50%)',
            background: `radial-gradient(circle, ${brandConfig.primaryColor}60, ${brandConfig.primaryColor}30)`,
            borderColor: brandConfig.primaryColor,
            boxShadow: `0 0 15px ${brandConfig.primaryColor}50, inset 0 0 10px ${brandConfig.primaryColor}20`
          }}
          onMouseDown={handleConnectionStart('input')}
          onMouseUp={handleConnectionEnd('input')}
        >
          <div className="absolute inset-1 animate-pulse rounded-full"
               style={{ 
                 background: `radial-gradient(circle, ${brandConfig.primaryColor}40, transparent)` 
               }} />
          <ArrowLeft className="h-3 w-3 z-10" style={{ color: brandConfig.primaryColor }} />
        </div>
      )}

      <div
        className="absolute right-0 top-1/2 w-8 h-8 border-2 border-background 
                   cursor-crosshair hover:scale-125 transition-all duration-300 flex items-center justify-center
                   shadow-lg backdrop-blur-sm"
        style={{ 
          transform: 'translateY(-50%)',
          clipPath: 'circle(50% at 50% 50%)',
          background: `radial-gradient(circle, ${brandConfig.primaryColor}60, ${brandConfig.primaryColor}30)`,
          borderColor: brandConfig.primaryColor,
          boxShadow: `0 0 15px ${brandConfig.primaryColor}50, inset 0 0 10px ${brandConfig.primaryColor}20`
        }}
        onMouseDown={handleConnectionStart('output')}
        onMouseUp={handleConnectionEnd('output')}
      >
        <div className="absolute inset-1 animate-pulse rounded-full"
             style={{ 
               background: `radial-gradient(circle, ${brandConfig.primaryColor}40, transparent)` 
             }} />
        <ArrowRight className="h-3 w-3 z-10" style={{ color: brandConfig.primaryColor }} />
      </div>

      {/* Main Command Station Core */}
      <div 
        className={`
          w-24 h-24 cursor-grab active:cursor-grabbing relative overflow-hidden
          border-2 backdrop-blur-md transition-all duration-500
          ${getStationStyles()}
          ${isHovered ? 'scale-110' : 'scale-100'}
          ${isDragging ? 'scale-125' : ''}
          ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
        `}
        style={{
          clipPath: stationShape.clipPath,
          background: isAINode
            ? 'radial-gradient(circle, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.1), rgba(0, 0, 0, 0.1))'
            : `linear-gradient(135deg, ${brandConfig.primaryColor}40, ${brandConfig.secondaryColor}20, rgba(0, 0, 0, 0.05))`,
          borderColor: brandConfig.primaryColor,
          boxShadow: isAINode 
            ? '0 0 35px rgba(255, 215, 0, 0.5), inset 0 0 25px rgba(255, 215, 0, 0.2)'
            : `0 0 25px ${brandConfig.primaryColor}50, inset 0 0 20px ${brandConfig.primaryColor}30`
        }}
      >
        {/* Neural Command Center Pattern */}
        {isAINode && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-2 rounded-full border border-yellow-400/30 animate-pulse" />
            <div className="absolute inset-4 rounded-full border border-yellow-300/40 animate-pulse delay-500" />
            {/* Forerunner-style neural pathways */}
            <div className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-yellow-400/50 transform -translate-x-1/2 -translate-y-1/2 rotate-0" />
            <div className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-yellow-400/50 transform -translate-x-1/2 -translate-y-1/2 rotate-60" />
            <div className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-yellow-400/50 transform -translate-x-1/2 -translate-y-1/2 rotate-120" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-yellow-400 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
        )}

        {/* Holographic Command Interface */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className={`p-3 ${isAINode ? 'rounded-full animate-pulse' : ''} flex items-center justify-center`}
            style={{ 
              backgroundColor: isAINode ? 'rgba(255, 215, 0, 0.15)' : `${brandConfig.primaryColor}20`,
              clipPath: stationShape.clipPath
            }}
          >
            {/* Brand-specific icon */}
            <div className="relative flex items-center justify-center">
              {brandConfig.icon}
              {/* Brand name indicator */}
              <div className="absolute -bottom-4 text-[8px] font-mono text-white/80 whitespace-nowrap">
                {brandConfig.brandName}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tactical Readouts */}
        <div className="absolute inset-0 text-[8px] font-mono text-white/60 overflow-hidden">
          <div className="absolute top-1 left-1">PWR</div>
          <div className="absolute top-1 right-1">SYS</div>
          <div className="absolute bottom-1 left-1">COM</div>
          <div className="absolute bottom-1 right-1">RDY</div>
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

        {/* Command Station Designation */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-xs font-mono text-muted-foreground/80 truncate max-w-24">
            {isAINode ? 'NEURAL-CMD' : `CMD-${label.slice(0, 8).toUpperCase()}`}
          </div>
          <div className="text-[10px] font-mono text-primary/60">
            {stationConfig.faction.toUpperCase()} CLASS
          </div>
          {config.executionCount && (
            <div className="text-[9px] font-mono text-green-400/80">
              OP: {config.executionCount}
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
                  backgroundColor: `${brandConfig.primaryColor}20`,
                  border: `1px solid ${brandConfig.primaryColor}40`
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" style={{ color: brandConfig.primaryColor }} />
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
                 style={{ backgroundColor: brandConfig.primaryColor }} />
            <div className="absolute -top-2 -right-2 w-1.5 h-1.5 rounded-full animate-pulse delay-100"
                 style={{ backgroundColor: `${brandConfig.primaryColor}70` }} />
            <div className="absolute -bottom-2 -left-2 w-1.5 h-1.5 rounded-full animate-pulse delay-200"
                 style={{ backgroundColor: `${brandConfig.primaryColor}70` }} />
            <div className="absolute -bottom-2 -right-2 w-1 h-1 rounded-full animate-ping delay-300"
                 style={{ backgroundColor: `${brandConfig.primaryColor}50` }} />
          </>
        )}

        {/* Holographic Scan Lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 3px,
                ${brandConfig.primaryColor}30 3px,
                ${brandConfig.primaryColor}30 4px
              )`
            }}
          />
          <div 
            className="absolute inset-0 opacity-20 animate-pulse"
            style={{
              background: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 2px,
                ${brandConfig.primaryColor}20 2px,
                ${brandConfig.primaryColor}20 3px
              )`
            }}
          />
        </div>
      </div>

      {/* Command Station Energy Field */}
      {isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{
            width: '140px',
            height: '140px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            clipPath: stationShape.clipPath,
            background: isAINode 
              ? 'radial-gradient(circle, rgba(255, 215, 0, 0.3), transparent 70%)'
              : `radial-gradient(circle, ${brandConfig.primaryColor}40, transparent 70%)`,
            boxShadow: isAINode 
              ? '0 0 50px rgba(255, 215, 0, 0.4)'
              : `0 0 40px ${brandConfig.primaryColor}50`
          }}
        />
      )}
    </div>
  );
}