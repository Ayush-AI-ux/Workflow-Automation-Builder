// src/ExecutionHistory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  ArrowLeft,
  Filter,
  Search,
  Trash2,
  Eye,
  Calendar,
  Zap,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ExecutionHistory() {
  const navigate = useNavigate();
  const [executions, setExecutions] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workflowFilter, setWorkflowFilter] = useState('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadExecutionHistory();
  }, [page, statusFilter, workflowFilter]);

  const loadExecutionHistory = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (workflowFilter !== 'all') {
        params.append('workflowId', workflowFilter);
      }
      
      const response = await api.get(`/api/execution-history?${params}`);
      
      if (response.data.success) {
        setExecutions(response.data.executions);
        setWorkflows(response.data.workflows || []);
        setTotal(response.data.total);
        setTotalPages(response.data.pages);
      }
    } catch (error) {
      console.error('Error loading execution history:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewExecutionDetails = async (runId) => {
    try {
      const response = await api.get(`/api/execution-history/${runId}`);
      if (response.data.success) {
        setSelectedExecution(response.data.execution);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error loading execution details:', error);
      alert('Failed to load execution details');
    }
  };

  const deleteExecution = async (runId) => {
    if (!window.confirm('Are you sure you want to delete this execution log?')) return;
    
    try {
      await api.delete(`/api/execution-history/${runId}`);
      alert('Execution log deleted successfully');
      loadExecutionHistory();
    } catch (error) {
      console.error('Error deleting execution:', error);
      alert('Failed to delete execution log');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'running':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      failed: 'bg-rose-100 text-rose-700 border-rose-200',
      running: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (createdAt, updatedAt) => {
    const start = new Date(createdAt);
    const end = new Date(updatedAt);
    const diff = Math.abs(end - start);
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  if (loading && executions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-medium">Loading Execution History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/home')}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </button>
            </div>
            <button
              onClick={loadExecutionHistory}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Execution History</h1>
          <p className="text-slate-600">View and manage all workflow execution logs</p>
        </div>

        {/* Filters */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="running">Running</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Workflow Filter
              </label>
              <select
                value={workflowFilter}
                onChange={(e) => {
                  setWorkflowFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Workflows</option>
                {workflows.map(workflow => (
                  <option key={workflow._id} value={workflow._id}>
                    {workflow.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                Total: <span className="font-semibold text-slate-800">{total}</span> executions
              </div>
            </div>
          </div>
        </div>

        {/* Executions List */}
        {executions.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-12 text-center border border-slate-200/50 shadow-sm">
            <Clock className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Executions Yet</h3>
            <p className="text-slate-600 mb-6">Run some workflows to see execution history here</p>
            <button
              onClick={() => navigate('/home')}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg"
            >
              Go to Workflows
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {executions.map(execution => (
              <div
                key={execution.runId}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(execution.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg text-slate-800">
                          {execution.workflowId?.name || 'Unknown Workflow'}
                        </h3>
                        {getStatusBadge(execution.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(execution.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>Duration: {getDuration(execution.createdAt, execution.updatedAt)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4" />
                          <span className="font-mono text-xs">{execution.runId.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => viewExecutionDetails(execution.runId)}
                      className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-all duration-200 shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => deleteExecution(execution.runId)}
                      className="p-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-lg transition-all duration-200 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            
            <span className="text-slate-700 font-medium">
              Page {page} of {totalPages}
            </span>
            
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedExecution && (
        <ExecutionDetailModal
          execution={selectedExecution}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedExecution(null);
          }}
        />
      )}
    </div>
  );
}

// Execution Detail Modal Component
function ExecutionDetailModal({ execution, onClose }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-emerald-600';
      case 'failed': return 'text-rose-600';
      case 'running': return 'text-blue-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Execution Details</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Workflow</p>
                <p className="font-medium text-slate-800">{execution.workflowId?.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Status</p>
                <p className={`font-medium ${getStatusColor(execution.status)}`}>
                  {execution.status.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Run ID</p>
                <p className="font-mono text-sm text-slate-800">{execution.runId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Executed At</p>
                <p className="text-sm text-slate-800">
                  {new Date(execution.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Execution Details */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Execution Details</h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <pre className="text-sm text-slate-700 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(execution.details, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}