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
  onAddNodeBetween?: (edgeId: string, position: { x: number; y: number }) => void;
}

export function ConnectionRenderer({ edges, nodes, connectionState, onAddNodeBetween }: ConnectionRendererProps) {
  
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
    
    // Station center
    const centerX = node.position.x + 48; // Center of 96px wide station
    const centerY = node.position.y + 48; // Center of 96px tall station
    
    if (handle === 'input') {
      // Left edge of station hull for input connections
      return { x: node.position.x + 8, y: centerY };
    } else {
      // Right edge of station hull for output connections  
      return { x: node.position.x + 88, y: centerY };
    }
  };

  const generateDataPipelinePath = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // Professional data pipeline with subtle curve
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    // Gentle curve for professional appearance
    const controlOffset = Math.min(50, Math.abs(dx) * 0.3);
    const cp1x = start.x + controlOffset;
    const cp1y = start.y;
    const cp2x = end.x - controlOffset;
    const cp2y = end.y;
    
    return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
  };

  const generateDataFlowParticles = (path: string, edgeId: string) => {
    return (
      <g key={`dataflow-${edgeId}`}>
        {/* Data packets */}
        {[0, 0.3, 0.6].map((offset, index) => (
          <g key={`packet-${edgeId}-${index}`}>
            <rect
              width="6"
              height="3"
              rx="1.5"
              fill="#64748b"
              opacity="0.8"
              transform="translate(-3, -1.5)"
            >
              <animateMotion
                dur="3s"
                repeatCount="indefinite"
                path={path}
                begin={`${offset * 3}s`}
              />
              <animate
                attributeName="opacity"
                values="0;0.8;0.8;0"
                dur="3s"
                repeatCount="indefinite"
                begin={`${offset * 3}s`}
              />
            </rect>
          </g>
        ))}
      </g>
    );
  };

  return (
    <g>
      <defs>
        <filter id="pipelineGlow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="pipelineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.3"/>
          <stop offset="50%" stopColor="#64748b" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.3"/>
        </linearGradient>
      </defs>
      
      {/* Enhanced Enterprise Data Pipelines */}
      {edges.map(edge => {
        const sourcePos = getHandlePosition(edge.source, edge.sourceHandle || 'output');
        const targetPos = getHandlePosition(edge.target, edge.targetHandle || 'input');
        const path = generateDataPipelinePath(sourcePos, targetPos);
        
        return (
          <g key={edge.id} className="group">
            {/* Main Pipeline with enhanced visibility */}
            <path
              d={path}
              stroke="#475569"
              strokeWidth="6"
              fill="none"
              opacity="0.9"
              className="transition-all duration-300 group-hover:stroke-primary"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
            
            {/* Animated Data Flow Indicator */}
            <path
              d={path}
              stroke="#3b82f6"
              strokeWidth="3"
              fill="none"
              opacity="0.7"
              strokeDasharray="12 6"
              className="group-hover:opacity-100 transition-opacity"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0;-18"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>
            
            {/* Data Packets */}
            {edge.animated && generateDataFlowParticles(path, edge.id)}
            
            {/* Enhanced Connection Points */}
            <circle
              cx={sourcePos.x}
              cy={sourcePos.y}
              r="5"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="2"
              style={{
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))'
              }}
            />
            <circle
              cx={targetPos.x}
              cy={targetPos.y}
              r="5"
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth="2"
              style={{
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))'
              }}
            />
            
            {/* Enhanced Add Node Button */}
            {onAddNodeBetween && (
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <circle
                  cx={(sourcePos.x + targetPos.x) / 2}
                  cy={(sourcePos.y + targetPos.y) / 2}
                  r="16"
                  fill="white"
                  stroke="#64748b"
                  strokeWidth="2"
                  className="cursor-pointer hover:fill-gray-50 hover:stroke-primary transition-colors"
                  onClick={() => onAddNodeBetween(edge.id, {
                    x: (sourcePos.x + targetPos.x) / 2,
                    y: (sourcePos.y + targetPos.y) / 2
                  })}
                  style={{
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))'
                  }}
                />
                <text
                  x={(sourcePos.x + targetPos.x) / 2}
                  y={(sourcePos.y + targetPos.y) / 2 + 1}
                  textAnchor="middle"
                  className="text-slate-600 font-bold cursor-pointer select-none pointer-events-none"
                  style={{ fontSize: '16px' }}
                >
                  +
                </text>
                <title>Add node to route</title>
              </g>
            )}
            
            {/* Pipeline Label */}
            {edge.data?.label && (
              <text
                x={(sourcePos.x + targetPos.x) / 2}
                y={(sourcePos.y + targetPos.y) / 2 - 25}
                textAnchor="middle"
                className="text-xs fill-slate-600 font-mono"
                style={{ fontSize: '8px' }}
              >
                {edge.data.label.toUpperCase()}
              </text>
            )}
          </g>
        );
      })}
      
      {/* Enhanced Active Pipeline Formation */}
      {connectionState.isConnecting && connectionState.sourceNodeId && (
        <g>
          {(() => {
            const sourcePos = getHandlePosition(connectionState.sourceNodeId, connectionState.sourceHandle || 'output');
            const path = generateDataPipelinePath(sourcePos, connectionState.currentPos);
            
            return (
              <>
                {/* Glowing pipeline trail */}
                <path
                  d={path}
                  stroke="#3b82f6"
                  strokeWidth="8"
                  fill="none"
                  opacity="0.3"
                  style={{
                    filter: 'blur(3px)'
                  }}
                />
                <path
                  d={path}
                  stroke="#3b82f6"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="12 6"
                  opacity="0.9"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;-18"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
                
                {/* Enhanced source connection point */}
                <circle
                  cx={sourcePos.x}
                  cy={sourcePos.y}
                  r="8"
                  fill="#3b82f6"
                  stroke="#ffffff"
                  strokeWidth="3"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))'
                  }}
                >
                  <animate
                    attributeName="r"
                    values="8;12;8"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </circle>
                
                {/* Enhanced cursor feedback */}
                <circle
                  cx={connectionState.currentPos.x}
                  cy={connectionState.currentPos.y}
                  r="12"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  opacity="0.6"
                >
                  <animate
                    attributeName="r"
                    values="12;20;12"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx={connectionState.currentPos.x}
                  cy={connectionState.currentPos.y}
                  r="6"
                  fill="#3b82f6"
                  opacity="0.8"
                />
                
                {/* Connection instruction */}
                <text
                  x={connectionState.currentPos.x}
                  y={connectionState.currentPos.y - 25}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="500"
                  fill="#3b82f6"
                  className="pointer-events-none"
                  style={{
                    filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.8))'
                  }}
                >
                  Drop on input port to connect
                </text>
              </>
            );
          })()}
        </g>
      )}
      
      {/* Industrial Connection Ports */}
      {nodes.map(node => {
        const inputPos = getHandlePosition(node.id, 'input');
        const outputPos = getHandlePosition(node.id, 'output');
        
        return (
          <g key={`ports-${node.id}`}>
            {/* Input Port */}
            {(() => {
              const isNotTrigger = node.data.integration ? 
                node.data.integration.type !== 'trigger' : 
                node.data.haloNode ? 
                  !node.data.haloNode.group?.includes('trigger') : 
                  true;
              const nodeColor = node.data.integration?.color || '#64748b';
              
              return isNotTrigger && (
                <g>
                  <rect
                    x={inputPos.x - 3}
                    y={inputPos.y - 3}
                    width="6"
                    height="6"
                    rx="1"
                    fill="#f8fafc"
                    stroke="#64748b"
                    strokeWidth="1"
                    opacity="0.9"
                  />
                  <circle
                    cx={inputPos.x}
                    cy={inputPos.y}
                    r="1"
                    fill={nodeColor}
                  />
                </g>
              );
            })()}
            
            {/* Output Port */}
            <g>
              <rect
                x={outputPos.x - 3}
                y={outputPos.y - 3}
                width="6"
                height="6"
                rx="1"
                fill="#f8fafc"
                stroke="#64748b"
                strokeWidth="1"
                opacity="0.9"
              />
              <circle
                cx={outputPos.x}
                cy={outputPos.y}
                r="1"
                fill={node.data.integration?.color || '#64748b'}
              />
            </g>
          </g>
        );
      })}
    </g>
  );
}