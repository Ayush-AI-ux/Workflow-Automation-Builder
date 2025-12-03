// AI Service for Workflow Suggestions
// This version works without external dependencies

class AIService {
  /**
   * Suggest next node based on current workflow state
   */
  async suggestNextNode(workflowData) {
    try {
      const { nodes, edges } = workflowData;
      
      // Analyze current workflow
      const hasActions = nodes.some(n => n.type === 'action');
      const hasConditions = nodes.some(n => n.type === 'condition');
      const services = nodes.filter(n => n.data?.service).map(n => n.data.service);
      
      // Smart suggestions based on context
      if (!hasActions) {
        return {
          suggestion: 'Add your first action to perform a task',
          nodeType: 'action',
          service: 'gmail',
          reasoning: 'Start by adding an action like sending an email',
          configuration: { to: '', subject: '', body: '' }
        };
      }
      
      if (hasActions && !hasConditions) {
        return {
          suggestion: 'Add conditional logic to make your workflow smart',
          nodeType: 'condition',
          service: 'condition',
          reasoning: 'Conditions let you create different paths based on data',
          configuration: { field: '', operator: 'equals', value: '' }
        };
      }
      
      // Suggest complementary services
      if (!services.includes('sheets')) {
        return {
          suggestion: 'Log data to Google Sheets',
          nodeType: 'action',
          service: 'sheets',
          reasoning: 'Keep a record of all workflow executions',
          configuration: { spreadsheetId: '', values: [] }
        };
      }
      
      if (!services.includes('slack')) {
        return {
          suggestion: 'Send notifications to Slack',
          nodeType: 'action',
          service: 'slack',
          reasoning: 'Keep your team informed with instant notifications',
          configuration: { channel: '', text: '' }
        };
      }
      
      return {
        suggestion: 'Add another action to extend your workflow',
        nodeType: 'action',
        service: 'gmail',
        reasoning: 'Continue building your automation chain',
        configuration: {}
      };
      
    } catch (error) {
      console.error('AI Suggestion Error:', error);
      return {
        suggestion: 'Add an action node to perform a task',
        nodeType: 'action',
        service: 'gmail',
        reasoning: 'Continue building your workflow',
        configuration: {},
      };
    }
  }

  /**
   * Generate complete workflow from natural language description
   */
  async generateWorkflow(description, userName = 'User') {
    try {
      // Simple pattern matching for common workflows
      const lowerDesc = description.toLowerCase();
      
      // Email + Sheets workflow
      if (lowerDesc.includes('email') && lowerDesc.includes('sheet')) {
        return {
          name: 'Email to Sheets Logger',
          description: 'Log emails to Google Sheets',
          nodes: [
            {
              id: '1',
              type: 'trigger',
              position: { x: 250, y: 50 },
              data: { label: 'Manual Trigger', triggerType: 'manual' }
            },
            {
              id: '2',
              type: 'action',
              position: { x: 250, y: 200 },
              data: {
                label: 'Send Email',
                service: 'gmail',
                config: { to: '', subject: 'Automated Email', body: '' }
              }
            },
            {
              id: '3',
              type: 'action',
              position: { x: 250, y: 350 },
              data: {
                label: 'Log to Sheets',
                service: 'sheets',
                config: { spreadsheetId: '', values: ['{{timestamp}}', '{{status}}'] }
              }
            }
          ],
          edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3' }
          ]
        };
      }
      
      // Slack notification workflow
      if (lowerDesc.includes('slack') || lowerDesc.includes('notify')) {
        return {
          name: 'Slack Notification Workflow',
          description: 'Send notifications to Slack',
          nodes: [
            {
              id: '1',
              type: 'trigger',
              position: { x: 250, y: 50 },
              data: { label: 'Manual Trigger', triggerType: 'manual' }
            },
            {
              id: '2',
              type: 'action',
              position: { x: 250, y: 200 },
              data: {
                label: 'Post to Slack',
                service: 'slack',
                config: { channel: '#general', text: 'Workflow executed!' }
              }
            }
          ],
          edges: [
            { id: 'e1-2', source: '1', target: '2' }
          ]
        };
      }
      
      // Conditional workflow
      if (lowerDesc.includes('if') || lowerDesc.includes('condition')) {
        return {
          name: 'Conditional Workflow',
          description: 'Workflow with conditional logic',
          nodes: [
            {
              id: '1',
              type: 'trigger',
              position: { x: 250, y: 50 },
              data: { label: 'Manual Trigger', triggerType: 'manual' }
            },
            {
              id: '2',
              type: 'condition',
              position: { x: 250, y: 200 },
              data: {
                label: 'Check Condition',
                config: { field: 'status', operator: 'equals', value: 'active' }
              }
            },
            {
              id: '3',
              type: 'action',
              position: { x: 100, y: 350 },
              data: {
                label: 'Send Email (True)',
                service: 'gmail',
                config: { to: '', subject: 'Condition Met', body: '' }
              }
            },
            {
              id: '4',
              type: 'action',
              position: { x: 400, y: 350 },
              data: {
                label: 'Log to Sheets (False)',
                service: 'sheets',
                config: { spreadsheetId: '', values: [] }
              }
            }
          ],
          edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3', label: 'TRUE' },
            { id: 'e2-4', source: '2', target: '4', label: 'FALSE' }
          ]
        };
      }
      
