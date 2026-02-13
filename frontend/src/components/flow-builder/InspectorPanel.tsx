"use client";

import { useFlowStore } from "@/lib/store/flow-store";

export default function InspectorPanel() {
    const selectedNode = useFlowStore((s) => s.selectedNode);

    if (!selectedNode) {
        return <div className="p-4 text-gray-500">Select a node</div>;
    }

    return (
        <div className="p-4">
            <h3 className="font-semibold mb-2">Node Settings</h3>
            <div>ID: {selectedNode.id}</div>
            <div>Type: {selectedNode.type}</div>
        </div>
    );
}