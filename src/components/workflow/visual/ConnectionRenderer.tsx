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
      return { x: node.position.x + 15, y: baseY }; // Connect to left connection port
    } else {
      return { x: node.position.x + 161, y: baseY }; // Connect to right connection port
    }
  };

  const generateSlipspacePath = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Create more dramatic slipspace tunnel effect
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    // Add perpendicular offset for tunnel curvature
    const perpX = -dy / distance * (distance * 0.3);
    const perpY = dx / distance * (distance * 0.3);
    
    const cp1x = start.x + dx * 0.25 + perpX * 0.5;
    const cp1y = start.y + dy * 0.25 + perpY * 0.5;
    const cp2x = end.x - dx * 0.25 + perpX * 0.5;
    const cp2y = end.y - dy * 0.25 + perpY * 0.5;
    
    return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
  };

  const generateSlipspaceParticles = (path: string, edgeId: string) => {
    return (
      <g key={`slipspace-${edgeId}`}>
        {/* Data packets */}
        {[0, 0.2, 0.4, 0.6, 0.8].map((offset, index) => (
          <g key={`packet-${edgeId}-${index}`}>
            <rect
              width="8"
              height="4"
              rx="2"
              fill="#3b82f6"
              filter="url(#slipspaceGlow)"
              opacity="0.9"
              transform="translate(-4, -2)"
            >
              <animateMotion
                dur="2.5s"
                repeatCount="indefinite"
                path={path}
                begin={`${offset * 2.5}s`}
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur="2.5s"
                repeatCount="indefinite"
                begin={`${offset * 2.5}s`}
              />
            </rect>
            {/* Energy trail */}
            <circle
              r="2"
              fill="#60a5fa"
              opacity="0.6"
            >
              <animateMotion
                dur="2.5s"
                repeatCount="indefinite"
                path={path}
                begin={`${offset * 2.5 + 0.1}s`}
              />
              <animate
                attributeName="opacity"
                values="0;0.8;0.8;0"
                dur="2.5s"
                repeatCount="indefinite"
                begin={`${offset * 2.5 + 0.1}s`}
              />
            </circle>
          </g>
        ))}
      </g>
    );
  };

  return (
    <g>
      <defs>
        <filter id="slipspaceGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="slipspaceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e40af" stopOpacity="0.1"/>
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#1e40af" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
      
      {/* Slipspace Conduits */}
      {edges.map(edge => {
        const sourcePos = getHandlePosition(edge.source, edge.sourceHandle || 'output');
        const targetPos = getHandlePosition(edge.target, edge.targetHandle || 'input');
        const path = generateSlipspacePath(sourcePos, targetPos);
        
        return (
          <g key={edge.id}>
            {/* Outer Slipspace Tunnel */}
            <path
              d={path}
              stroke="url(#slipspaceGradient)"
              strokeWidth="12"
              fill="none"
              filter="url(#slipspaceGlow)"
              opacity="0.4"
              className="transition-all duration-300"
            />
            
            {/* Main Conduit */}
            <path
              d={path}
              stroke="#3b82f6"
              strokeWidth="6"
              fill="none"
              filter="url(#slipspaceGlow)"
              className="transition-all duration-300"
              style={{
                opacity: edge.animated ? 0.9 : 0.7,
              }}
            />
            
            {/* Inner Energy Stream */}
            <path
              d={path}
              stroke="#60a5fa"
              strokeWidth="2"
              fill="none"
              opacity="0.8"
              strokeDasharray={edge.animated ? "8,4" : "none"}
              className={edge.animated ? "animate-pulse" : ""}
            />
            
            {/* Slipspace Data Flow */}
            {edge.animated && generateSlipspaceParticles(path, edge.id)}
            
            {/* Rupture Point Indicators */}
            <circle
              cx={sourcePos.x}
              cy={sourcePos.y}
              r="6"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              opacity="0.6"
              className="animate-pulse"
            />
            <circle
              cx={targetPos.x}
              cy={targetPos.y}
              r="6"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              opacity="0.6"
              className="animate-pulse"
            />
            
            {/* Connection Label */}
            {edge.data?.label && (
              <text
                x={(sourcePos.x + targetPos.x) / 2}
                y={(sourcePos.y + targetPos.y) / 2 - 15}
                textAnchor="middle"
                className="text-xs fill-blue-400 font-mono"
                style={{ fontSize: '9px' }}
              >
                [{edge.data.label.toUpperCase()}]
              </text>
            )}
          </g>
        );
      })}
      
      {/* Active Slipspace Formation */}
      {connectionState.isConnecting && connectionState.sourceNodeId && (
        <g>
          {(() => {
            const sourcePos = getHandlePosition(connectionState.sourceNodeId, connectionState.sourceHandle || 'output');
            const path = generateSlipspacePath(sourcePos, connectionState.currentPos);
            
            return (
              <>
                {/* Forming slipspace tunnel */}
                <path
                  d={path}
                  stroke="#3b82f6"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="6,6"
                  opacity="0.7"
                  filter="url(#slipspaceGlow)"
                  className="animate-pulse"
                />
                
                {/* Rupture point preview */}
                <circle
                  cx={connectionState.currentPos.x}
                  cy={connectionState.currentPos.y}
                  r="10"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="3"
                  strokeDasharray="3,3"
                  opacity="0.6"
                  className="animate-spin"
                />
                <circle
                  cx={connectionState.currentPos.x}
                  cy={connectionState.currentPos.y}
                  r="5"
                  fill="#3b82f6"
                  opacity="0.3"
                  className="animate-pulse"
                />
              </>
            );
          })()}
        </g>
      )}
      
      {/* Connection Ports */}
      {nodes.map(node => (
        <g key={`handles-${node.id}`}>
          {/* Input Port */}
          {node.data.integration.type !== 'trigger' && (
            <g>
              <circle
                cx={node.position.x + 15}
                cy={node.position.y + 56}
                r="8"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                opacity="0.8"
                className="animate-pulse"
              />
              <circle
                cx={node.position.x + 15}
                cy={node.position.y + 56}
                r="4"
                fill="#3b82f6"
                opacity="0.6"
              />
            </g>
          )}
          
          {/* Output Port */}
          <g>
            <circle
              cx={node.position.x + 161}
              cy={node.position.y + 56}
              r="8"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              opacity="0.8"
              className="animate-pulse"
            />
            <circle
              cx={node.position.x + 161}
              cy={node.position.y + 56}
              r="4"
              fill="#3b82f6"
              opacity="0.6"
            />
          </g>
        </g>
      ))}
    </g>
  );
}