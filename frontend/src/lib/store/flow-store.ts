import { create } from 'zustand';
import { Node, Edge, OnNodesChange, OnEdgesChange, applyNodeChanges, applyEdgeChanges, Viewport } from '@xyflow/react';

export type NodeType = 'start' | 'end' | 'message' | 'input' | 'condition' | 'api' | 'delay' | 'jump';

interface FlowState {
  // Flow data
  flowId: string | null;
  flowName: string;
  flowDescription: string;
  flowStatus: 'draft' | 'active' | 'inactive';
  
  // Canvas
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  
  // UI state
  selectedNode: Node | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  
  // Actions
  setFlowId: (id: string) => void;
  setFlowData: (data: any) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  setViewport: (viewport: Viewport) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNode: (nodeId: string, data: any) => void;
  deleteNode: (nodeId: string) => void;
  selectNode: (node: Node | null) => void;
  setIsDirty: (dirty: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setSaved: () => void;
  reset: () => void;
}

const initialState = {
  flowId: null,
  flowName: 'Untitled Flow',
  flowDescription: '',
  flowStatus: 'draft' as const,
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedNode: null,
  isDirty: false,
  isSaving: false,
  lastSaved: null,
};

export const useFlowStore = create<FlowState>((set,
                                               get) => ({
  ...initialState,

  setFlowId: (id) => set({ flowId: id }),

  setFlowData: (data) =>
    set({
      flowId: data._id,
      flowName: data.name,
      flowDescription: data.description || '',
      flowStatus: data.status,
      nodes: data.nodes || [],
      edges: data.edges || [],
      viewport: data.viewport || { x: 0, y: 0, zoom: 1 },
      isDirty: false,
      lastSaved: data.updatedAt ? new Date(data.updatedAt) : null,
    }),

  setNodes: (nodes) => set({ nodes, isDirty: true }),

  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true,
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    });
  },

  setViewport: (viewport) => set({ viewport }),

  addNode: (type, position) => {
    const id = `${type}-${Date.now()}`;
    const newNode: Node = {
      id,
      type,
      position,
      data: getDefaultNodeData(type),
    };

    set({
      nodes: [...get().nodes, newNode],
      isDirty: true,
    });
  },

  updateNode: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
      isDirty: true,
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
      isDirty: true,
    });
  },

  selectNode: (node) => set({ selectedNode: node }),

  setIsDirty: (dirty) => set({ isDirty: dirty }),

  setIsSaving: (saving) => set({ isSaving: saving }),

  setSaved: () =>
    set({
      isDirty: false,
      isSaving: false,
      lastSaved: new Date(),
    }),

  reset: () => set(initialState),
}));

// Default node data for each type
function getDefaultNodeData(type: NodeType) {
  const defaults: Record<NodeType, any> = {
    start: {
      label: 'Start',
    },
    end: {
      label: 'End',
    },
    message: {
      label: 'Message',
      message: '',
    },
    input: {
      label: 'User Input',
      inputType: 'text',
      placeholder: '',
      variableName: '',
    },
    condition: {
      label: 'Condition',
      conditions: [],
    },
    api: {
      label: 'API Call',
      apiConfig: {
        url: '',
        method: 'GET',
      },
    },
    delay: {
      label: 'Delay',
      delay: 1000,
    },
    jump: {
      label: 'Jump',
      targetNodeId: '',
    },
  };

  return defaults[type] || {};
}
