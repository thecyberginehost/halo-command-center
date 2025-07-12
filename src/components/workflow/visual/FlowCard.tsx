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
  
  // Gmail - Email Processing Unit
  if (iconName.includes('gmail')) {
    return {
      shape: 'processor',
      primaryColor: '#EA4335',
      secondaryColor: '#FBBC04',
      icon: <Mail size={20} className="text-white" />,
      brandName: 'GMAIL',
      processingType: 'email'
    };
  }
  
  // HubSpot - CRM Processing Unit
  if (iconName.includes('hubspot')) {
    return {
      shape: 'processor',
      primaryColor: '#FF7A59',
      secondaryColor: '#FF5C35',
      icon: <Users size={20} className="text-white" />,
      brandName: 'HUBSPOT',
      processingType: 'crm'
    };
  }
  
  // Salesforce - Customer Data Processor
  if (iconName.includes('salesforce')) {
    return {
      shape: 'processor',
      primaryColor: '#00A1E0',
      secondaryColor: '#1798C1',
      icon: <Users size={20} className="text-white" />,
      brandName: 'SALESFORCE',
      processingType: 'customer'
    };
  }
  
  // Slack - Communication Processor
  if (iconName.includes('slack')) {
    return {
      shape: 'processor',
      primaryColor: '#4A154B',
      secondaryColor: '#611F69',
      icon: <MessageSquare size={20} className="text-white" />,
      brandName: 'SLACK',
      processingType: 'messaging'
    };
  }
  
  // Notion - Document Processor
  if (iconName.includes('notion')) {
    return {
      shape: 'processor',
      primaryColor: '#000000',
      secondaryColor: '#37352F',
      icon: <FileText size={20} className="text-white" />,
      brandName: 'NOTION',
      processingType: 'document'
    };
  }
  
  // Stripe - Payment Processor
  if (iconName.includes('stripe')) {
    return {
      shape: 'processor',
      primaryColor: '#635BFF',
      secondaryColor: '#0A2540',
      icon: <DollarSign size={20} className="text-white" />,
      brandName: 'STRIPE',
      processingType: 'payment'
    };
  }
  
  // Google Calendar - Schedule Processor
  if (iconName.includes('calendar') || iconName.includes('google-calendar')) {
    return {
      shape: 'processor',
      primaryColor: '#4285F4',
      secondaryColor: '#34A853',
      icon: <Calendar size={20} className="text-white" />,
      brandName: 'CALENDAR',
      processingType: 'schedule'
    };
  }
  
  // Database - Data Storage Unit
  if (iconName.includes('database') || iconName.includes('sql') || iconName.includes('postgres')) {
    return {
      shape: 'storage',
      primaryColor: '#22C55E',
      secondaryColor: '#16A34A',
      icon: <Database size={20} className="text-white" />,
      brandName: 'DATABASE',
      processingType: 'storage'
    };
  }
  
  // Analytics - Analysis Engine
  if (iconName.includes('analytics') || iconName.includes('mixpanel') || iconName.includes('amplitude')) {
    return {
      shape: 'analyzer',
      primaryColor: '#6366F1',
      secondaryColor: '#4F46E5',
      icon: <BarChart3 size={20} className="text-white" />,
      brandName: 'ANALYTICS',
      processingType: 'analysis'
    };
  }
  
  // AI integrations - AI Processing Unit
  if (iconName.includes('openai') || iconName.includes('ai') || iconName.includes('gpt')) {
    return {
      shape: 'ai-processor',
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      icon: <Bot size={20} className="text-white" />,
      brandName: 'AI ENGINE',
      processingType: 'intelligence'
    };
  }
  
  // Triggers - Input Controller
  if (integration.type === 'trigger') {
    return {
      shape: 'controller',
      primaryColor: '#EAB308',
      secondaryColor: '#F59E0B',
      icon: <Zap size={20} className="text-white" />,
      brandName: 'TRIGGER',
      processingType: 'input'
    };
  }
  
  return {
    shape: 'processor',
    primaryColor: integration.color || '#3B82F6',
    secondaryColor: integration.color || '#2563EB',
    icon: <Workflow size={20} className="text-white" />,
    brandName: 'PROCESSOR',
    processingType: 'general'
  };
}