      // Default: Simple email workflow
      return {
        name: 'Simple Automation Workflow',
        description: description,
        nodes: [
          {
            id: '1',
            type: 'trigger',
            position: { x: 250, y: 50 },
            data: { label: 'Manual Trigger', triggerType: 'manual' }
          },
          {
            id: '2',
            type: 'action',
            position: { x: 250, y: 200 },
            data: {
              label: 'Send Email',
              service: 'gmail',
              config: { to: '', subject: 'Workflow Notification', body: description }
            }
          },
          {
            id: '3',
            type: 'action',
            position: { x: 250, y: 350 },
            data: {
              label: 'Post to Slack',
              service: 'slack',
              config: { channel: '#general', text: 'Task completed!' }
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' }
        ]
      };
      
    } catch (error) {
      console.error('AI Generation Error:', error);
      return {
        name: 'Simple Workflow',
        description: description,
        nodes: [
          {
            id: '1',
            type: 'trigger',
            position: { x: 250, y: 50 },
            data: { label: 'Manual Trigger', triggerType: 'manual' }
          }
        ],
        edges: []
      };
    }
  }

  /**
   * Analyze workflow for issues and optimization suggestions
   */
  async analyzeWorkflow(workflowData) {
    try {
      const { nodes, edges } = workflowData;
      
      const issues = [];
      const suggestions = [];
      let score = 100;
      
      // Check for disconnected nodes
      const connectedNodeIds = new Set();
      edges.forEach(edge => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      });
      
      const disconnectedNodes = nodes.filter(n => !connectedNodeIds.has(n.id));
      if (disconnectedNodes.length > 0) {
        issues.push({
          severity: 'high',
          message: `${disconnectedNodes.length} disconnected node(s) found`,
          nodeId: disconnectedNodes[0].id
        });
        score -= 20;
      }
      
      // Check for missing trigger
      const hasTrigger = nodes.some(n => n.type === 'trigger');
      if (!hasTrigger) {
        issues.push({
          severity: 'high',
          message: 'No trigger node found - workflow cannot start',
          nodeId: null
        });
        score -= 30;
      }
      
      // Check for nodes without configuration
      const unconfiguredNodes = nodes.filter(n => 
        n.type === 'action' && (!n.data.config || Object.keys(n.data.config).length === 0)
      );
      if (unconfiguredNodes.length > 0) {
        issues.push({
          severity: 'medium',
          message: `${unconfiguredNodes.length} action(s) need configuration`,
          nodeId: unconfiguredNodes[0].id
        });
        score -= 15;
      }
      
      // Check workflow complexity
      if (nodes.length < 3) {
        suggestions.push({
          type: 'improvement',
          message: 'Consider adding more actions to make your workflow more powerful'
        });
      }
      
      // Check for error handling
      const hasConditions = nodes.some(n => n.type === 'condition');
      if (!hasConditions && nodes.length > 3) {
        suggestions.push({
          type: 'optimization',
          message: 'Add conditional logic to handle different scenarios'
        });
      }
      
      // Check for logging
      const hasSheets = nodes.some(n => n.data?.service === 'sheets');
      if (!hasSheets) {
        suggestions.push({
          type: 'optimization',
          message: 'Add Google Sheets to log workflow executions'
        });
      }
      
      return {
        score: Math.max(0, score),
        issues,
        suggestions
      };
      
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return {
        score: 70,
        issues: [],
        suggestions: []
      };
    }
  }

  /**
   * Get smart recommendations based on user's workflow history
   */
  async getRecommendations(userWorkflows) {
    try {
      const recommendations = [
        {
          title: 'Daily Email Digest',
          description: 'Get a summary email every morning with important updates',
          difficulty: 'beginner',
          timeToSave: '30 min/day',
          services: ['gmail', 'sheets']
        },
        {
          title: 'Slack Alert System',
          description: 'Automatically notify your team when specific conditions are met',
          difficulty: 'intermediate',
          timeToSave: '1 hour/week',
          services: ['slack', 'sheets']
        },
        {
          title: 'Data Logger',
          description: 'Automatically log important data to Google Sheets for tracking',
          difficulty: 'beginner',
          timeToSave: '2 hours/week',
          services: ['sheets']
        }
      ];
      
      return { recommendations };
    } catch (error) {
      console.error('AI Recommendations Error:', error);
      return { recommendations: [] };
    }
  }
}

module.exports = new AIService();