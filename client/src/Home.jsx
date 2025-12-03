// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "./api"; // Use centralized API
// import { 
//   Play, 
//   Plus, 
//   Settings, 
//   Activity, 
//   Mail, 
//   Table, 
//   MessageSquare, 
//   Clock, 
//   CheckCircle, 
//   XCircle, 
//   Edit3, 
//   Trash2, 
//   GitBranch, 
//   Zap,
//   BarChart3,
//   LogOut,
//   Search,
//   Download,
//   Loader,
//   User,
//   ChevronDown
// } from "lucide-react";

// export default function Home() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [workflows, setWorkflows] = useState([]);
//   const [recentLogs, setRecentLogs] = useState([]);
//   const [stats, setStats] = useState({
//     totalWorkflows: 0,
//     activeWorkflows: 0,
//     successRate: 0,
//     totalExecutions: 0
//   });
//   const [activeTab, setActiveTab] = useState('overview');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showUserMenu, setShowUserMenu] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const userStr = localStorage.getItem("user");

//     if (!token) {
//       navigate("/login");
//     } else {
//       if (userStr) {
//         setUser(JSON.parse(userStr));
//       }
//       initializeDashboard();
//     }
//   }, [navigate]);

//   const initializeDashboard = async () => {
//     try {
//       setLoading(true);
      
//       // Load all dashboard data
//       await Promise.all([
//         loadWorkflows(),
//         loadExecutionLogs()
//       ]);
      
//       setLoading(false);
//     } catch (error) {
//       console.error("Dashboard initialization error:", error);
//       setLoading(false);
//       if (error.response?.status === 401) {
//         navigate("/login");
//       }
//     }
//   };

//   // Load workflows from backend
//   const loadWorkflows = async () => {
//     try {
//       const response = await api.get("/api/workflows");
//       setWorkflows(response.data || []);
//       calculateStats(response.data || []);
//     } catch (error) {
//       console.error("Error loading workflows:", error);
//       setError("Failed to load workflows");
//     }
//   };

//   // Load execution logs from backend
//   const loadExecutionLogs = async () => {
//     try {
//       // Note: You may need to create this endpoint in your backend
//       const logs = []; // Placeholder - implement based on your backend
//       setRecentLogs(logs);
//     } catch (error) {
//       console.error("Error loading logs:", error);
//     }
//   };

//   // Calculate statistics from workflows
//   const calculateStats = (workflowsData) => {
//     const totalWorkflows = workflowsData.length;
//     const activeWorkflows = totalWorkflows; // All workflows are considered active
    
