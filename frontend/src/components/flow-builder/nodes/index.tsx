// src/components/flow-builder/nodes/index.tsx
// All custom node components

'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Play,
  StopCircle,
  MessageSquare,
  Keyboard,
  GitBranch,
  Zap,
  Clock,
  ArrowRight,
} from 'lucide-react';

// ============= START NODE =============
export const StartNode = memo(({ data, selected }: NodeProps) => (
  <div
    className={`
      px-6 py-4 rounded-lg bg-green-500 text-white shadow-lg
      border-2 transition-all
      ${selected ? 'border-green-700 ring-2 ring-green-300' : 'border-green-600'}
      min-w-[140px]
    `}
  >
    <div className="flex items-center gap-2 justify-center">
      <Play className="w-5 h-5" />
      <div className="font-semibold">{data.label || 'Start'}</div>
    </div>
    
    <Handle
      type="source"
      position={Position.Bottom}
      className="!bg-green-700 !w-3 !h-3 !border-2 !border-white"
    />
  </div>
));
StartNode.displayName = 'StartNode';

// ============= END NODE =============
export const EndNode = memo(({ data, selected }: NodeProps) => (
  <div
    className={`
      px-6 py-4 rounded-lg bg-red-500 text-white shadow-lg
      border-2 transition-all
      ${selected ? 'border-red-700 ring-2 ring-red-300' : 'border-red-600'}
      min-w-[140px]
    `}
  >
    <Handle
      type="target"
      position={Position.Top}
      className="!bg-red-700 !w-3 !h-3 !border-2 !border-white"
    />
    
    <div className="flex items-center gap-2 justify-center">
      <StopCircle className="w-5 h-5" />
      <div className="font-semibold">{data.label || 'End'}</div>
    </div>
  </div>
));
EndNode.displayName = 'EndNode';

// ============= MESSAGE NODE =============
export const MessageNode = memo(({ data, selected }: NodeProps) => (
  <div
    className={`
      px-4 py-3 rounded-lg bg-blue-500 text-white shadow-lg
      border-2 transition-all
      ${selected ? 'border-blue-700 ring-2 ring-blue-300' : 'border-blue-600'}
      min-w-[200px] max-w-[280px]
    `}
  >
    <Handle
      type="target"
      position={Position.Top}
      className="!bg-blue-700 !w-3 !h-3 !border-2 !border-white"
    />
    
    <div className="flex items-center gap-2 mb-2">
      <MessageSquare className="w-4 h-4 flex-shrink-0" />
      <div className="font-semibold text-sm">{data.label || 'Message'}</div>
    </div>
    
    {data.message && (
      <div className="text-xs opacity-90 line-clamp-3 mt-1 bg-blue-600 bg-opacity-30 rounded px-2 py-1">
        {data.message}
      </div>
    )}
    
    <Handle
      type="source"
      position={Position.Bottom}
      className="!bg-blue-700 !w-3 !h-3 !border-2 !border-white"
    />
  </div>
));
MessageNode.displayName = 'MessageNode';

// ============= INPUT NODE =============
export const InputNode = memo(({ data, selected }: NodeProps) => (
  <div
    className={`
      px-4 py-3 rounded-lg bg-purple-500 text-white shadow-lg
      border-2 transition-all
      ${selected ? 'border-purple-700 ring-2 ring-purple-300' : 'border-purple-600'}
      min-w-[200px] max-w-[280px]
    `}
  >
    <Handle
      type="target"
      position={Position.Top}
      className="!bg-purple-700 !w-3 !h-3 !border-2 !border-white"
    />
    
    <div className="flex items-center gap-2 mb-2">
      <Keyboard className="w-4 h-4 flex-shrink-0" />
      <div className="font-semibold text-sm">{data.label || 'User Input'}</div>
    </div>
    
    <div className="text-xs opacity-90 space-y-1">
      <div className="bg-purple-600 bg-opacity-30 rounded px-2 py-1">
        Type: <span className="font-semibold">{data.inputType || 'text'}</span>
      </div>
      {data.variableName && (
        <div className="bg-purple-600 bg-opacity-30 rounded px-2 py-1">
          → <span className="font-mono">{data.variableName}</span>
        </div>
      )}
    </div>
    
    <Handle
      type="source"
      position={Position.Bottom}
      className="!bg-purple-700 !w-3 !h-3 !border-2 !border-white"
    />
  </div>
));
InputNode.displayName = 'InputNode';

