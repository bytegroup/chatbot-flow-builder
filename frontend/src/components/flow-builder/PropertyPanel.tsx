"use client";

import { useFlowStore } from "@/lib/store/flow-store";

export default function PropertyPanel() {
    const selectedNode = useFlowStore((s) => s.selectedNode);
    const updateNode = useFlowStore((s) => s.updateNode);

    if (!selectedNode) {
        return (
            <div className="w-72 border-l bg-white p-4 text-gray-500">
                Select a node to edit properties
            </div>
        );
    }

    return (
        <div className="w-72 border-l bg-white p-4 space-y-4">
            <h2 className="font-semibold text-sm">Node Properties</h2>

            <div>
                <label className="block text-xs text-gray-500 mb-1">Label</label>
                <input
                    value={String(selectedNode.data?.label) || ""}
                    onChange={(e) =>
                        updateNode(selectedNode.id, {
                            data: { ...selectedNode.data, label: e.target.value },
                        })
                    }
                    className="w-full border rounded px-2 py-1 text-sm"
                />
            </div>

            <div className="text-xs text-gray-500">
                <div>ID: {selectedNode.id}</div>
                <div>Type: {selectedNode.type}</div>
            </div>
        </div>
    );
}