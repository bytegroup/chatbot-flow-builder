'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Plus, TrendingUp, Activity, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['flow-stats'],
    queryFn: () => api.getFlowStats(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's an overview of your chatbot flows.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Flows */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Flows</p>
              <p className="text-3xl font-bold">{stats?.totalFlows || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Active Flows */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active</p>
              <p className="text-3xl font-bold text-green-600">{stats?.activeFlows || 0}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Draft Flows */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Draft</p>
              <p className="text-3xl font-bold text-yellow-600">{stats?.draftFlows || 0}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Inactive Flows */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Inactive</p>
              <p className="text-3xl font-bold text-gray-600">{stats?.inactiveFlows || 0}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <XCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Create New Flow */}
        <Link href="/flows/new" className="card hover:shadow-lg transition-all hover:scale-105 cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Plus className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Create New Flow</h3>
              <p className="text-sm opacity-90">Start building a chatbot</p>
            </div>
          </div>
        </Link>

        {/* View All Flows */}
        <Link href="/flows" className="card hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 border-primary">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">View All Flows</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your flows</p>
            </div>
          </div>
        </Link>

        {/* Analytics */}
        <div className="card hover:shadow-lg transition-shadow opacity-75 cursor-not-allowed">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Flows */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Recent Flows</h2>
          <Link href="/flows" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>

        {stats?.recentFlows && stats.recentFlows.length > 0 ? (
          <div className="space-y-3">
            {stats.recentFlows.map((flow: any) => (
              <Link
                key={flow._id}
                href={`/flows/${flow._id}`}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{flow.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Updated {new Date(flow.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${flow.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                  ${flow.status === 'draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                  ${flow.status === 'inactive' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400' : ''}
                `}>
                  {flow.status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No flows yet</p>
            <Link href="/flows/new" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Flow
            </Link>
          </div>
        )}
      </div>

      {/* Popular Tags */}
      {stats?.popularTags && stats.popularTags.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-xl font-bold mb-4">Popular Tags</h2>
          <div className="flex flex-wrap gap-2">
            {stats.popularTags.map((tag: any) => (
              <span
                key={tag.tag}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
              >
                {tag.tag} ({tag.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
