import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Play, 
  Plus, 
  Settings, 
  Activity, 
  Mail, 
  Table, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Trash2, 
  GitBranch, 
  Zap,
  BarChart3,
  LogOut,
  Search,
  Download,
  Loader,
  User,
  ChevronDown
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    successRate: 0,
    totalExecutions: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // API Base URL - adjust according to your backend
  const API_BASE_URL = "http://localhost:3001";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      initializeDashboard(token);
    }
  }, [navigate]);

  const initializeDashboard = async (token) => {
    try {
      setLoading(true);
      
      // Verify token and get user info
      const userResponse = await axios.get(`${API_BASE_URL}/home`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userResponse.data.success) {
        setUser({ email: userResponse.data.email || userResponse.data.user?.email });
        
        // Load dashboard data
        await Promise.all([
          loadWorkflows(token),
          loadExecutionLogs(token),
          loadStats(token)
        ]);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Dashboard initialization error:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // Load workflows from database
  const loadWorkflows = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/workflows`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setWorkflows(response.data.workflows || []);
      }
    } catch (error) {
      console.error("Error loading workflows:", error);
      setError("Failed to load workflows");
    }
  };

  // Load execution logs from database
  const loadExecutionLogs = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setRecentLogs(response.data.logs || []);
      }
    } catch (error) {
      console.error("Error loading logs:", error);
      setError("Failed to load execution logs");
    }
  };

  // Load dashboard statistics from database
  const loadStats = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      // Calculate stats from loaded data if API fails
      calculateStatsFromData();
    }
  };

  // Fallback method to calculate stats from loaded data
  const calculateStatsFromData = () => {
    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.status === 'active').length;
    const totalExecutions = workflows.reduce((sum, w) => sum + (w.totalRuns || 0), 0);
    const successfulRuns = recentLogs.filter(log => log.status === 'success').length;
    const successRate = recentLogs.length > 0 ? Math.round((successfulRuns / recentLogs.length) * 100) : 0;

    setStats({
      totalWorkflows,
      activeWorkflows,
      successRate,
      totalExecutions
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleCreateWorkflow = () => {
    navigate("/workflow-editor");
  };

  const handleRunWorkflow = async (workflowId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/workflows/${workflowId}/run`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Reload logs after successful execution
        loadExecutionLogs(token);
        loadStats(token);
        alert("Workflow executed successfully!");
      } else {
        alert("Failed to execute workflow: " + response.data.message);
      }
    } catch (error) {
      console.error("Error running workflow:", error);
      alert("Failed to execute workflow");
    }
  };

  const handleEditWorkflow = (workflowId) => {
    navigate(`/workflow-editor/${workflowId}`);
  };

  const handleDeleteWorkflow = async (workflowId) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_BASE_URL}/api/workflows/${workflowId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Reload workflows after deletion
        loadWorkflows(token);
        loadStats(token);
        alert("Workflow deleted successfully!");
      } else {
        alert("Failed to delete workflow: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting workflow:", error);
      alert("Failed to delete workflow");
    }
  };

  const exportLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/logs/export`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `workflow-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting logs:", error);
      alert("Failed to export logs");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Clock className="w-4 h-4 text-amber-400" />;
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || workflow.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getUserInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-medium">Failed to load dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Workflow Automation Builder
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-600 font-medium hidden sm:block">Welcome back!</span>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 bg-white/60 hover:bg-white/80 px-3 py-2 rounded-xl border border-slate-200/50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium text-sm shadow-sm">
                  {getUserInitials(user.email)}
                </div>
                <span className="text-slate-700 font-medium hidden sm:block max-w-32 truncate">
                  {user.email?.split('@')[0]}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200/50 py-2 z-50 backdrop-blur-sm">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium shadow-sm">
                        {getUserInitials(user.email)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{user.email?.split('@')[0]}</p>
                        <p className="text-sm text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/60 backdrop-blur-sm px-6 py-3 border-b border-slate-200/50">
        <div className="flex space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'workflows', label: 'Workflows', icon: GitBranch },
            { id: 'logs', label: 'Execution Logs', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <p className="text-rose-600">{error}</p>
        </div>
      )}

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Total Workflows</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.totalWorkflows}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
                    <GitBranch className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Active Workflows</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.activeWorkflows}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Success Rate</p>
                    <p className="text-3xl font-bold text-amber-600">{stats.successRate}%</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-sm">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Total Executions</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.totalExecutions}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-slate-800">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleCreateWorkflow}
                  className="flex items-center space-x-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] font-medium shadow-lg shadow-indigo-200 hover:shadow-xl"
                >
                  <Plus className="w-6 h-6" />
                  <span>Create New Workflow</span>
                </button>
                <button 
                  onClick={() => setActiveTab('logs')}
                  className="flex items-center space-x-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] font-medium shadow-lg shadow-emerald-200 hover:shadow-xl"
                >
                  <Activity className="w-6 h-6" />
                  <span>View Execution Logs</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 shadow-sm">
              <h2 className="text-xl font-semibold mb-6 text-slate-800">
                Recent Activity
              </h2>
              {recentLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No recent activity found</p>
                  <p className="text-sm">Create and run your first workflow to see activity here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-slate-200/30 hover:border-slate-300/50 transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(log.status)}
                        <div>
                          <p className="font-medium text-slate-800">{log.workflowName}</p>
                          <p className="text-sm text-slate-500">{log.message}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-slate-500">
                        <p className="font-medium">{new Date(log.timestamp).toLocaleDateString()}</p>
                        <p>{log.duration}s</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search workflows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/60 border border-slate-200/50 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white/60 border border-slate-200/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <button
                onClick={handleCreateWorkflow}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] font-medium shadow-lg shadow-indigo-200 hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span>Create Workflow</span>
              </button>
            </div>

            {/* Workflows Grid */}
            {workflows.length === 0 ? (
              <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm">
                <GitBranch className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-xl font-semibold mb-2 text-slate-800">No Workflows Yet</h3>
                <p className="text-slate-500 mb-6">Create your first workflow to get started with automation</p>
                <button
                  onClick={handleCreateWorkflow}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] font-medium shadow-lg shadow-indigo-200"
                >
                  Create Your First Workflow
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredWorkflows.map(workflow => (
                  <div key={workflow.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg text-slate-800">{workflow.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          workflow.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : workflow.status === 'paused'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {workflow.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-slate-500 text-sm mb-4">{workflow.description}</p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-slate-500">Success Rate</p>
                        <p className="font-semibold text-slate-800">{workflow.successRate || 0}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Total Runs</p>
                        <p className="font-semibold text-slate-800">{workflow.totalRuns || 0}</p>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-between">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRunWorkflow(workflow.id)}
                          className="flex items-center space-x-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-3 py-1.5 rounded-lg text-sm transition-all duration-200 font-medium shadow-sm"
                        >
                          <Play className="w-3 h-3" />
                          <span>Run</span>
                        </button>
                        <button
                          onClick={() => handleEditWorkflow(workflow.id)}
                          className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-all duration-200 font-medium shadow-sm"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        className="flex items-center space-x-1 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-3 py-1.5 rounded-lg text-sm transition-all duration-200 font-medium shadow-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Execution Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">
                Execution Logs
              </h2>
              <button 
                onClick={exportLogs}
                className="flex items-center space-x-2 bg-white/60 hover:bg-white/80 px-4 py-2.5 rounded-xl transition-all duration-200 border border-slate-200/50 shadow-sm hover:shadow-md font-medium text-slate-700"
              >
                <Download className="w-4 h-4" />
                <span>Export Logs</span>
              </button>
            </div>
            
            {recentLogs.length === 0 ? (
              <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm">
                <Activity className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-xl font-semibold mb-2 text-slate-800">No Execution Logs</h3>
                <p className="text-slate-500">Run some workflows to see execution logs here</p>
              </div>
            ) : (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Workflow</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Timestamp</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Duration</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50">
                      {recentLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(log.status)}
                              <span className="capitalize text-slate-800 font-medium">{log.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">{log.workflowName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-800 font-medium">{log.duration}s</td>
                          <td className="px-6 py-4 text-slate-600">{log.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}