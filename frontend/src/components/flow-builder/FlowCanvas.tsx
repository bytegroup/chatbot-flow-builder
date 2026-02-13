'use client';

import {useCallback, useRef, DragEvent} from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    Connection,
    NodeTypes,
    BackgroundVariant,
    useReactFlow,
    Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {useFlowStore} from '@/lib/store/flow-store';
import {
    ApiNode,
    ConditionNode,
    EndNode,
    InputNode,
    JumpNode,
    MessageNode,
    DelayNode,
    StartNode,
} from "@/components/flow-builder/nodes";

const nodeTypes: NodeTypes = {
    start: StartNode,
    end: EndNode,
    message: MessageNode,
    input: InputNode,
    condition: ConditionNode,
    api: ApiNode,
    delay: DelayNode,
    jump: JumpNode,
};

interface FlowCanvasProps {
    flowId?: string
}

export default function FlowCanvas({flowId}: FlowCanvasProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const {screenToFlowPosition} = useReactFlow();

    const {
        nodes,
        edges,
        viewport,
        onNodesChange,
        onEdgesChange,
        setViewport,
        selectNode,
        addNode,
    } = useFlowStore();

    const onConnect = useCallback(
        (connection: Connection) => {
            if (!connection.source || !connection.target) return;

            const newEdge = {
                id: `edge-${Date.now()}`,
                source: connection.source,
                target: connection.target,
                sourceHandle: connection.sourceHandle ?? null,
                targetHandle: connection.targetHandle ?? null,
                type: 'smoothstep',
                animated: false,
            };

            useFlowStore.setState({
                edges: addEdge(newEdge, edges),
                isDirty: true,
            });
        },
        [edges]
    );

    const onNodeClick = useCallback((event: any, node: any) => {
        selectNode(node);
    }, [selectNode]);

    const onPaneClick = useCallback(() => {
        selectNode(null);
    }, [selectNode]);

    const onDragOver = useCallback((event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (!type) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            addNode(type as any, position);
        },
        [screenToFlowPosition, addNode]
    );

    return (
        <div ref={reactFlowWrapper} className="h-full w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
                defaultViewport={viewport}
                onViewportChange={setViewport}
                minZoom={0.2}
                maxZoom={4}
                snapToGrid
                snapGrid={[15, 15]}
            >
                <Background variant={BackgroundVariant.Dots} gap={15} size={1}/>
                <Controls/>
                <MiniMap
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                />

                <Panel position="top-left" className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg">
                    <div className="text-sm">
                        <span className="font-semibold">{nodes.length}</span> nodes
                        <span className="mx-2">•</span>
                        <span className="font-semibold">{edges.length}</span> connections
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}