// ============= CONDITION NODE =============
export const ConditionNode = memo(({ data, selected }: NodeProps) => (
  <div
    className={`
      px-4 py-3 rounded-lg bg-yellow-500 text-white shadow-lg
      border-2 transition-all
      ${selected ? 'border-yellow-700 ring-2 ring-yellow-300' : 'border-yellow-600'}
      min-w-[200px] max-w-[280px]
    `}
  >
    <Handle
      type="target"
      position={Position.Top}
      className="!bg-yellow-700 !w-3 !h-3 !border-2 !border-white"
    />
    
    <div className="flex items-center gap-2 mb-2">
      <GitBranch className="w-4 h-4 flex-shrink-0" />
      <div className="font-semibold text-sm">{data.label || 'Condition'}</div>
    </div>
    
    {data.conditions && data.conditions.length > 0 && (
      <div className="text-xs opacity-90 bg-yellow-600 bg-opacity-30 rounded px-2 py-1">
        {data.conditions.length} condition{data.conditions.length > 1 ? 's' : ''}
      </div>
    )}
    
    <Handle
      type="source"
      position={Position.Bottom}
      className="!bg-yellow-700 !w-3 !h-3 !border-2 !border-white"
    />
  </div>
));
ConditionNode.displayName = 'ConditionNode';

// ============= API NODE =============
export const ApiNode = memo(({ data, selected }: NodeProps) => (
  <div
    className={`
      px-4 py-3 rounded-lg bg-orange-500 text-white shadow-lg
      border-2 transition-all
      ${selected ? 'border-orange-700 ring-2 ring-orange-300' : 'border-orange-600'}
      min-w-[200px] max-w-[280px]
    `}
  >
    <Handle
      type="target"
      position={Position.Top}
      className="!bg-orange-700 !w-3 !h-3 !border-2 !border-white"
    />
    
    <div className="flex items-center gap-2 mb-2">
      <Zap className="w-4 h-4 flex-shrink-0" />
      <div className="font-semibold text-sm">{data.label || 'API Call'}</div>
    </div>
    
    {data.apiConfig && (
      <div className="text-xs opacity-90 space-y-1">
        <div className="bg-orange-600 bg-opacity-30 rounded px-2 py-1 truncate">
          {data.apiConfig.method || 'GET'} {data.apiConfig.url || 'No URL'}
        </div>
      </div>
    )}
    
    <Handle
      type="source"
      position={Position.Bottom}
      className="!bg-orange-700 !w-3 !h-3 !border-2 !border-white"
    />
  </div>
));
ApiNode.displayName = 'ApiNode';

// ============= DELAY NODE =============
export const DelayNode = memo(({ data, selected }: NodeProps) => (
  <div
    className={`
      px-4 py-3 rounded-lg bg-pink-500 text-white shadow-lg
      border-2 transition-all
      ${selected ? 'border-pink-700 ring-2 ring-pink-300' : 'border-pink-600'}
      min-w-[180px] max-w-[240px]
    `}
  >
    <Handle
      type="target"
      position={Position.Top}
      className="!bg-pink-700 !w-3 !h-3 !border-2 !border-white"
    />
    
    <div className="flex items-center gap-2 mb-2">
      <Clock className="w-4 h-4 flex-shrink-0" />
      <div className="font-semibold text-sm">{data.label || 'Delay'}</div>
    </div>
    
    {data.delay !== undefined && (
      <div className="text-xs opacity-90 bg-pink-600 bg-opacity-30 rounded px-2 py-1">
        Wait: {(data.delay / 1000).toFixed(1)}s
      </div>
    )}
    
    <Handle
      type="source"
      position={Position.Bottom}
      className="!bg-pink-700 !w-3 !h-3 !border-2 !border-white"
    />
  </div>
));
DelayNode.displayName = 'DelayNode';

// ============= JUMP NODE =============
export const JumpNode = memo(({ data, selected }: NodeProps) => (
  <div
    className={`
      px-4 py-3 rounded-lg bg-teal-500 text-white shadow-lg
      border-2 transition-all
      ${selected ? 'border-teal-700 ring-2 ring-teal-300' : 'border-teal-600'}
      min-w-[180px] max-w-[240px]
    `}
  >
    <Handle
      type="target"
      position={Position.Top}
      className="!bg-teal-700 !w-3 !h-3 !border-2 !border-white"
    />
    
    <div className="flex items-center gap-2 mb-2">
      <ArrowRight className="w-4 h-4 flex-shrink-0" />
      <div className="font-semibold text-sm">{data.label || 'Jump'}</div>
    </div>
    
    {data.targetNodeId && (
      <div className="text-xs opacity-90 bg-teal-600 bg-opacity-30 rounded px-2 py-1 truncate">
        → {data.targetNodeId}
      </div>
    )}
    
    <Handle
      type="source"
      position={Position.Bottom}
      className="!bg-teal-700 !w-3 !h-3 !border-2 !border-white"
    />
  </div>
));
JumpNode.displayName = 'JumpNode';