//     setStats({
//       totalWorkflows,
//       activeWorkflows,
//       successRate: 0, // Will be calculated from execution logs
//       totalExecutions: 0 // Will be calculated from execution logs
//     });
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const handleCreateWorkflow = () => {
//     navigate("/workflow-editor");
//   };

//   const handleRunWorkflow = async (workflowId) => {
//     try {
//       const response = await api.post("/api/execute/run", {
//         workflowId: workflowId
//       });

//       if (response.data.runId) {
//         alert(`Workflow started! Run ID: ${response.data.runId}`);
//         // Reload data after execution
//         loadWorkflows();
//       }
//     } catch (error) {
//       console.error("Error running workflow:", error);
//       alert("Failed to execute workflow: " + (error.response?.data?.error || error.message));
//     }
//   };

//   const handleEditWorkflow = (workflowId) => {
//     navigate(`/workflow-editor?id=${workflowId}`);
//   };

//   const handleDeleteWorkflow = async (workflowId) => {
//     if (!window.confirm("Are you sure you want to delete this workflow?")) return;

//     try {
//       await api.delete(`/api/workflows/${workflowId}`);
//       alert("Workflow deleted successfully!");
//       // Reload workflows
//       loadWorkflows();
//     } catch (error) {
//       console.error("Error deleting workflow:", error);
//       alert("Failed to delete workflow: " + (error.response?.data?.error || error.message));
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'success':
//         return <CheckCircle className="w-4 h-4 text-emerald-400" />;
//       case 'failed':
//         return <XCircle className="w-4 h-4 text-rose-400" />;
//       default:
//         return <Clock className="w-4 h-4 text-amber-400" />;
//     }
//   };

//   const filteredWorkflows = workflows.filter(workflow => {
//     const matchesSearch = workflow.name?.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesSearch;
//   });

//   const getUserInitials = (email) => {
//     if (!email) return 'U';
//     return email.charAt(0).toUpperCase();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
//         <div className="text-center">
//           <Loader className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
//           <p className="text-slate-700 text-lg font-medium">Loading Dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
//         <div className="text-center">
//           <XCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
//           <p className="text-slate-700 text-lg font-medium">Failed to load dashboard</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-800">
//       {/* Header */}
//       <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4 shadow-sm">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
//                 <Zap className="w-6 h-6 text-white" />
//               </div>
//               <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
//                 Workflow Automation Builder
//               </h1>
//             </div>
//           </div>
//           <div className="flex items-center space-x-4">
//             <span className="text-slate-600 font-medium hidden sm:block">Welcome back!</span>
            
//             {/* User Profile Dropdown */}
//             <div className="relative">
//               <button
//                 onClick={() => setShowUserMenu(!showUserMenu)}
//                 className="flex items-center space-x-2 bg-white/60 hover:bg-white/80 px-3 py-2 rounded-xl border border-slate-200/50 transition-all duration-200 shadow-sm hover:shadow-md"
//               >
//                 <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium text-sm shadow-sm">
//                   {getUserInitials(user.email)}
//                 </div>
//                 <span className="text-slate-700 font-medium hidden sm:block max-w-32 truncate">
//                   {user.name || user.email?.split('@')[0]}
//                 </span>
//                 <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
//               </button>

//               {/* Dropdown Menu */}
//               {showUserMenu && (
//                 <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200/50 py-2 z-50 backdrop-blur-sm">
//                   <div className="px-4 py-3 border-b border-slate-100">
//                     <div className="flex items-center space-x-3">
//                       <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium shadow-sm">
//                         {getUserInitials(user.email)}
//                       </div>
//                       <div>
//                         <p className="font-medium text-slate-800">{user.name || user.email?.split('@')[0]}</p>
//                         <p className="text-sm text-slate-500 truncate">{user.email}</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="py-1">
//                     <button className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-2">
//                       <Settings className="w-4 h-4" />
//                       <span>Settings</span>
//                     </button>
//                     <button 
//                       onClick={handleLogout}
//                       className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-2"
//                     >
//                       <LogOut className="w-4 h-4" />
//                       <span>Sign Out</span>
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Navigation Tabs */}
//       <nav className="bg-white/60 backdrop-blur-sm px-6 py-3 border-b border-slate-200/50">
//         <div className="flex space-x-2">
//           {[
//             { id: 'overview', label: 'Overview', icon: BarChart3 },
//             { id: 'workflows', label: 'Workflows', icon: GitBranch },
//           ].map(tab => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
//                 activeTab === tab.id
//                   ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
//                   : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
//               }`}
//             >
//               <tab.icon className="w-4 h-4" />
//               <span>{tab.label}</span>
//             </button>
//           ))}
//         </div>
//       </nav>

//       {/* Error Message */}
//       {error && (
//         <div className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
//           <p className="text-rose-600">{error}</p>
//         </div>
//       )}

//       <div className="p-6">
//         {/* Overview Tab */}
//         {activeTab === 'overview' && (
//           <div className="space-y-6">
//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//               <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-slate-500 text-sm font-medium">Total Workflows</p>
//                     <p className="text-3xl font-bold text-slate-800">{stats.totalWorkflows}</p>
//                   </div>
//                   <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
//                     <GitBranch className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-slate-500 text-sm font-medium">Active Workflows</p>
//                     <p className="text-3xl font-bold text-emerald-600">{stats.activeWorkflows}</p>
//                   </div>
//                   <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm">
//                     <CheckCircle className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-slate-500 text-sm font-medium">Success Rate</p>
//                     <p className="text-3xl font-bold text-amber-600">{stats.successRate}%</p>
//                   </div>
//                   <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-sm">
//                     <BarChart3 className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-slate-500 text-sm font-medium">Total Executions</p>
//                     <p className="text-3xl font-bold text-slate-800">{stats.totalExecutions}</p>
//                   </div>
//                   <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm">
//                     <Activity className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 shadow-sm">
//               <h2 className="text-xl font-semibold mb-6 text-slate-800">
//                 Quick Actions
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <button
//                   onClick={handleCreateWorkflow}
//                   className="flex items-center space-x-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] font-medium shadow-lg shadow-indigo-200 hover:shadow-xl"
//                 >
//                   <Plus className="w-6 h-6" />
//                   <span>Create New Workflow</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Workflows Tab */}
//         {activeTab === 'workflows' && (
//           <div className="space-y-6">
//             {/* Toolbar */}
//             <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
//                   <input
//                     type="text"
//                     placeholder="Search workflows..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="bg-white/60 border border-slate-200/50 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
//                   />
//                 </div>
//               </div>
//               <button
//                 onClick={handleCreateWorkflow}
//                 className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] font-medium shadow-lg shadow-indigo-200 hover:shadow-xl"
//               >
//                 <Plus className="w-4 h-4" />
//                 <span>Create Workflow</span>
//               </button>
//             </div>

