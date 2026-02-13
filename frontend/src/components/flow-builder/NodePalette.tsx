"use client";

import { PlusCircle } from "lucide-react";
import { useCallback } from "react";
import { v4 as uuid } from "uuid";
import { useFlowStore } from "@/lib/store/flow-store";

const NODE_TYPES = [
    { type: "message", label: "Message" },
    { type: "condition", label: "Condition" },
    { type: "action", label: "Action" },
];

export default function NodePalette() {
    const addNode = useFlowStore((s) => s.addNode);

    const handleAddNode = useCallback(
        (type: string) => {
            addNode({
                id: uuid(),
                type,
                position: { x: 250, y: 150 },
                data: { label: `${type} node` },
            });
        },
        [addNode]
    );

    return (
        <div className="w-64 border-r bg-white p-4 space-y-3">
            <h2 className="font-semibold text-sm text-gray-600">Node Palette</h2>

            {NODE_TYPES.map((node) => (
                <button
                    key={node.type}
                    onClick={() => handleAddNode(node.type)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                >
                    <PlusCircle size={16} />
                    {node.label}
                </button>
            ))}
        </div>
    );
}