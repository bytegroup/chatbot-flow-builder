'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, Search, Filter, MoreVertical, 
  Edit, Copy, Trash2, Play, Pause, Download 
} from 'lucide-react';
import { toast } from 'sonner';

export default function FlowsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['flows', search, statusFilter, page],
    queryFn: () => api.getFlows({ 
      search, 
      status: statusFilter || undefined, 
      page, 
      limit: 12 
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteFlow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      toast.success('Flow deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete flow');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => 
      api.duplicateFlow(id, { name, description: 'Duplicated flow' }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      toast.success('Flow duplicated successfully');
      router.push(`/flows/${data._id}`);
    },
    onError: () => {
      toast.error('Failed to duplicate flow');
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => api.activateFlow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      toast.success('Flow activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to activate flow');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.deactivateFlow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      toast.success('Flow deactivated successfully');
    },
    onError: () => {
      toast.error('Failed to deactivate flow');
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
      setMenuOpen(null);
    }
  };

  const handleDuplicate = (id: string, name: string) => {
    const newName = prompt('Enter name for duplicated flow:', `Copy of ${name}`);
    if (newName) {
      duplicateMutation.mutate({ id, name: newName });
    }
    setMenuOpen(null);
  };

  const handleExport = async (id: string) => {
    try {
      const data = await api.exportFlow(id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flow-${id}.json`;
      a.click();
      toast.success('Flow exported successfully');
    } catch (error) {
      toast.error('Failed to export flow');
    }
    setMenuOpen(null);
  };

  const flows = data?.flows || [];
  const pagination = data?.pagination;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Flows</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and organize your chatbot flows
          </p>
        </div>
        <Link href="/flows/new" className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          New Flow
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search flows..."
              className="input pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input pl-10 pr-8"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && flows.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">No flows found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {search || statusFilter 
              ? 'Try adjusting your filters' 
              : 'Create your first chatbot flow to get started'}
          </p>
          {!search && !statusFilter && (
            <Link href="/flows/new" className="btn-primary inline-flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Flow
            </Link>
          )}
        </div>
      )}

      {/* Flow Grid */}
      {!isLoading && flows.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flows.map((flow: any) => (
              <div
                key={flow._id}
                className="card hover:shadow-lg transition-all group relative"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${flow.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                    ${flow.status === 'draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                    ${flow.status === 'inactive' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400' : ''}
                  `}>
                    {flow.status}
                  </span>

                  {/* Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === flow._id ? null : flow._id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {menuOpen === flow._id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setMenuOpen(null)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                          <button
                            onClick={() => router.push(`/flows/${flow._id}`)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDuplicate(flow._id, flow.name)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </button>
                          {flow.status === 'active' ? (
                            <button
                              onClick={() => deactivateMutation.mutate(flow._id)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                            >
                              <Pause className="w-4 h-4" />
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => activateMutation.mutate(flow._id)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                            >
                              <Play className="w-4 h-4" />
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => handleExport(flow._id)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          >
                            <Download className="w-4 h-4" />
                            Export
                          </button>
                          <hr className="my-1 border-gray-200 dark:border-gray-700" />
                          <button
                            onClick={() => handleDelete(flow._id, flow.name)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 w-full text-left"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Flow Info */}
                <Link href={`/frontend/src/app/flows/${flow._id}`}>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {flow.name}
                  </h3>
                  {flow.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {flow.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{flow.nodes?.length || 0} nodes</span>
                    <span>•</span>
                    <span>{flow.edges?.length || 0} connections</span>
                  </div>

                  {flow.tags && flow.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {flow.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {flow.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-gray-500">
                          +{flow.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Updated {new Date(flow.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