//             {/* Workflows Grid */}
//             {workflows.length === 0 ? (
//               <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm">
//                 <GitBranch className="w-16 h-16 mx-auto mb-4 text-slate-400" />
//                 <h3 className="text-xl font-semibold mb-2 text-slate-800">No Workflows Yet</h3>
//                 <p className="text-slate-500 mb-6">Create your first workflow to get started with automation</p>
//                 <button
//                   onClick={handleCreateWorkflow}
//                   className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] font-medium shadow-lg shadow-indigo-200"
//                 >
//                   Create Your First Workflow
//                 </button>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//                 {filteredWorkflows.map(workflow => (
//                   <div key={workflow._id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
//                     <div className="flex items-start justify-between mb-4">
//                       <h3 className="font-semibold text-lg text-slate-800">{workflow.name}</h3>
//                     </div>
                    
//                     <p className="text-slate-500 text-sm mb-4">
//                       Created: {new Date(workflow.createdAt).toLocaleDateString()}
//                     </p>
                    
//                     {/* Actions */}
//                     <div className="flex justify-between">
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() => handleRunWorkflow(workflow._id)}
//                           className="flex items-center space-x-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-3 py-1.5 rounded-lg text-sm transition-all duration-200 font-medium shadow-sm"
//                         >
//                           <Play className="w-3 h-3" />
//                           <span>Run</span>
//                         </button>
//                         <button
//                           onClick={() => handleEditWorkflow(workflow._id)}
//                           className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-all duration-200 font-medium shadow-sm"
//                         >
//                           <Edit3 className="w-3 h-3" />
//                           <span>Edit</span>
//                         </button>
//                       </div>
//                       <button
//                         onClick={() => handleDeleteWorkflow(workflow._id)}
//                         className="flex items-center space-x-1 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-3 py-1.5 rounded-lg text-sm transition-all duration-200 font-medium shadow-sm"
//                       >
//                         <Trash2 className="w-3 h-3" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//       <button
//         onClick={() => navigate('/execution-history')}
//         className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition-all duration-200 border border-slate-200"
//       >
//         <Clock className="w-4 h-4" />
//         <span>Execution History</span>
//       </button>
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "./api"; // Use centralized API
// import { 
//   Play, 
//   Plus, 
//   Settings, 
//   Activity, 
//   Mail, 
//   Table, 
//   MessageSquare, 
//   Clock, 
//   CheckCircle, 
//   XCircle, 
//   Edit3, 
//   Trash2, 
//   GitBranch, 
//   Zap,
//   BarChart3,
//   LogOut,
//   Search,
//   Download,
//   Loader,
//   User,
//   ChevronDown
// } from "lucide-react";

// export default function Home() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [workflows, setWorkflows] = useState([]);
//   const [recentLogs, setRecentLogs] = useState([]);
//   const [stats, setStats] = useState({
//     totalWorkflows: 0,
//     activeWorkflows: 0,
//     successRate: 0,
//     totalExecutions: 0
//   });
//   const [activeTab, setActiveTab] = useState('overview');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showUserMenu, setShowUserMenu] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const userStr = localStorage.getItem("user");