function getIndustrialShape(shape: string) {
  switch (shape) {
    case 'processor':
      return {
        borderRadius: '12px',
        clipPath: 'none',
        shape: 'rectangular'
      };
    case 'storage':
      return {
        borderRadius: '6px',
        clipPath: 'none', 
        shape: 'vault'
      };
    case 'analyzer':
      return {
        borderRadius: '8px',
        clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)',
        shape: 'angular'
      };
    case 'ai-processor':
      return {
        borderRadius: '50%',
        clipPath: 'none',
        shape: 'circular'
      };
    case 'controller':
      return {
        borderRadius: '8px',
        clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
        shape: 'octagonal'
      };
    default:
      return {
        borderRadius: '12px',
        clipPath: 'none',
        shape: 'rectangular'
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
  const industrialShape = getIndustrialShape(brandConfig.shape);
  
  // Check if this is an AI node for special processing unit styling
  const isAINode = brandConfig.shape === 'ai-processor';

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
      {/* Enterprise Processing Unit Structure */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Industrial Frame with Metallic Finish */}
        <div 
          className={`absolute border ${isHovered ? 'shadow-lg' : 'shadow-md'} transition-all duration-300`}
          style={{
            width: '160px',
            height: '80px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: industrialShape.borderRadius,
            clipPath: industrialShape.clipPath,
            borderColor: '#64748b',
            background: `linear-gradient(135deg, 
              #f8fafc 0%, 
              #e2e8f0 25%, 
              #cbd5e1 50%, 
              #94a3b8 75%, 
              #64748b 100%)`,
            boxShadow: `0 2px 8px rgba(0,0,0,0.1), 
                       inset 0 1px 0 rgba(255,255,255,0.2),
                       0 0 0 1px ${brandConfig.primaryColor}40`
          }}
        />
        
        {/* Brand Accent Strip */}
        <div 
          className="absolute"
          style={{
            width: '160px',
            height: '4px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) translateY(-38px)',
            borderRadius: '2px',
            background: `linear-gradient(90deg, 
              transparent 0%, 
              ${brandConfig.primaryColor} 20%, 
              ${brandConfig.primaryColor} 80%, 
              transparent 100%)`,
            boxShadow: `0 0 6px ${brandConfig.primaryColor}60`
          }}
        />
        
        {/* Processing Status Indicators */}
        <div className="absolute flex space-x-1" style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) translateY(25px)'
        }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${isConfigured ? 'animate-pulse' : ''}`}
              style={{
                backgroundColor: hasError ? '#ef4444' : 
                               isConfigured ? brandConfig.primaryColor : '#94a3b8',
                opacity: hasError ? 1 : isConfigured ? 0.8 : 0.4,
                animationDelay: `${i * 200}ms`
              }}
            />
          ))}
        </div>
        
        {/* AI Processing Rings */}
        {isAINode && (
          <div className="absolute inset-0">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="absolute rounded-full border animate-spin"
                style={{
                  width: `${120 + index * 20}px`,
                  height: `${120 + index * 20}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  borderColor: `${brandConfig.primaryColor}30`,
                  borderStyle: 'dashed',
                  animationDuration: `${8 + index * 4}s`,
                  animationDirection: index % 2 === 0 ? 'normal' : 'reverse'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Industrial Connection Ports */}
      {integration.type !== 'trigger' && (
        <div
          className="absolute left-0 top-1/2 w-6 h-6 border border-slate-400 
                     cursor-crosshair hover:scale-110 transition-all duration-200 flex items-center justify-center
                     shadow-sm"
          style={{ 
            transform: 'translateY(-50%) translateX(-3px)',
            borderRadius: '3px',
            background: `linear-gradient(135deg, #f8fafc, #e2e8f0)`,
            boxShadow: `inset 0 1px 2px rgba(0,0,0,0.1), 0 0 3px ${brandConfig.primaryColor}40`
          }}
          onMouseDown={handleConnectionStart('input')}
          onMouseUp={handleConnectionEnd('input')}
        >
          <div className="w-3 h-3 border border-slate-300 rounded-sm bg-white/80 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: brandConfig.primaryColor }} />
          </div>
        </div>
      )}

      <div
        className="absolute right-0 top-1/2 w-6 h-6 border border-slate-400 
                   cursor-crosshair hover:scale-110 transition-all duration-200 flex items-center justify-center
                   shadow-sm"
        style={{ 
          transform: 'translateY(-50%) translateX(3px)',
          borderRadius: '3px',
          background: `linear-gradient(135deg, #f8fafc, #e2e8f0)`,
          boxShadow: `inset 0 1px 2px rgba(0,0,0,0.1), 0 0 3px ${brandConfig.primaryColor}40`
        }}
        onMouseDown={handleConnectionStart('output')}
        onMouseUp={handleConnectionEnd('output')}
      >
        <div className="w-3 h-3 border border-slate-300 rounded-sm bg-white/80 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: brandConfig.primaryColor }} />
        </div>
      </div>

      {/* Enterprise Processing Unit Core */}
      <div 
        className={`
          w-36 h-16 cursor-grab active:cursor-grabbing relative overflow-hidden
          transition-all duration-300
          ${isHovered ? 'scale-105' : 'scale-100'}
          ${isDragging ? 'scale-110' : ''}
          ${isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
        `}
        style={{
          borderRadius: industrialShape.borderRadius,
          clipPath: industrialShape.clipPath,
          background: `linear-gradient(135deg, 
            #f8fafc 0%, 
            #e2e8f0 25%, 
            #cbd5e1 50%, 
            #94a3b8 100%)`,
          border: '1px solid #64748b',
          boxShadow: `0 2px 8px rgba(0,0,0,0.1), 
                     inset 0 1px 0 rgba(255,255,255,0.3),
                     0 0 0 1px ${brandConfig.primaryColor}60`
        }}
      >
        {/* Industrial Processing Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-8 h-8 flex items-center justify-center rounded-lg border"
            style={{ 
              backgroundColor: `${brandConfig.primaryColor}15`,
              borderColor: `${brandConfig.primaryColor}40`,
              boxShadow: `inset 0 1px 2px ${brandConfig.primaryColor}20`
            }}
          >
            {brandConfig.icon}
          </div>
        </div>
        
        {/* Processing Type Label */}
        <div className="absolute bottom-0 left-0 right-0 text-center pb-1">
          <div className="text-[9px] font-mono font-semibold text-slate-600 uppercase tracking-wide">
            {brandConfig.processingType}
          </div>
        </div>

        {/* Brand Label */}
        <div className="absolute top-0 left-0 right-0 text-center pt-1">
          <div className="text-[8px] font-mono font-bold text-slate-700 uppercase tracking-wider">
            {brandConfig.brandName}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="absolute top-1 right-1">
          <div 
            className="w-2 h-2 rounded-full border"
            style={{ 
              backgroundColor: hasError ? '#ef4444' : isConfigured ? brandConfig.primaryColor : '#94a3b8',
              borderColor: hasError ? '#dc2626' : isConfigured ? brandConfig.primaryColor : '#64748b',
              boxShadow: hasError ? '0 0 4px #ef4444' : isConfigured ? `0 0 4px ${brandConfig.primaryColor}` : 'none'
            }}
          />
        </div>

        {/* AI Processing Indicators */}
        {isAINode && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-emerald-400 animate-pulse delay-500" />
            <div className="absolute top-1/2 left-1 w-1 h-1 rounded-full bg-yellow-400 animate-pulse delay-1000" />
          </div>
        )}

        {/* Data Flow Animation */}
        {isConfigured && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div 
              className="absolute top-1/2 left-0 w-1 h-0.5 animate-pulse"
              style={{ 
                backgroundColor: brandConfig.primaryColor,
                transform: 'translateY(-50%)',
                animation: 'pulse 2s infinite'
              }}
            />
            <div 
              className="absolute top-1/2 right-0 w-1 h-0.5 animate-pulse"
              style={{ 
                backgroundColor: brandConfig.primaryColor,
                transform: 'translateY(-50%)',
                animation: 'pulse 2s infinite 0.5s'
              }}
            />
          </div>
        )}

        {/* Professional Actions Menu */}
        <div className={`absolute -top-7 -right-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 rounded border bg-white/90 hover:bg-white"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
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
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Unit Label */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-xs font-medium text-slate-700 truncate max-w-32">
            {label}
          </div>
          {config.executionCount && (
            <div className="text-[9px] text-slate-500">
              Processed: {config.executionCount}
            </div>
          )}
        </div>
      </div>

      {/* Professional Hover Effect */}
      {isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            width: '170px',
            height: '90px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: industrialShape.borderRadius,
            background: `radial-gradient(circle, ${brandConfig.primaryColor}15, transparent 70%)`,
            boxShadow: `0 0 20px ${brandConfig.primaryColor}30`
          }}
        />
      )}
    </div>
  );
}