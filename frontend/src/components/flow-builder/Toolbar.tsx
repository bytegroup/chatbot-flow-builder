"use client";

import { Save, Play, Trash2 } from "lucide-react";
import { useFlowStore } from "@/lib/store/flow-store";
import api from "@/lib/api/axios";
import { toast } from "sonner";

export default function Toolbar({ flowId }: { flowId: string }) {
    const nodes = useFlowStore((s) => s.nodes);
    const edges = useFlowStore((s) => s.edges);

    const handleSave = async () => {
        try {
            await api.patch(`/flows/${flowId}`, {
                nodes,
                edges,
            });
            toast.success("Flow saved successfully");
        } catch {
            toast.error("Failed to save flow");
        }
    };

    return (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
            <div className="font-semibold text-sm">Flow Builder</div>

            <div className="flex gap-2">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-3 py-1 text-sm border rounded hover:bg-gray-50"
                >
                    <Save size={16} />
                    Save
                </button>

                <button className="flex items-center gap-2 px-3 py-1 text-sm border rounded hover:bg-gray-50">
                    <Play size={16} />
                    Test
                </button>

                <button className="flex items-center gap-2 px-3 py-1 text-sm border rounded hover:bg-red-50 text-red-600">
                    <Trash2 size={16} />
                    Clear
                </button>
            </div>
        </div>
    );
}