'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useFlowStore } from '@/lib/store/flow-store';
import { ReactFlowProvider } from '@xyflow/react';
import FlowCanvas from '@/components/flow-builder/FlowCanvas';
import NodePalette from '@/components/flow-builder/NodePalette';
import PropertyPanel from '@/components/flow-builder/PropertyPanel';
import Toolbar from '@/components/flow-builder/Toolbar';
import ChatPreview from '@/components/chat/ChatPreview';

export default function FlowBuilderPage() {
  const params = useParams();
  const flowId = params.id as string;
  const { setFlowData, reset } = useFlowStore();

  const { data: flow, isLoading } = useQuery({
    queryKey: ['flow', flowId],
    queryFn: () => api.getFlow(flowId),
    enabled: flowId !== 'new',
  });

  useEffect(() => {
    if (flowId === 'new') {
      // Create new flow
      reset();
      useFlowStore.setState({
        flowName: 'Untitled Flow',
        flowDescription: '',
        flowStatus: 'draft',
      });
    } else if (flow) {
      setFlowData(flow);
    }
  }, [flow, flowId, setFlowData, reset]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (flowId === 'new') return;

    const interval = setInterval(() => {
      const { isDirty, nodes, edges, viewport } = useFlowStore.getState();
      if (isDirty && flowId) {
        api.updateFlow(flowId, { nodes, edges, viewport })
          .then(() => {
            useFlowStore.setState({ isDirty: false, lastSaved: new Date() });
          })
          .catch((error) => {
            console.error('Auto-save failed:', error);
          });
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [flowId]);

  if (isLoading && flowId !== 'new') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading flow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Toolbar flowId={flowId} />
      
      <div className="flex-1 flex overflow-hidden">
        <NodePalette />
        
        <div className="flex-1 relative">
          <ReactFlowProvider>
            <FlowCanvas flowId={flowId} />
          </ReactFlowProvider>
        </div>

        <div className="w-96 flex flex-col border-l border-gray-200 dark:border-gray-700">
          <div className="flex-1 overflow-hidden">
            <PropertyPanel />
          </div>
          <div className="h-96 border-t border-gray-200 dark:border-gray-700">
            {flowId !== 'new' && <ChatPreview flowId={flowId} />}
          </div>
        </div>
      </div>
    </div>
  );
}
