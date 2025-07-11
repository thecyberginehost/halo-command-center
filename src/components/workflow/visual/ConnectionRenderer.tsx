import React from 'react';
import { VisualWorkflowNode, VisualWorkflowEdge } from '@/types/visualWorkflow';

interface ConnectionState {
  isConnecting: boolean;
  sourceNodeId?: string;
  sourceHandle?: string;
  currentPos: { x: number; y: number };
}

interface ConnectionRendererProps {
  edges: VisualWorkflowEdge[];
  nodes: VisualWorkflowNode[];
  connectionState: ConnectionState;
}

export function ConnectionRenderer({ edges, nodes, connectionState }: ConnectionRendererProps) {
  
  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    return {
      x: node.position.x + 88, // Half of card width (176/2)
      y: node.position.y + 56  // Half of card height (112/2)
    };
  };

  const getHandlePosition = (nodeId: string, handle: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    const baseY = node.position.y + 56; // Middle of card
    
    if (handle === 'input') {
      return { x: node.position.x, y: baseY };
    } else {
      return { x: node.position.x + 176, y: baseY }; // Right side of card
    }
  };

  const generateSmoothPath = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // Control points for smooth curve
    const cp1x = start.x + Math.abs(dx) * 0.5;
    const cp1y = start.y;
    const cp2x = end.x - Math.abs(dx) * 0.5;
    const cp2y = end.y;
    
    return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
  };

  const generateFlowParticles = (path: string, edgeId: string) => {
    return (
      <g key={`particles-${edgeId}`}>
        {[0, 0.33, 0.66].map((offset, index) => (
          <circle
            key={`particle-${edgeId}-${index}`}
            r="3"
            fill="hsl(var(--primary))"
            filter="url(#glow)"
            opacity="0.8"
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path={path}
              begin={`${offset * 3}s`}
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur="3s"
              repeatCount="indefinite"
              begin={`${offset * 3}s`}
            />
          </circle>
        ))}
      </g>
    );
  };

  return (
    <g>
      {/* Rendered Connections */}
      {edges.map(edge => {
        const sourcePos = getHandlePosition(edge.source, edge.sourceHandle || 'output');
        const targetPos = getHandlePosition(edge.target, edge.targetHandle || 'input');
        const path = generateSmoothPath(sourcePos, targetPos);
        
        return (
          <g key={edge.id}>
            {/* Main Connection Line */}
            <path
              d={path}
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              fill="none"
              filter="url(#glow)"
              className="transition-all duration-300"
              style={{
                opacity: edge.animated ? 0.9 : 0.7,
                strokeDasharray: edge.animated ? '5,5' : 'none',
              }}
            />
            
            {/* Connection Strength Indicator */}
            <path
              d={path}
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
              strokeDasharray="2,2"
            />
            
            {/* Flow Particles for Animated Edges */}
            {edge.animated && generateFlowParticles(path, edge.id)}
            
            {/* Connection Label */}
            {edge.data?.label && (
              <text
                x={(sourcePos.x + targetPos.x) / 2}
                y={(sourcePos.y + targetPos.y) / 2 - 10}
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
                style={{ fontSize: '10px' }}
              >
                {edge.data.label}
              </text>
            )}
          </g>
        );
      })}
      
      {/* Active Connection Preview */}
      {connectionState.isConnecting && connectionState.sourceNodeId && (
        <g>
          {(() => {
            const sourcePos = getHandlePosition(connectionState.sourceNodeId, connectionState.sourceHandle || 'output');
            const path = generateSmoothPath(sourcePos, connectionState.currentPos);
            
            return (
              <>
                <path
                  d={path}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="4,4"
                  opacity="0.6"
                  className="animate-pulse"
                />
                
                {/* Preview Target Circle */}
                <circle
                  cx={connectionState.currentPos.x}
                  cy={connectionState.currentPos.y}
                  r="8"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeDasharray="2,2"
                  opacity="0.5"
                  className="animate-spin"
                />
              </>
            );
          })()}
        </g>
      )}
      
      {/* Connection Points for Debugging */}
      {nodes.map(node => (
        <g key={`handles-${node.id}`}>
          {/* Input Handle */}
          {node.data.integration.type !== 'trigger' && (
            <circle
              cx={node.position.x}
              cy={node.position.y + 56}
              r="4"
              fill="hsl(var(--primary))"
              stroke="hsl(var(--background))"
              strokeWidth="2"
              opacity="0.7"
            />
          )}
          
          {/* Output Handle */}
          <circle
            cx={node.position.x + 176}
            cy={node.position.y + 56}
            r="4"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth="2"
            opacity="0.7"
          />
        </g>
      ))}
    </g>
  );
}