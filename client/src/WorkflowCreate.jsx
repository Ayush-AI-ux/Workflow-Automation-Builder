import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowProvider,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import api from './api';
import {
  Save,
  Play,
  ArrowLeft,
  Plus,
  Mail,
  Table,
  MessageSquare,
  Zap,
  GitBranch,
  Settings,
  Trash2,
  Clock,
  LogOut,
  Loader,
  Hash,
  CheckCircle
} from 'lucide-react';
import AIAssistant from './components/AIAssistant';
import ScheduleModal from './components/ScheduleModal';

// Custom Node Components with proper handles
// const TriggerNode = ({ data, selected }) => (
//   <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 min-w-40 ${
//     selected ? 'border-yellow-300 shadow-yellow-200/50' : 'border-yellow-600'
//   }`}>
//     <div className="flex items-center space-x-2 mb-2">
//       <Zap className="w-4 h-4" />
//       <div className="font-semibold text-sm">Trigger</div>
//     </div>
//     <div className="text-xs">{data.label || 'Manual Trigger'}</div>
    
//     <Handle
//       type="source"
//       position={Position.Right}
//       id="trigger-output"
//       style={{
//         width: 12,
//         height: 12,
//         background: '#f59e0b',
//         border: '2px solid #ffffff',
//         right: -6
//       }}
//     />
//   </div>
// );

const TriggerNode = ({ data, selected }) => {
  const isConfigured = () => {
    return data.triggerType && data.triggerType !== 'manual';
  };

  const configured = isConfigured();

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 min-w-40 ${
      selected ? 'border-yellow-300 shadow-yellow-200/50' : 'border-yellow-600'
    }`}>
      <div className="flex items-center space-x-2 mb-2">
        <Zap className="w-4 h-4" />
        <div className="font-semibold text-sm">Trigger</div>
        {configured && (
          <CheckCircle className="w-4 h-4 text-green-600" />
        )}
      </div>
      <div className="text-xs">
        {configured ? (
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {data.label || 'Configured'}
          </span>
        ) : (
          data.label || 'Manual Trigger'
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        id="trigger-output"
        style={{
          width: 12,
          height: 12,
          background: '#f59e0b',
          border: '2px solid #ffffff',
          right: -6
        }}
      />
    </div>
  );
};

// const ActionNode = ({ data, selected }) => {
//   const getIcon = () => {
//     switch (data.type) {
//       case 'gmail': return <Mail className="w-4 h-4" />;
//       case 'sheets': return <Table className="w-4 h-4" />;
//       case 'slack': return <MessageSquare className="w-4 h-4" />;
//       case 'discord': return <Hash className="w-4 h-4" />;
//       default: return <Settings className="w-4 h-4" />;
//     }
//   };

//   const getBgColor = () => {
//     switch (data.type) {
//       case 'gmail': return 'from-red-500 to-red-600';
//       case 'sheets': return 'from-green-500 to-green-600';
//       case 'slack': return 'from-purple-500 to-purple-600';
//       case 'discord': return 'from-indigo-500 to-indigo-600';
//       default: return 'from-blue-500 to-blue-600';
//     }
//   };

//   return (
//     <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-gradient-to-br ${getBgColor()} text-white min-w-40 relative ${
//       selected ? 'border-white shadow-white/20' : 'border-transparent'
//     }`}>
//       <Handle
//         type="target"
//         position={Position.Left}
//         id="action-input"
//         style={{
//           width: 12,
//           height: 12,
//           background: '#ffffff',
//           border: '2px solid #64748b',
//           left: -6
//         }}
//       />
      
//       <div className="flex items-center space-x-2 mb-2">
//         {getIcon()}
//         <div className="font-semibold text-sm">{data.label || 'Action'}</div>
//       </div>
//       <div className="text-xs opacity-90">{data.description || 'Configure action'}</div>
      
