"use client";

import Link from "next/link";
import { Bot, Workflow, Zap, Shield } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

export default function LandingPage() {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-4 bg-blue-900 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <Bot className="text-blue-600" />
                    ChatFlow Builder
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/login"
                        className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Sign Up
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="flex flex-col items-center text-center px-6 py-20">
                <h1 className="text-4xl md:text-5xl font-bold max-w-3xl leading-tight">
                    Build Intelligent Chatbot Flows Visually
                </h1>

                <p className="mt-6 text-gray-300 max-w-2xl text-lg">
                    Design, test, and deploy chatbot conversation flows with a powerful
                    drag-and-drop builder and real-time preview.
                </p>

                <div className="mt-8 flex gap-4">
                    <Link
                        href="/register"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                        Get Started Free
                    </Link>
                    <Link
                        href="/login"
                        className="px-6 py-3 border rounded-lg hover:bg-gray-50 text-sm"
                    >
                        Login
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section className="px-6 pb-20">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Workflow className="text-blue-600" />}
                        title="Visual Flow Builder"
                        description="Drag-and-drop nodes to design complex chatbot logic."
                    />
                    <FeatureCard
                        icon={<Zap className="text-blue-600" />}
                        title="Live Preview"
                        description="Instantly test chatbot conversations in real time."
                    />
                    <FeatureCard
                        icon={<Shield className="text-blue-600" />}
                        title="Secure & Scalable"
                        description="JWT authentication with backend synchronization."
                    />
                </div>
            </section>

            <footer className="text-center text-sm text-white py-6 border-t bg-blue-900">
                © {new Date().getFullYear()} ChatFlow Builder
            </footer>
        </div>
    );
}

function FeatureCard({
                         icon,
                         title,
                         description,
                     }: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="bg-blue-900 p-6 rounded-xl shadow-sm border hover:shadow-md transition">
            <div className="mb-4">{icon}</div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-white mt-2">{description}</p>
        </div>
    );
}