//     if (!token) {
//       navigate("/login");
//     } else {
//       if (userStr) {
//         setUser(JSON.parse(userStr));
//       }
//       initializeDashboard();
//     }
//   }, [navigate]);

//   const initializeDashboard = async () => {
//     try {
//       setLoading(true);
      
//       // Load all dashboard data
//       await Promise.all([
//         loadWorkflows(),
//         loadExecutionLogs()
//       ]);
      
//       setLoading(false);
//     } catch (error) {
//       console.error("Dashboard initialization error:", error);
//       setLoading(false);
//       if (error.response?.status === 401) {
//         navigate("/login");
//       }
//     }
//   };

//   // Load workflows from backend
//   const loadWorkflows = async () => {
//     try {
//       const response = await api.get("/api/workflows");
//       setWorkflows(response.data || []);
//       calculateStats(response.data || []);
//     } catch (error) {
//       console.error("Error loading workflows:", error);
//       setError("Failed to load workflows");
//     }
//   };

//   // Load execution logs from backend
//   const loadExecutionLogs = async () => {
//     try {
//       // Note: You may need to create this endpoint in your backend
//       const logs = []; // Placeholder - implement based on your backend
//       setRecentLogs(logs);
//     } catch (error) {
//       console.error("Error loading logs:", error);
//     }
//   };

//   // Calculate statistics from workflows
//   const calculateStats = (workflowsData) => {
//     const totalWorkflows = workflowsData.length;
//     const activeWorkflows = totalWorkflows; // All workflows are considered active
    
//     setStats({
//       totalWorkflows,
//       activeWorkflows,
//       successRate: 0, // Will be calculated from execution logs
//       totalExecutions: 0 // Will be calculated from execution logs
//     });
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const handleCreateWorkflow = () => {
//     navigate("/workflow-editor");
//   };

//   const handleRunWorkflow = async (workflowId) => {
//     try {
//       const response = await api.post("/api/execute/run", {
//         workflowId: workflowId
//       });

//       if (response.data.runId) {
//         alert(`Workflow started! Run ID: ${response.data.runId}`);
//         // Reload data after execution
//         loadWorkflows();
//       }
//     } catch (error) {
//       console.error("Error running workflow:", error);
//       alert("Failed to execute workflow: " + (error.response?.data?.error || error.message));
//     }
//   };

//   const handleEditWorkflow = (workflowId) => {
//     navigate(`/workflow-editor?id=${workflowId}`);
//   };

//   const handleDeleteWorkflow = async (workflowId) => {
//     if (!window.confirm("Are you sure you want to delete this workflow?")) return;

//     try {
//       await api.delete(`/api/workflows/${workflowId}`);
//       alert("Workflow deleted successfully!");
//       // Reload workflows
//       loadWorkflows();
//     } catch (error) {
//       console.error("Error deleting workflow:", error);
//       alert("Failed to delete workflow: " + (error.response?.data?.error || error.message));
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'success':
//         return <CheckCircle className="w-4 h-4 text-emerald-400" />;
//       case 'failed':
//         return <XCircle className="w-4 h-4 text-rose-400" />;
//       default:
//         return <Clock className="w-4 h-4 text-amber-400" />;
//     }
//   };

//   const filteredWorkflows = workflows.filter(workflow => {
//     const matchesSearch = workflow.name?.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesSearch;
//   });

//   const getUserInitials = (email) => {
//     if (!email) return 'U';
//     return email.charAt(0).toUpperCase();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
//         <div className="text-center">
//           <Loader className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
//           <p className="text-slate-700 text-lg font-medium">Loading Dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
//         <div className="text-center">
//           <XCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
//           <p className="text-slate-700 text-lg font-medium">Failed to load dashboard</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-800">
//       {/* Header */}
//       <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4 shadow-sm">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
//                 <Zap className="w-6 h-6 text-white" />
//               </div>
//               <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
//                 Workflow Automation Builder
//               </h1>
//             </div>
//           </div>
//           <div className="flex items-center space-x-4">
//             <span className="text-slate-600 font-medium hidden sm:block">Welcome back!</span>
            
//             {/* User Profile Dropdown */}
//             <div className="relative">
//               <button
//                 onClick={() => setShowUserMenu(!showUserMenu)}
//                 className="flex items-center space-x-2 bg-white/60 hover:bg-white/80 px-3 py-2 rounded-xl border border-slate-200/50 transition-all duration-200 shadow-sm hover:shadow-md"
//               >
//                 <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium text-sm shadow-sm">
//                   {getUserInitials(user.email)}
//                 </div>
//                 <span className="text-slate-700 font-medium hidden sm:block max-w-32 truncate">
//                   {user.name || user.email?.split('@')[0]}
//                 </span>
//                 <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
//               </button>

//               {/* Dropdown Menu */}
//               {showUserMenu && (
//                 <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200/50 py-2 z-50 backdrop-blur-sm">
//                   <div className="px-4 py-3 border-b border-slate-100">
//                     <div className="flex items-center space-x-3">
//                       <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium shadow-sm">
//                         {getUserInitials(user.email)}
//                       </div>
//                       <div>
//                         <p className="font-medium text-slate-800">{user.name || user.email?.split('@')[0]}</p>
//                         <p className="text-sm text-slate-500 truncate">{user.email}</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="py-1">
//                     <button className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-2">
//                       <Settings className="w-4 h-4" />
//                       <span>Settings</span>
//                     </button>
//                     <button 
//                       onClick={handleLogout}
//                       className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-2"
//                     >
//                       <LogOut className="w-4 h-4" />
//                       <span>Sign Out</span>
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Navigation Tabs */}
//       <nav className="bg-white/60 backdrop-blur-sm px-6 py-3 border-b border-slate-200/50">
//         <div className="flex space-x-2">
//           {[
//             { id: 'overview', label: 'Overview', icon: BarChart3 },
//             { id: 'workflows', label: 'Workflows', icon: GitBranch },
//             { id: 'history', label: 'History', icon: Clock },
//           ].map(tab => (
//             <button
//               key={tab.id}
//               onClick={() => {
//                 if (tab.id === 'history') {
//                   navigate('/execution-history');
//                 } else {
//                   setActiveTab(tab.id);
//                 }
//               }}
//               className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
//                 activeTab === tab.id && tab.id !== 'history'
//                   ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
//                   : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
//               }`}
//             >
//               <tab.icon className="w-4 h-4" />
//               <span>{tab.label}</span>
//             </button>
//           ))}
//         </div>
//       </nav>