//       <Handle
//         type="source"
//         position={Position.Right}
//         id="action-output"
//         style={{
//           width: 12,
//           height: 12,
//           background: '#ffffff',
//           border: '2px solid #64748b',
//           right: -6
//         }}
//       />
//     </div>
//   );
// };
const ActionNode = ({ data, selected }) => {
  const getIcon = () => {
    switch (data.type) {
      case 'gmail': return <Mail className="w-4 h-4" />;
      case 'sheets': return <Table className="w-4 h-4" />;
      case 'slack': return <MessageSquare className="w-4 h-4" />;
      case 'discord': return <Hash className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getBgColor = () => {
    switch (data.type) {
      case 'gmail': return 'from-red-500 to-red-600';
      case 'sheets': return 'from-green-500 to-green-600';
      case 'slack': return 'from-purple-500 to-purple-600';
      case 'discord': return 'from-indigo-500 to-indigo-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  // ✨ NEW: Check if node is configured
  const isConfigured = () => {
    if (!data) return false;
    
    switch (data.type) {
      case 'gmail':
        return data.to && data.subject && data.message;
      case 'sheets':
        return data.sheetId && data.sheetName && data.data;
      case 'slack':
        return data.channel && data.slackMessage;
      case 'discord':
        return data.webhookUrl && data.content;
      default:
        return false;
    }
  };

  const configured = isConfigured();

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-gradient-to-br ${getBgColor()} text-white min-w-40 relative ${
      selected ? 'border-white shadow-white/20' : 'border-transparent'
    }`}>
      <Handle
        type="target"
        position={Position.Left}
        id="action-input"
        style={{
          width: 12,
          height: 12,
          background: '#ffffff',
          border: '2px solid #64748b',
          left: -6
        }}
      />
      
      <div className="flex items-center space-x-2 mb-2">
        {getIcon()}
        <div className="font-semibold text-sm">{data.label || 'Action'}</div>
        {/* ✨ NEW: Configuration status badge */}
        {configured && (
          <CheckCircle className="w-4 h-4 text-green-300" />
        )}
      </div>
      
      {/* ✨ NEW: Dynamic description based on configuration */}
      <div className="text-xs opacity-90">
        {configured ? (
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Configured
          </span>
        ) : (
          'Configure this action'
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        id="action-output"
        style={{
          width: 12,
          height: 12,
          background: '#ffffff',
          border: '2px solid #64748b',
          right: -6
        }}
      />
    </div>
  );
};
// const ConditionalNode = ({ data, selected }) => (
//   <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-gradient-to-br from-amber-500 to-yellow-600 text-white min-w-40 relative ${
//     selected ? 'border-white shadow-white/20' : 'border-transparent'
//   }`}>
//     <Handle
//       type="target"
//       position={Position.Left}
//       id="condition-input"
//       style={{
//         width: 12,
//         height: 12,
//         background: '#ffffff',
//         border: '2px solid #64748b',
//         left: -6
//       }}
//     />
    
//     <div className="flex items-center space-x-2 mb-2">
//       <GitBranch className="w-4 h-4" />
//       <div className="font-semibold text-sm">Condition</div>
//     </div>
//     <div className="text-xs opacity-90">{data.condition || 'If/Else Logic'}</div>
    
//     <Handle
//       type="source"
//       position={Position.Right}
//       id="condition-true"
//       style={{
//         width: 12,
//         height: 12,
//         background: '#10b981',
//         border: '2px solid #ffffff',
//         right: -6,
//         top: '30%'
//       }}
//     />
    
//     <Handle
//       type="source"
//       position={Position.Right}
//       id="condition-false"
//       style={{
//         width: 12,
//         height: 12,
//         background: '#ef4444',
//         border: '2px solid #ffffff',
//         right: -6,
//         top: '70%'
//       }}
//     />
//   </div>
// );

const ConditionalNode = ({ data, selected }) => {
  const isConfigured = () => {
    return data.conditionType && 
           (data.conditionType === 'success' || 
            data.conditionType === 'failure' || 
            data.compareValue || 
            data.threshold);
  };

  const configured = isConfigured();

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-gradient-to-br from-amber-500 to-yellow-600 text-white min-w-40 relative ${
      selected ? 'border-white shadow-white/20' : 'border-transparent'
    }`}>
      <Handle
        type="target"
        position={Position.Left}
        id="condition-input"
        style={{
          width: 12,
          height: 12,
          background: '#ffffff',
          border: '2px solid #64748b',
          left: -6
        }}
      />
      
      <div className="flex items-center space-x-2 mb-2">
        <GitBranch className="w-4 h-4" />
        <div className="font-semibold text-sm">Condition</div>
        {configured && (
          <CheckCircle className="w-4 h-4 text-green-300" />
        )}
      </div>
      <div className="text-xs opacity-90">
        {configured ? (
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Configured
          </span>
        ) : (
          data.condition || 'If/Else Logic'
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        id="condition-true"
        style={{
          width: 12,
          height: 12,
          background: '#10b981',
          border: '2px solid #ffffff',
          right: -6,
          top: '30%'
        }}
      />
      
      <Handle
        type="source"
        position={Position.Right}
        id="condition-false"
        style={{
          width: 12,
          height: 12,
          background: '#ef4444',
          border: '2px solid #ffffff',
          right: -6,
          top: '70%'
        }}
      />
    </div>
  );
};

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionalNode,
};

function WorkflowCreateContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('id');
  
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [nodeConfig, setNodeConfig] = useState({});
  
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // ✨ NEW: Schedule state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleInfo, setScheduleInfo] = useState(null);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
      loadScheduleInfo(); // ✨ Load schedule info
    }
  }, [workflowId]);

  const loadWorkflow = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/workflows/${id}`);
      const workflow = response.data;
      
      setWorkflowName(workflow.name || '');
      setWorkflowDescription(workflow.description || '');
      
      if (workflow.definition) {
        if (workflow.definition.nodes && Array.isArray(workflow.definition.nodes)) {
          setNodes(workflow.definition.nodes);
        }
        
        if (workflow.definition.edges && Array.isArray(workflow.definition.edges)) {
          setEdges(workflow.definition.edges);
        }
        
        if (workflow.definition.viewport && reactFlowInstance) {
          setTimeout(() => {
            reactFlowInstance.setViewport(workflow.definition.viewport);
          }, 100);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading workflow:", error);
      setLoading(false);
      alert('Failed to load workflow: ' + (error.response?.data?.error || error.message));
    }
  };

  // ✨ NEW: Load schedule information
  const loadScheduleInfo = async () => {
    if (!workflowId) return;
    
    try {
      const response = await api.get(`/api/schedule/${workflowId}`);
      setScheduleInfo(response.data.schedule);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    }
  };

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        type: 'smoothstep',
        style: { 
          stroke: '#64748b', 
          strokeWidth: 2,
          strokeDasharray: params.sourceHandle?.includes('false') ? '5,5' : undefined
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#64748b',
          width: 20,
          height: 20
        },
        label: params.sourceHandle?.includes('false') ? 'False' : params.sourceHandle?.includes('true') ? 'True' : undefined,
        labelStyle: { 
          fontSize: 12, 
          fontWeight: 'bold',
          color: '#ffffff',
          backgroundColor: params.sourceHandle?.includes('false') ? '#ef4444' : params.sourceHandle?.includes('true') ? '#10b981' : '#64748b',
          padding: '2px 6px',
          borderRadius: '4px'
        }
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const isValidConnection = useCallback((connection) => {
    if (connection.source === connection.target) {
      return false;
    }
    
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    
    if (!sourceNode || !targetNode) {
      return false;
    }
    
    if (sourceNode.type === 'trigger' && targetNode.type === 'trigger') {
      return false;
    }
    
    const existingConnection = edges.find(edge => 
      edge.source === connection.source && 
      edge.target === connection.target &&
      edge.sourceHandle === connection.sourceHandle &&
      edge.targetHandle === connection.targetHandle
    );
    
    return !existingConnection;
  }, [nodes, edges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowInstance || !reactFlowBounds) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: type === 'trigger' ? 'Manual Trigger' : `${type} Action`,
          type: type === 'action' ? 'gmail' : type,
          description: type === 'trigger' ? 'Click to start' : 'Configure this action'
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((event, node) => {
    event.stopPropagation();
    setSelectedNode(node);
    setNodeConfig(node.data || {});
    setShowConfigPanel(true);
  }, []);

  const addTriggerNode = () => {
    const newNode = {
      id: `trigger-${Date.now()}`,
      type: 'trigger',
      position: { x: 100, y: 100 },
      data: { label: 'Manual Trigger', description: 'Click to start workflow' },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const addActionNode = (actionType) => {
    const actionConfig = {
      gmail: { label: 'Send Email', description: 'Send email via Gmail' },
      sheets: { label: 'Update Sheet', description: 'Add row to Google Sheets' },
      slack: { label: 'Send Message', description: 'Post to Slack channel' },
      discord: { label: 'Discord Message', description: 'Send via Discord webhook' }
    };

    const config = actionConfig[actionType] || actionConfig.gmail;
    
    const newNode = {
      id: `action-${actionType}-${Date.now()}`,
      type: 'action',
      position: { x: 300, y: 100 },
      data: { 
        label: config.label,
        description: config.description,
        type: actionType
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const addConditionalNode = () => {
    const newNode = {
      id: `condition-${Date.now()}`,
      type: 'condition',
      position: { x: 200, y: 200 },
      data: { label: 'If/Else', condition: 'Configure condition' },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const updateNodeConfig = () => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, ...nodeConfig } }
          : node
      )
    );
    setShowConfigPanel(false);
  };

  const deleteSelectedNode = () => {
    if (!selectedNode) return;
    
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== selectedNode.id && edge.target !== selectedNode.id
    ));
    setShowConfigPanel(false);
    setSelectedNode(null);
  };

  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    setSaving(true);
    setSaveStatus('');

    try {
      const workflowData = {
        name: workflowName,
        definition: {
          nodes,
          edges,
          viewport: reactFlowInstance?.getViewport()
        }
      };

      if (workflowDescription.trim()) {
        workflowData.description = workflowDescription;
      }
      
      let response;
      if (workflowId) {
        response = await api.put(`/api/workflows/${workflowId}`, workflowData);
        setSaveStatus('Workflow updated successfully!');
      } else {
        response = await api.post('/api/workflows', workflowData);
        setSaveStatus('Workflow saved successfully!');
      }
      
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (error) {
      console.error("Error saving workflow:", error);
      setSaveStatus('Failed to save workflow: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const testWorkflow = async () => {
    if (nodes.length === 0) {
      alert('Please add some nodes to test the workflow');
      return;
    }

    const hasTrigger = nodes.some(node => node.type === 'trigger');
    if (!hasTrigger) {
      alert('⚠️ Your workflow must have a Trigger node to start execution!\n\nPlease drag a "Manual Trigger" from the sidebar to your canvas and connect it to your action nodes.');
      return;
    }

    setTesting(true);

    try {
      const workflowData = {
        name: workflowName || 'Test Workflow',
        definition: { nodes, edges }
      };
      
      let testWorkflowId = workflowId;
      
      if (!workflowId) {
        const saveResponse = await api.post('/api/workflows', workflowData);
        testWorkflowId = saveResponse.data._id;
      } else {
        await api.put(`/api/workflows/${workflowId}`, workflowData);
      }

      const executeResponse = await api.post('/api/execute/run', {
        workflowId: testWorkflowId
      });
      
      if (executeResponse.data.success) {
        alert(`✅ Workflow test completed successfully!\n\nRun ID: ${executeResponse.data.runId}\n\nCheck your backend console for detailed execution logs.`);
      } else {
        alert(`⚠️ Workflow execution completed with warnings.\n\nRun ID: ${executeResponse.data.runId}`);
      }
    } catch (error) {
      console.error("Error testing workflow:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      alert(`❌ Failed to test workflow:\n\n${errorMsg}\n\nCheck the browser console and backend logs for more details.`);
    } finally {
      setTesting(false);
    }
  };

  const clearWorkflow = () => {
    if (window.confirm('Are you sure you want to clear the entire workflow?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      setShowConfigPanel(false);
    }
  };

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // AI Assistant Handlers
  const handleAIAddNode = (newNode) => {
    setNodes((nds) => [...nds, newNode]);
    alert('✨ AI suggested node added!');
  };

  const handleAIGenerateWorkflow = (workflow) => {
    if (window.confirm('This will replace your current workflow. Continue?')) {
      setNodes(workflow.nodes || []);
      setEdges(workflow.edges || []);
      alert('✨ Workflow generated by AI!');
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-white text-lg font-medium">Loading Workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex">
      {showSidebar && (
        <div className="w-80 bg-slate-800/80 backdrop-blur-sm border-r border-slate-700/50 flex flex-col">
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                  <Zap className="w-5 h-5 text-slate-900" />
                </div>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  {workflowId ? 'Edit Workflow' : 'Workflow Builder'}
                </h2>
              </div>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ←
              </button>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Workflow Name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
              />
              <textarea
                placeholder="Description (optional)"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="text-sm font-medium mb-3 text-slate-300">Drag nodes to canvas</h3>
            
            <div className="mb-6">
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Triggers</p>
              <div
                className="bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 p-3 rounded-lg cursor-move hover:shadow-lg transition-all duration-200 mb-2"
                draggable
                onDragStart={(e) => onDragStart(e, 'trigger')}
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium text-sm">Manual Trigger</span>
                </div>
                <p className="text-xs opacity-80 mt-1">Start workflow manually</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Actions</p>
              <div className="space-y-2">
                <div
                  className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-lg cursor-move hover:shadow-lg hover:scale-105 transition-all duration-200"
                  draggable
                  onDragStart={(e) => onDragStart(e, 'action')}
                >
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium text-sm">Send Email</span>
                  </div>
                  <p className="text-xs opacity-90 mt-1">Send email via Gmail API</p>
                </div>

                <div
                  className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg cursor-move hover:shadow-lg hover:scale-105 transition-all duration-200"
                  draggable
                  onDragStart={(e) => onDragStart(e, 'action')}
                >
                  <div className="flex items-center space-x-2">
                    <Table className="w-4 h-4" />
                    <span className="font-medium text-sm">Google Sheets</span>
                  </div>
                  <p className="text-xs opacity-90 mt-1">Add row to spreadsheet</p>
                </div>

                <div
                  className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg cursor-move hover:shadow-lg hover:scale-105 transition-all duration-200"
                  draggable
                  onDragStart={(e) => onDragStart(e, 'action')}
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium text-sm">Slack Message</span>
                  </div>
                  <p className="text-xs opacity-90 mt-1">Post to Slack channel</p>
                </div>

                <div
                  className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-lg cursor-move hover:shadow-lg hover:scale-105 transition-all duration-200"
                  draggable
                  onDragStart={(e) => onDragStart(e, 'action')}
                >
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4" />
                    <span className="font-medium text-sm">Discord Message</span>
                  </div>
                  <p className="text-xs opacity-90 mt-1">Send via Discord webhook</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Logic</p>
              <div
                className="bg-gradient-to-br from-amber-500 to-yellow-600 p-3 rounded-lg cursor-move hover:shadow-lg hover:scale-105 transition-all duration-200"
                draggable
                onDragStart={(e) => onDragStart(e, 'condition')}
              >
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4" />
                  <span className="font-medium text-sm">If/Else</span>
                </div>
                <p className="text-xs opacity-90 mt-1">Conditional branching</p>
              </div>
            </div>

            <div className="border-t border-slate-700/50 pt-4">
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Quick Add</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={addTriggerNode}
                  className="bg-slate-700/50 hover:bg-slate-600/50 p-2 rounded-lg transition-all duration-200 text-xs"
                >
                  + Trigger
                </button>
                <button
                  onClick={() => addActionNode('gmail')}
                  className="bg-slate-700/50 hover:bg-slate-600/50 p-2 rounded-lg transition-all duration-200 text-xs"
                >
                  + Action
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-700/50 space-y-2">
            <button
              onClick={saveWorkflow}
              disabled={saving}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 font-medium"
            >
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : workflowId ? 'Update Workflow' : 'Save Workflow'}</span>
            </button>
            
            <button
              onClick={testWorkflow}
              disabled={testing}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 font-medium"
            >
              {testing ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{testing ? 'Testing...' : 'Test Workflow'}</span>
            </button>

            {/* ✨ NEW: Schedule Button */}
            <button
              onClick={() => setShowScheduleModal(true)}
              disabled={!workflowId}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 font-medium"
              title={!workflowId ? 'Save workflow first to enable scheduling' : 'Schedule this workflow'}
            >
              <Clock className="w-4 h-4" />
              <span>{scheduleInfo?.enabled ? '⏰ Scheduled' : 'Schedule'}</span>
            </button>

            {/* ✨ NEW: Show next run time if scheduled */}
            {scheduleInfo?.enabled && scheduleInfo?.nextRun && (
              <div className="text-xs text-center text-slate-400 bg-slate-700/30 px-3 py-2 rounded-lg border border-slate-600/30">
                <Clock className="w-3 h-3 inline mr-1" />
                Next: {new Date(scheduleInfo.nextRun).toLocaleString()}
              </div>
            )}

            {saveStatus && (
              <div className={`text-center text-sm p-2 rounded-lg ${
                saveStatus.includes('success') 
                  ? 'bg-green-900/50 text-green-300 border border-green-700/50' 
                  : 'bg-red-900/50 text-red-300 border border-red-700/50'
              }`}>
                {saveStatus}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/home')}
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors hover:bg-slate-700/50 px-3 py-1 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              
              {!showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="bg-slate-700/50 hover:bg-slate-600/50 px-3 py-2 rounded-lg transition-all duration-200 border border-slate-600/50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-400 bg-slate-700/30 px-3 py-1 rounded-lg border border-slate-600/30">
                Nodes: {nodes.length} | Connections: {edges.length}
              </div>
              
              <button
                onClick={clearWorkflow}
                className="flex items-center space-x-1 bg-slate-700/50 hover:bg-slate-600/50 px-3 py-2 rounded-lg transition-all duration-200 border border-slate-600/50 text-slate-300 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-3 py-2 rounded-lg transition-all duration-200 text-white"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            isValidConnection={isValidConnection}
            className="bg-slate-900"
            connectionLineStyle={{ 
              stroke: '#64748b', 
              strokeWidth: 3,
              strokeDasharray: '5,5'
            }}
            defaultEdgeOptions={{ 
              style: { stroke: '#64748b', strokeWidth: 2 },
              type: 'smoothstep',
              markerEnd: {
                type: 'arrowclosed',
                color: '#64748b',
                width: 20,
                height: 20
              }
            }}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
          >
            <Background 
              color="#475569" 
              gap={20} 
              variant="dots" 
              size={1}
            />
            <Controls 
              className="bg-slate-800 border-slate-700"
              showZoom={true}
              showFitView={true}
              showInteractive={true}
            />
            <MiniMap
              className="bg-slate-800 border border-slate-700"
              nodeColor="#64748b"
              maskColor="rgba(0, 0, 0, 0.7)"
              pannable
              zoomable
            />
            
            {nodes.length === 0 && (
              <Panel position="center">
                <div className="text-center bg-slate-800/90 backdrop-blur-sm p-8 rounded-lg border border-slate-700/50 max-w-md">
                  <GitBranch className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Start Building Your Workflow
                  </h3>
                  <p className="text-slate-400 mb-4">Drag nodes from the sidebar and connect them to create your automation workflow</p>
                  <div className="text-xs text-slate-500 mb-6">
                    💡 Tip: Click and drag from the connection points (handles) to link nodes together
                  </div>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={addTriggerNode}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-4 py-2 rounded-lg font-medium hover:from-yellow-500 hover:to-orange-600 transition-all duration-200"
                    >
                      Add Trigger
                    </button>
                    <button
                      onClick={() => addActionNode('gmail')}
                      className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200"
                    >
                      Add Action
                    </button>
                  </div>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </div>

      {showConfigPanel && selectedNode && (
        <div className="w-80 bg-slate-800/90 backdrop-blur-sm border-l border-slate-700/50 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Configure Node
            </h3>
            <button
              onClick={() => setShowConfigPanel(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Node Label</label>
              <input
                type="text"
                value={nodeConfig.label || ''}
                onChange={(e) => setNodeConfig(prev => ({ ...prev, label: e.target.value }))}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                placeholder="Enter node label"
              />
            </div>

            {selectedNode.type === 'action' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">Action Type</label>
                  <select
                    value={nodeConfig.type || 'gmail'}
                    onChange={(e) => setNodeConfig(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                  >
                    <option value="gmail">Gmail - Send Email</option>
                    <option value="sheets">Google Sheets - Add Row</option>
                    <option value="slack">Slack - Send Message</option>
                    <option value="discord">Discord - Send Message</option>
                  </select>
                </div>

                {nodeConfig.type === 'gmail' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">To Email</label>
                      <input
                        type="email"
                        value={nodeConfig.to || ''}
                        onChange={(e) => setNodeConfig(prev => ({ ...prev, to: e.target.value }))}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                        placeholder="recipient@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Subject</label>
                      <input
                        type="text"
                        value={nodeConfig.subject || ''}
                        onChange={(e) => setNodeConfig(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                        placeholder="Email subject"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Message</label>
                      <textarea
                        value={nodeConfig.message || ''}
                        onChange={(e) => setNodeConfig(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                        placeholder="Email body content"
                      />
                    </div>
                  </>
                )}

                {nodeConfig.type === 'sheets' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Sheet ID</label>
                      <input
                        type="text"
                        value={nodeConfig.sheetId || ''}
                        onChange={(e) => setNodeConfig(prev => ({ ...prev, sheetId: e.target.value }))}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                        placeholder="Google Sheet ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Sheet Name</label>
                      <input
                        type="text"
                        value={nodeConfig.sheetName || ''}
                        onChange={(e) => setNodeConfig(prev => ({ ...prev, sheetName: e.target.value }))}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                        placeholder="Sheet1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Data to Insert</label>
                      <textarea
                        value={nodeConfig.data || ''}
                        onChange={(e) => setNodeConfig(prev => ({ ...prev, data: e.target.value }))}
                        placeholder="value1, value2, value3"
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                      />
                      <p className="text-xs text-slate-400 mt-1">Comma-separated values</p>
                    </div>
                  </>
                )}

                {nodeConfig.type === 'slack' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Channel</label>
                      <input
                        type="text"
                        value={nodeConfig.channel || ''}
                        onChange={(e) => setNodeConfig(prev => ({ ...prev, channel: e.target.value }))}
                        placeholder="#general"
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Message</label>
                      <textarea
                        value={nodeConfig.slackMessage || ''}
                        onChange={(e) => setNodeConfig(prev => ({ ...prev, slackMessage: e.target.value }))}
                        placeholder="Your Slack message"
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Bot Token</label>
                      <input
                        type="password"
                        value={nodeConfig.botToken || ''}
                        onChange={(e) => setNodeConfig(prev => ({ ...prev, botToken: e.target.value }))}
                        placeholder="xoxb-your-bot-token"
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                      />
                      <p className="text-xs text-slate-400 mt-1">Your Slack bot token</p>
                    </div>
                  </>
                )}

                {nodeConfig.type === 'discord' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Webhook URL</label>
                      <input
                        type="url"
                        value={nodeConfig.webhookUrl || ''}
                        onChange={(e) => setNodeConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                        placeholder="https://discord.com/api/webhooks/..."
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                      />
                      <p className="text-xs text-slate-400 mt-1">Your Discord webhook URL</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Message Content</label>
                      <textarea
                        value={nodeConfig.content || ''}
                        onChange={(e) => setNodeConfig(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Your Discord message"
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                      />
                      <p className="text-xs text-slate-400 mt-1">Message to send via Discord webhook</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Username (Optional)</label>
                      <input
                        type="text"
                        value={nodeConfig.username || ''}
                        onChange={(e) => setNodeConfig(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Bot Name"
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {selectedNode.type === 'condition' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">Condition Type</label>
                  <select
                    value={nodeConfig.conditionType || 'success'}
                    onChange={(e) => setNodeConfig(prev => ({ ...prev, conditionType: e.target.value }))}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                  >
                    <option value="success">If previous step succeeded</option>
                    <option value="failure">If previous step failed</option>
                    <option value="contains">If data contains text</option>
                    <option value="equals">If data equals value</option>
                    <option value="greater">If value is greater than</option>
                    <option value="less">If value is less than</option>
                  </select>
                </div>

                {(nodeConfig.conditionType === 'contains' || nodeConfig.conditionType === 'equals') && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Compare Value</label>
                    <input
                      type="text"
                      value={nodeConfig.compareValue || ''}
                      onChange={(e) => setNodeConfig(prev => ({ ...prev, compareValue: e.target.value }))}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                      placeholder="Value to compare"
                    />
                  </div>
                )}

                {(nodeConfig.conditionType === 'greater' || nodeConfig.conditionType === 'less') && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Threshold Value</label>
                    <input
                      type="number"
                      value={nodeConfig.threshold || ''}
                      onChange={(e) => setNodeConfig(prev => ({ ...prev, threshold: e.target.value }))}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                      placeholder="Numeric threshold"
                    />
                  </div>
                )}
              </>
            )}

            {selectedNode.type === 'trigger' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">Trigger Type</label>
                  <select
                    value={nodeConfig.triggerType || 'manual'}
                    onChange={(e) => setNodeConfig(prev => ({ ...prev, triggerType: e.target.value }))}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                  >
                    <option value="manual">Manual Trigger</option>
                    <option value="schedule">Scheduled Trigger</option>
                    <option value="webhook">Webhook Trigger</option>
                  </select>
                </div>

                {nodeConfig.triggerType === 'schedule' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Schedule</label>
                    <select
                      value={nodeConfig.schedule || 'daily'}
                      onChange={(e) => setNodeConfig(prev => ({ ...prev, schedule: e.target.value }))}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                    >
                      <option value="hourly">Every Hour</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}

                {nodeConfig.triggerType === 'webhook' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Webhook URL</label>
                    <input
                      type="url"
                      value={nodeConfig.webhookUrl || 'https://api.example.com/webhook/12345'}
                      onChange={(e) => setNodeConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm"
                      placeholder="https://api.example.com/webhook"
                      readOnly
                    />
                    <p className="text-xs text-slate-400 mt-1">Auto-generated webhook URL</p>
                  </div>
                )}
              </>
            )}

            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex space-x-2">
                <button
                  onClick={updateNodeConfig}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                >
                  Update Node
                </button>
                <button
                  onClick={deleteSelectedNode}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-2 rounded-lg transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✨ AI Assistant */}
      <AIAssistant
        nodes={nodes}
        edges={edges}
        onAddNode={handleAIAddNode}
        onGenerateWorkflow={handleAIGenerateWorkflow}
      />

      {/* ✨ Schedule Modal */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={(shouldRefresh) => {
          setShowScheduleModal(false);
          if (shouldRefresh) {
            loadScheduleInfo();
          }
        }}
        workflowId={workflowId}
        workflowName={workflowName}
        currentSchedule={scheduleInfo}
      />
    </div>
  );
}

export default function WorkflowCreate() {
  return (
    <ReactFlowProvider>
      <WorkflowCreateContent />
    </ReactFlowProvider>
  );
}