"use client";

import Toolbar from "./Toolbar";
import NodePalette from "./NodePalette";
import FlowCanvas from "@/components/flow-builder/FlowCanvas";
import InspectorPanel from "./InspectorPanel";

export default function BuilderLayout({ flowId }: { flowId: string }) {
    return (
        <div className="flex flex-col h-screen w-full">
            <Toolbar flowId={flowId} />

            <div className="flex flex-1 overflow-hidden">
                <div className="w-64 border-r">
                    <NodePalette />
                </div>

                <div className="flex-1">
                    <FlowCanvas flowId={flowId} />
                </div>

                <div className="w-72 border-l">
                    <InspectorPanel />
                </div>
            </div>
        </div>
    );
}