//       {/* Error Message */}
//       {error && (
//         <div className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
//           <p className="text-rose-600">{error}</p>
//         </div>
//       )}

//       <div className="p-6">
//         {/* Overview Tab */}
//         {activeTab === 'overview' && (
//           <div className="space-y-6">
//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//               <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-slate-500 text-sm font-medium">Total Workflows</p>
//                     <p className="text-3xl font-bold text-slate-800">{stats.totalWorkflows}</p>
//                   </div>
//                   <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
//                     <GitBranch className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-slate-500 text-sm font-medium">Active Workflows</p>
//                     <p className="text-3xl font-bold text-emerald-600">{stats.activeWorkflows}</p>
//                   </div>
//                   <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm">
//                     <CheckCircle className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-slate-500 text-sm font-medium">Success Rate</p>
//                     <p className="text-3xl font-bold text-amber-600">{stats.successRate}%</p>
//                   </div>
//                   <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-sm">
//                     <BarChart3 className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-slate-500 text-sm font-medium">Total Executions</p>
//                     <p className="text-3xl font-bold text-slate-800">{stats.totalExecutions}</p>
//                   </div>
//                   <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm">
//                     <Activity className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 shadow-sm">
//               <h2 className="text-xl font-semibold mb-6 text-slate-800">
//                 Quick Actions
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <button
//                   onClick={handleCreateWorkflow}
//                   className="flex items-center space-x-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] font-medium shadow-lg shadow-indigo-200 hover:shadow-xl"
//                 >
//                   <Plus className="w-6 h-6" />
//                   <span>Create New Workflow</span>
//                 </button>
                
