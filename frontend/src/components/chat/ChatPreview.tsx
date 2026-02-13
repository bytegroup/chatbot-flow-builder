"use client";

import { useFlowStore } from "@/lib/store/flow-store";
import { useState } from "react";

export default function ChatPreview({ flowId }: { flowId: string }) {
    const nodes = useFlowStore((s) => s.nodes);
    const [messages, setMessages] = useState<string[]>([]);

    const startChat = () => {
        const firstMessage = nodes.find((n) => n.type === "message");
        if (firstMessage) {
            setMessages([String(firstMessage.data?.label) || "Hello"]);
        }
    };

    return (
        <div className="w-80 border-l bg-gray-50 p-4 flex flex-col">
            <h2 className="font-semibold text-sm mb-3">Live Preview</h2>

            <div className="flex-1 bg-white rounded p-3 overflow-y-auto text-sm space-y-2">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-2 rounded"
                    >
                        {msg}
                    </div>
                ))}
            </div>

            <button
                onClick={startChat}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700"
            >
                Start Preview
            </button>
        </div>
    );
}