//                 <button
//                   onClick={() => navigate('/execution-history')}
//                   className="flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] font-medium shadow-lg shadow-purple-200 hover:shadow-xl"
//                 >
//                   <Clock className="w-6 h-6" />
//                   <span>View Execution History</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Workflows Tab */}
//         {activeTab === 'workflows' && (
//           <div className="space-y-6">
//             {/* Toolbar */}
//             <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
//                   <input
//                     type="text"
//                     placeholder="Search workflows..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="bg-white/60 border border-slate-200/50 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
//                   />
//                 </div>
//               </div>
//               <button
//                 onClick={handleCreateWorkflow}
//                 className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] font-medium shadow-lg shadow-indigo-200 hover:shadow-xl"
//               >
//                 <Plus className="w-4 h-4" />
//                 <span>Create Workflow</span>
//               </button>
//             </div>

//             {/* Workflows Grid */}
//             {workflows.length === 0 ? (
//               <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm">
//                 <GitBranch className="w-16 h-16 mx-auto mb-4 text-slate-400" />
//                 <h3 className="text-xl font-semibold mb-2 text-slate-800">No Workflows Yet</h3>
//                 <p className="text-slate-500 mb-6">Create your first workflow to get started with automation</p>
//                 <button
//                   onClick={handleCreateWorkflow}
//                   className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] font-medium shadow-lg shadow-indigo-200"
//                 >
//                   Create Your First Workflow
//                 </button>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//                 {filteredWorkflows.map(workflow => (
//                   <div key={workflow._id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
//                     <div className="flex items-start justify-between mb-4">
//                       <h3 className="font-semibold text-lg text-slate-800">{workflow.name}</h3>
//                     </div>
                    
//                     <p className="text-slate-500 text-sm mb-4">
//                       Created: {new Date(workflow.createdAt).toLocaleDateString()}
//                     </p>
                    
//                     {/* Actions */}
//                     <div className="flex justify-between">
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() => handleRunWorkflow(workflow._id)}
//                           className="flex items-center space-x-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-3 py-1.5 rounded-lg text-sm transition-all duration-200 font-medium shadow-sm"
//                         >
//                           <Play className="w-3 h-3" />
//                           <span>Run</span>
//                         </button>
//                         <button
//                           onClick={() => handleEditWorkflow(workflow._id)}
//                           className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-all duration-200 font-medium shadow-sm"
//                         >
//                           <Edit3 className="w-3 h-3" />
//                           <span>Edit</span>
//                         </button>
//                       </div>
//                       <button
//                         onClick={() => handleDeleteWorkflow(workflow._id)}
//                         className="flex items-center space-x-1 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-3 py-1.5 rounded-lg text-sm transition-all duration-200 font-medium shadow-sm"
//                       >
//                         <Trash2 className="w-3 h-3" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
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
  ChevronDown,
  Calendar
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    scheduledWorkflows: 0,
    successRate: 0,
    totalExecutions: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
    } else {
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
      initializeDashboard();
    }
  }, [navigate]);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      
      await Promise.all([
        loadWorkflows(),
        loadExecutionLogs()
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error("Dashboard initialization error:", error);
      setLoading(false);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const loadWorkflows = async () => {
    try {
      const response = await api.get("/api/workflows");
      setWorkflows(response.data || []);
      calculateStats(response.data || []);
    } catch (error) {
      console.error("Error loading workflows:", error);
      setError("Failed to load workflows");
    }
  };

  const loadExecutionLogs = async () => {
    try {
      const logs = [];
      setRecentLogs(logs);
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  };

  const calculateStats = (workflowsData) => {
    const totalWorkflows = workflowsData.length;
    const activeWorkflows = totalWorkflows;
    const scheduledWorkflows = workflowsData.filter(w => w.schedule?.enabled).length;
    
    setStats({
      totalWorkflows,
      activeWorkflows,
      scheduledWorkflows,
      successRate: 0,
      totalExecutions: 0
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleCreateWorkflow = () => {
    navigate("/workflow-editor");
  };

  const handleRunWorkflow = async (workflowId) => {
    try {
      const response = await api.post("/api/execute/run", {
        workflowId: workflowId
      });

      if (response.data.runId) {
        alert(`Workflow started! Run ID: ${response.data.runId}`);
        loadWorkflows();
      }
    } catch (error) {
      console.error("Error running workflow:", error);
      alert("Failed to execute workflow: " + (error.response?.data?.error || error.message));
    }
  };

  const handleEditWorkflow = (workflowId) => {
    navigate(`/workflow-editor?id=${workflowId}`);
  };

  const handleDeleteWorkflow = async (workflowId) => {
    if (!window.confirm("Are you sure you want to delete this workflow?")) return;

    try {
      await api.delete(`/api/workflows/${workflowId}`);
      alert("Workflow deleted successfully!");
      loadWorkflows();
    } catch (error) {
      console.error("Error deleting workflow:", error);
      alert("Failed to delete workflow: " + (error.response?.data?.error || error.message));
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
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'scheduled' && workflow.schedule?.enabled) ||
                         (filterStatus === 'manual' && !workflow.schedule?.enabled);
    return matchesSearch && matchesFilter;
  });

  const getUserInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  const formatNextRun = (nextRun) => {
    if (!nextRun) return null;
    const date = new Date(nextRun);
    const now = new Date();
    const diffMs = date - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours < 1) {
      return `in ${diffMins} min`;
    } else if (diffHours < 24) {
      return `in ${diffHours}h ${diffMins}m`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
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
                  {user.name || user.email?.split('@')[0]}
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
                        <p className="font-medium text-slate-800">{user.name || user.email?.split('@')[0]}</p>
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
            { id: 'history', label: 'History', icon: Clock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'history') {
                  navigate('/execution-history');
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                activeTab === tab.id && tab.id !== 'history'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

              {/* ✨ NEW: Scheduled Workflows Card */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Scheduled</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.scheduledWorkflows}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Total Executions</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.totalExecutions}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-sm">
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
                  onClick={() => navigate('/execution-history')}
                  className="flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] font-medium shadow-lg shadow-purple-200 hover:shadow-xl"
                >
                  <Clock className="w-6 h-6" />
                  <span>View Execution History</span>
                </button>

                <button
                  onClick={() => setFilterStatus('scheduled')}
                  className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] font-medium shadow-lg shadow-blue-200 hover:shadow-xl"
                >
                  <Calendar className="w-6 h-6" />
                  <span>View Scheduled Workflows</span>
                </button>
              </div>
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

                {/* ✨ NEW: Filter Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === 'all'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                        : 'bg-white/60 text-slate-600 hover:bg-white/80'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterStatus('scheduled')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                      filterStatus === 'scheduled'
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                        : 'bg-white/60 text-slate-600 hover:bg-white/80'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    Scheduled
                  </button>
                  <button
                    onClick={() => setFilterStatus('manual')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === 'manual'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-white/60 text-slate-600 hover:bg-white/80'
                    }`}
                  >
                    Manual
                  </button>
                </div>
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
                  <div key={workflow._id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg text-slate-800 flex-1">{workflow.name}</h3>
                      
                      {/* ✨ NEW: Schedule Badge */}
                      {workflow.schedule?.enabled && (
                        <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs font-medium border border-purple-200">
                          <Clock className="w-3 h-3" />
                          Scheduled
                        </span>
                      )}
                    </div>

                    {/* ✨ NEW: Next Run Time */}
                    {workflow.schedule?.enabled && workflow.schedule?.nextRun && (
                      <div className="mb-3 flex items-center gap-2 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
                        <Calendar className="w-3 h-3" />
                        <span className="font-medium">Next run: {formatNextRun(workflow.schedule.nextRun)}</span>
                      </div>
                    )}

                    {/* ✨ NEW: Schedule Frequency */}
                    {workflow.schedule?.enabled && (
                      <p className="text-slate-500 text-xs mb-3">
                        Frequency: <span className="font-medium text-slate-700">{workflow.schedule.frequency}</span>
                      </p>
                    )}
                    
                    <p className="text-slate-500 text-sm mb-4">
                      Created: {new Date(workflow.createdAt).toLocaleDateString()}
                    </p>
                    
                    {/* Actions */}
                    <div className="flex justify-between">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRunWorkflow(workflow._id)}
                          className="flex items-center space-x-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-3 py-1.5 rounded-lg text-sm transition-all duration-200 font-medium shadow-sm"
                        >
                          <Play className="w-3 h-3" />
                          <span>Run</span>
                        </button>
                        <button
                          onClick={() => handleEditWorkflow(workflow._id)}
                          className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-all duration-200 font-medium shadow-sm"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteWorkflow(workflow._id)}
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
      </div>
    </div>
  );
}