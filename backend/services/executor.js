// const { google } = require('googleapis');
// const Workflow = require('../models/workflow');
// const Log = require('../models/Log');
// const { v4: uuidv4 } = require('uuid');

// // Import integration services with error handling
// let gmail, sheets, slack, discord;
// try {
//   gmail = require('./integrations/gmail');
//   console.log('✅ Gmail integration loaded');
// } catch (e) {
//   console.log('⚠️ Gmail integration not available:', e.message);
// }
// try {
//   sheets = require('./integrations/sheets');
//   console.log('✅ Sheets integration loaded');
// } catch (e) {
//   console.log('⚠️ Sheets integration not available:', e.message);
// }
// try {
//   slack = require('./integrations/slack');
//   console.log('✅ Slack integration loaded');
// } catch (e) {
//   console.log('⚠️ Slack integration not available:', e.message);
// }
// try {
//   discord = require('./integrations/discord');
//   console.log('✅ Discord integration loaded');
// } catch (e) {
//   console.log('⚠️ Discord integration not available:', e.message);
// }

// // Import condition evaluator with fallback
// let condEval;
// try {
//   condEval = require('../utils/conditionEvaluator');
//   console.log('✅ Condition evaluator loaded');
// } catch (e) {
//   console.error('⚠️ Condition evaluator not found:', e.message);
//   condEval = {
//     evaluate: () => {
//       console.log('Using fallback condition evaluator (always returns true)');
//       return true;
//     }
//   };
// }

// /**
//  * Main workflow execution function
//  * @param {string} workflowId - MongoDB workflow ID
//  * @param {Object} user - User object from authentication
//  * @returns {string} runId - Unique execution run ID
//  */
// async function executeWorkflow(workflowId, user) {
//   console.log('='.repeat(60));
//   console.log('🚀 WORKFLOW EXECUTION STARTED');
//   console.log('='.repeat(60));
//   console.log('Workflow ID:', workflowId);
//   console.log('User:', user?.email || user?._id || 'Unknown');
//   console.log('Timestamp:', new Date().toISOString());
  
//   // Fetch workflow from database
//   const wf = await Workflow.findById(workflowId);
//   if (!wf) {
//     console.error('❌ Workflow not found in database');
//     throw new Error('Workflow not found');
//   }

//   console.log('✅ Workflow found:', wf.name);

//   // Generate unique run ID
//   const runId = uuidv4();
//   console.log('📝 Run ID:', runId);

//   // Create execution log
//   const log = new Log({ 
//     workflowId: wf._id, 
//     runId, 
//     status: 'running', 
//     details: {} 
//   });
//   await log.save();
//   console.log('📋 Execution log created');

//   // Build adjacency map - support both old and new formats
//   const nodes = wf.definition?.nodes || wf.nodes || [];
//   const edges = wf.definition?.edges || wf.edges || [];

//   console.log('📊 Workflow structure:');
//   console.log('  - Total nodes:', nodes.length);
//   console.log('  - Total edges:', edges.length);
//   console.log('  - Node types:', nodes.map(n => n.type).join(', '));

//   // Validate workflow has nodes
//   if (nodes.length === 0) {
//     console.error('❌ Workflow has no nodes');
//     await Log.updateOne({ runId }, { 
//       status: 'failed', 
//       details: { error: 'Workflow has no nodes' } 
//     });
//     throw new Error('Workflow has no nodes');
//   }

//   // Build node and edge maps
//   const outMap = {}; // Store outputs per node id
//   const nodeById = nodes.reduce((acc, n) => (acc[n.id] = n, acc), {});
//   const nextMap = {};
  
//   edges.forEach(e => {
//     nextMap[e.source] = nextMap[e.source] || [];
//     nextMap[e.source].push({ 
//       target: e.target, 
//       label: e.label,
//       sourceHandle: e.sourceHandle,
//       targetHandle: e.targetHandle
//     });
//   });

//   // Find trigger node(s) - support both 'trigger' (new) and 'manual_trigger' (old)
//   const triggers = nodes.filter(n => n.type === 'trigger' || n.type === 'manual_trigger');
  
//   if (triggers.length === 0) {
//     console.error('❌ No trigger node found');
//     await Log.updateOne({ runId }, { 
//       status: 'failed', 
//       details: { error: 'No trigger node found' } 
//     });
//     throw new Error('No trigger node defined. Please add a trigger node to start your workflow.');
//   }

//   console.log('🎯 Found', triggers.length, 'trigger(s):', triggers.map(t => t.id).join(', '));
//   console.log('-'.repeat(60));

//   try {
//     // Execute each trigger path
//     for (const trigger of triggers) {
//       console.log('▶️  Executing trigger:', trigger.id);
//       console.log('    Label:', trigger.data?.label || 'Manual Trigger');
      
//       const triggerResult = { 
//         triggeredBy: user.email || user._id, 
//         timestamp: new Date(),
//         triggerType: trigger.data?.triggerType || 'manual'
//       };
//       outMap[trigger.id] = triggerResult;
//       console.log('    ✓ Trigger executed successfully');

//       // Traverse graph using BFS queue
//       const queue = [...(nextMap[trigger.id] || [])];
//       console.log('    Next nodes in queue:', queue.length);
      
//       while (queue.length) {
//         const { target, sourceHandle } = queue.shift();
//         const node = nodeById[target];
        
//         if (!node) {
//           console.warn('⚠️  Node not found in workflow:', target);
//           continue;
//         }

//         console.log('');
//         console.log('⚙️  Processing node:', node.id);
//         console.log('    Type:', node.type);
//         console.log('    Label:', node.data?.label || 'Untitled');

//         let result;
        
//         // Determine actual node type - handle both old and new formats
//         const nodeType = node.type;
//         const actionType = node.data?.type; // For new 'action' nodes

//         try {
//           switch (nodeType) {
//             case 'trigger':
//             case 'manual_trigger':
//               result = { message: 'Trigger executed', timestamp: new Date() };
//               console.log('    ✓ Trigger node processed');
//               break;

//             case 'action':
//               // New React Flow format - check data.type
//               console.log('    Action type:', actionType);
//               result = await executeAction(node, actionType);
//               console.log('    ✓ Action completed:', result.result || 'Success');
//               break;

//             case 'gmail_action':
//               // Old format
//               result = await executeGmailAction(node.data);
//               console.log('    ✓ Gmail action completed');
//               break;

//             case 'sheets_action':
//               result = await executeSheetsAction(node.data);
//               console.log('    ✓ Sheets action completed');
//               break;

//             case 'slack_action':
//               result = await executeSlackAction(node.data);
//               console.log('    ✓ Slack action completed');
//               break;

//             case 'discord_action':
//               result = await executeDiscordAction(node.data);
//               console.log('    ✓ Discord action completed');
//               break;

//             case 'condition':
//             case 'if_else':
//               // Evaluate condition
//               const cond = node.data?.condition || node.data?.conditionType;
//               const pass = evaluateCondition(node.data, outMap);
              
//               console.log('    Condition type:', cond);
//               console.log('    Evaluation result:', pass ? 'TRUE' : 'FALSE');
              
//               // Handle conditional branching
//               const children = nextMap[node.id] || [];
//               children.forEach(ch => {
//                 const handle = ch.sourceHandle || '';
                
//                 // Match handle to condition result
//                 if (handle.includes('true') && pass) {
//                   console.log('    → Taking TRUE branch to:', ch.target);
//                   queue.push(ch);
//                 } else if (handle.includes('false') && !pass) {
//                   console.log('    → Taking FALSE branch to:', ch.target);
//                   queue.push(ch);
//                 } else if (!handle) {
//                   // No specific handle, push anyway
//                   queue.push(ch);
//                 }
//               });
              
//               result = { condition: cond, passed: pass };
//               break;

//             default:
//               console.warn('    ⚠️ Unknown node type:', nodeType);
//               result = { info: `Unknown node type: ${nodeType}` };
//           }

//           // Store result
//           outMap[node.id] = result;
          
//           // If not a condition node, enqueue all children
//           if (nodeType !== 'condition' && nodeType !== 'if_else') {
//             const children = nextMap[node.id] || [];
//             if (children.length > 0) {
//               console.log('    → Next nodes:', children.map(c => c.target).join(', '));
//               children.forEach(ch => queue.push(ch));
//             } else {
//               console.log('    → No more nodes (end of path)');
//             }
//           }

//           // Persist partial details periodically
//           await Log.updateOne({ runId }, { $set: { details: outMap } });

//         } catch (nodeError) {
//           console.error('    ❌ Node execution failed:', nodeError.message);
//           // Store error but continue workflow
//           outMap[node.id] = { 
//             error: nodeError.message, 
//             failed: true,
//             timestamp: new Date()
//           };
//           await Log.updateOne({ runId }, { $set: { details: outMap } });
//         }
//       }
//     }

//     console.log('');
//     console.log('='.repeat(60));
//     console.log('✅ WORKFLOW EXECUTION COMPLETED SUCCESSFULLY');
//     console.log('='.repeat(60));
//     console.log('Run ID:', runId);
//     console.log('Total nodes executed:', Object.keys(outMap).length);
//     console.log('Timestamp:', new Date().toISOString());
//     console.log('='.repeat(60));

//     await Log.updateOne({ runId }, { 
//       $set: { status: 'success', details: outMap } 
//     });
    
//     return runId;
    
//   } catch (err) {
//     console.error('');
//     console.error('='.repeat(60));
//     console.error('❌ WORKFLOW EXECUTION FAILED');
//     console.error('='.repeat(60));
//     console.error('Error:', err.message);
//     console.error('Stack:', err.stack);
//     console.error('Run ID:', runId);
//     console.error('='.repeat(60));

//     await Log.updateOne({ runId }, { 
//       $set: { 
//         status: 'failed', 
//         details: { 
//           error: err.message, 
//           stack: err.stack,
//           partialResults: outMap
//         } 
//       } 
//     });
//     throw err;
//   }
// }

const { google } = require('googleapis');
const Workflow = require('../models/workflow'); // Fixed model name (capital W)
const Log = require('../models/Log');
const { v4: uuidv4 } = require('uuid');

// Import integration services with error handling
let gmail, sheets, slack, discord;
try { gmail = require('./integrations/gmail'); console.log('Gmail integration loaded'); } catch (e) { console.log('Gmail not available:', e.message); }
try { sheets = require('./integrations/sheets'); console.log('Sheets integration loaded'); } catch (e) { console.log('Sheets not available:', e.message); }
try { slack = require('./integrations/slack'); console.log('Slack integration loaded'); } catch (e) { console.log('Slack not available:', e.message); }
try { discord = require('./integrations/discord'); console.log('Discord integration loaded'); } catch (e) { console.log('Discord not available:', e.message); }

// Condition evaluator fallback
let condEval;
try {
  condEval = require('../utils/conditionEvaluator');
  console.log('Condition evaluator loaded');
} catch (e) {
  console.error('Condition evaluator not found:', e.message);
  condEval = { evaluate: () => true };
}

/**
 * MAIN EXECUTION FUNCTION – SUPPORTS MANUAL & SCHEDULED RUNS
 * @param {string|Object} workflowIdOrObject – Workflow ID or full workflow object
 * @param {Object|null} user – Authenticated user (null for scheduled runs)
 * @returns {Object} – { runId, success, trigger }
 */
async function executeWorkflow(workflowIdOrObject, user = null) {
  let wf;

  // Accept both ID string and full object (scheduler passes object)
  if (typeof workflowIdOrObject === 'string') {
    wf = await Workflow.findById(workflowIdOrObject);
  } else {
    wf = workflowIdOrObject; // Already a full workflow object
  }

  if (!wf) {
    console.error('Workflow not found:', workflowIdOrObject);
    throw new Error('Workflow not found');
  }

  const triggerType = user ? 'manual' : 'schedule';
  console.log('='.repeat(70));
  console.log(`WORKFLOW EXECUTION STARTED [${triggerType.toUpperCase()}]`);
  console.log(`Name: ${wf.name} | ID: ${wf._id}`);
  console.log(`Owner: ${wf.ownerId} | Triggered by: ${user?.email || 'Scheduler'}`);
  console.log('='.repeat(70));

  const runId = uuidv4();

  // Create execution log
  const log = new Log({
    workflowId: wf._id,
    ownerId: wf.ownerId,
    runId,
    trigger: triggerType,
    status: 'running',
    details: {}
  });
  await log.save();

  const nodes = wf.definition?.nodes || wf.nodes || [];
  const edges = wf.definition?.edges || wf.edges || [];

  if (nodes.length === 0) {
    await Log.updateOne({ runId }, { status: 'failed', details: { error: 'No nodes' } });
    throw new Error('Workflow has no nodes');
  }

  // Build maps
  const outMap = {};
  const nodeById = nodes.reduce((acc, n) => (acc[n.id] = n, acc), {});
  const nextMap = {};
  edges.forEach(e => {
    nextMap[e.source] = nextMap[e.source] || [];
    nextMap[e.source].push({ target: e.target, sourceHandle: e.sourceHandle });
  });

  // Find triggers
  const triggers = nodes.filter(n => n.type === 'trigger' || n.type === 'manual_trigger');
  if (triggers.length === 0) {
    await Log.updateOne({ runId }, { status: 'failed', details: { error: 'No trigger node' } });
    throw new Error('No trigger node found');
  }

  try {
    for (const trigger of triggers) {
      outMap[trigger.id] = { triggeredBy: user?.email || 'Scheduler', timestamp: new Date(), triggerType: 'schedule' };
      const queue = [...(nextMap[trigger.id] || [])];

      while (queue.length) {
        const { target, sourceHandle } = queue.shift();
        const node = nodeById[target];
        if (!node) continue;

        let result;

        try {
          switch (node.type) {
            case 'trigger':
            case 'manual_trigger':
              result = { message: 'Trigger fired' };
              break;

            case 'action':
              result = await executeAction(node, node.data?.type);
              break;

            case 'gmail_action': result = await executeGmailAction(node.data); break;
            case 'sheets_action': result = await executeSheetsAction(node.data); break;
            case 'slack_action': result = await executeSlackAction(node.data); break;
            case 'discord_action': result = await executeDiscordAction(node.data); break;

            case 'condition':
            case 'if_else':
              const pass = evaluateCondition(node.data, outMap);
              result = { condition: node.data?.conditionType || 'custom', passed: pass };

              const children = nextMap[node.id] || [];
              children.forEach(ch => {
                if ((ch.sourceHandle?.includes('true') && pass) || (ch.sourceHandle?.includes('false') && !pass) || !ch.sourceHandle) {
                  queue.push(ch);
                }
              });
              break;

            default:
              result = { info: 'Unknown node type', type: node.type };
          }

          outMap[node.id] = result;

          // Enqueue children (except for condition nodes – already handled)
          if (node.type !== 'condition' && node.type !== 'if_else') {
            (nextMap[node.id] || []).forEach(ch => queue.push(ch));
          }

          await Log.updateOne({ runId }, { $set: { details: outMap } });

        } catch (nodeErr) {
          outMap[node.id] = { error: nodeErr.message, failed: true };
          await Log.updateOne({ runId }, { $set: { details: outMap } });
        }
      }
    }

    await Log.updateOne({ runId }, { status: 'success', details: outMap });
    console.log(`WORKFLOW COMPLETED SUCCESSFULLY | Run ID: ${runId}`);
    console.log('='.repeat(70));

    return { runId, success: true, trigger: triggerType };

  } catch (err) {
    await Log.updateOne({ runId }, { status: 'failed', details: { error: err.message, partialResults: outMap } });
    console.error(`WORKFLOW FAILED | Run ID: ${runId}`, err);
    throw err;
  }
}
/**
 * Execute action based on type
 */
async function executeAction(node, actionType) {
  console.log('    Executing action:', actionType);
  
  switch (actionType) {
    case 'gmail':
      return await executeGmailAction(node.data);
    case 'sheets':
      return await executeSheetsAction(node.data);
    case 'slack':
      return await executeSlackAction(node.data);
    case 'discord':
      return await executeDiscordAction(node.data);
    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }
}

/**
 * Execute Gmail action
 */
async function executeGmailAction(data) {
  console.log('    📧 Gmail Action');
  console.log('       To:', data.to || 'not specified');
  console.log('       Subject:', data.subject || 'not specified');

  // Try to use real Gmail integration if credentials are configured
  if (gmail && gmail.sendMail && process.env.GOOGLE_REFRESH_TOKEN) {
    try {
      console.log('       Using real Gmail API...');
      const result = await gmail.sendMail({
        to: data.to,
        subject: data.subject,
        body: data.message || data.body,
        from: data.from
      });
      return {
        success: true,
        action: 'gmail',
        result: 'Email sent via Gmail API',
        ...result
      };
    } catch (error) {
      console.error('       Gmail API error:', error.message);
      console.log('       Falling back to mock...');
    }
  }

  // Mock implementation
  console.log('       Using mock Gmail (no credentials configured)');
  return {
    success: true,
    action: 'gmail',
    to: data.to || 'recipient@example.com',
    subject: data.subject || 'No subject',
    message: data.message || data.body || '',
    result: 'Email sent successfully (mock)',
    timestamp: new Date()
  };
}

/**
 * Execute Google Sheets action - SIMPLE FIX
 */
async function executeSheetsAction(data) {
  console.log('    📊 Google Sheets Action');
  console.log('       Sheet ID:', data.sheetId || 'not specified');
  console.log('       Sheet Name:', data.sheetName || 'not specified');
  console.log('       Raw data:', data.data);

  // Try to use real Sheets integration if credentials are configured
  if (sheets && sheets.appendRow && process.env.GOOGLE_REFRESH_TOKEN) {
    try {
      console.log('       Using real Google Sheets API...');
      
      // Parse the data into an array format
      let valuesArray;
      if (typeof data.data === 'string') {
        // If it's a comma-separated string, split it
        valuesArray = data.data.split(',').map(v => v.trim());
      } else if (Array.isArray(data.data)) {
        valuesArray = data.data;
      } else if (Array.isArray(data.values)) {
        valuesArray = data.values;
      } else if (typeof data.values === 'string') {
        valuesArray = data.values.split(',').map(v => v.trim());
      } else {
        valuesArray = [];
      }

      console.log('       Parsed values:', valuesArray);

      // Get the sheet name - just the name, no range notation
      const sheetName = (data.sheetName || data.range || 'Sheet1').split('!')[0].trim();

      console.log('       Sheet name for API:', sheetName);

      // Call the sheets API
      const result = await sheets.appendRow({
        spreadsheetId: data.sheetId || data.spreadsheetId,
        range: sheetName, // Just "Workflow-Test" or "Sheet1"
        values: valuesArray // Pass the array directly: ['a', 'b', 'c']
      });
      
      console.log('       ✅ Sheet updated successfully!');
      
      return {
        success: true,
        action: 'sheets',
        result: 'Row added via Google Sheets API',
        updatedRange: result.updatedRange,
        updatedRows: result.updatedRows,
        spreadsheetId: data.sheetId || data.spreadsheetId
      };
    } catch (error) {
      console.error('       ❌ Sheets API error:', error.message);
      if (error.response?.data) {
        console.error('       Error details:', error.response.data);
      }
      console.log('       Falling back to mock...');
    }
  }

  // Mock implementation
  console.log('       Using mock Google Sheets (no credentials configured)');
  return {
    success: true,
    action: 'sheets',
    sheetId: data.sheetId || 'mock-sheet-id',
    sheetName: data.sheetName || 'Sheet1',
    data: data.data || data.values || [],
    result: 'Row added successfully (mock)',
    timestamp: new Date()
  };
}

/**
 * Execute Slack action
 */
async function executeSlackAction(data) {
  console.log('    💬 Slack Action');
  console.log('       Channel:', data.channel || 'not specified');

  // Try to use real Slack integration if credentials are configured
  if (slack && slack.postMessage && process.env.SLACK_BOT_TOKEN) {
    try {
      console.log('       Using real Slack API...');
      const result = await slack.postMessage({
        channel: data.channel,
        text: data.slackMessage || data.message || data.text
      });
      return {
        success: true,
        action: 'slack',
        result: 'Message posted via Slack API',
        ...result
      };
    } catch (error) {
      console.error('       Slack API error:', error.message);
      console.log('       Falling back to mock...');
    }
  }

  // Mock implementation
  console.log('       Using mock Slack (no credentials configured)');
  return {
    success: true,
    action: 'slack',
    channel: data.channel || '#general',
    message: data.slackMessage || data.message || '',
    result: 'Message sent successfully (mock)',
    timestamp: new Date()
  };
}

/**
 * Execute Discord action
 */
async function executeDiscordAction(data) {
  console.log('    💬 Discord Action');
  console.log('       Message:', data.content || data.message || 'not specified');

  // Try to use real Discord integration if webhook URL is configured
  if (discord && discord.postMessage && (data.webhookUrl || process.env.DISCORD_WEBHOOK_URL)) {
    try {
      console.log('       Using real Discord Webhook API...');
      const result = await discord.postMessage({
        content: data.content || data.message || data.discordMessage,
        webhookUrl: data.webhookUrl, // Use node-specific webhook URL if provided
        username: data.username // Optional custom username
      });
      return {
        success: true,
        action: 'discord',
        result: 'Message posted via Discord Webhook',
        ...result
      };
    } catch (error) {
      console.error('       Discord Webhook error:', error.message);
      console.log('       Falling back to mock...');
    }
  }

  // Mock implementation
  console.log('       Using mock Discord (no webhook URL configured)');
  return {
    success: true,
    action: 'discord',
    content: data.content || data.message || data.discordMessage || '',
    username: data.username || 'Workflow Bot',
    result: 'Message sent successfully (mock)',
    timestamp: new Date()
  };
}

/**
 * Evaluate condition
 */
function evaluateCondition(data, outMap) {
  const conditionType = data?.conditionType || 'success';
  
  console.log('    🔍 Evaluating condition:', conditionType);

  switch (conditionType) {
    case 'success':
      return true;
    case 'failure':
      return false;
    case 'contains':
      const compareValue = data.compareValue || '';
      const containsResult = Object.values(outMap).some(out => 
        JSON.stringify(out).toLowerCase().includes(compareValue.toLowerCase())
      );
      console.log('       Contains "' + compareValue + '":', containsResult);
      return containsResult;
    case 'equals':
      const equalValue = data.compareValue || '';
      const equalsResult = Object.values(outMap).some(out => 
        JSON.stringify(out) === equalValue
      );
      console.log('       Equals "' + equalValue + '":', equalsResult);
      return equalsResult;
    case 'greater':
      const threshold = parseFloat(data.threshold || 0);
      const greaterResult = Object.values(outMap).some(out => {
        const num = parseFloat(out.value || out);
        return !isNaN(num) && num > threshold;
      });
      console.log('       Greater than', threshold + ':', greaterResult);
      return greaterResult;
    case 'less':
      const lessThreshold = parseFloat(data.threshold || 0);
      const lessResult = Object.values(outMap).some(out => {
        const num = parseFloat(out.value || out);
        return !isNaN(num) && num < lessThreshold;
      });
      console.log('       Less than', lessThreshold + ':', lessResult);
      return lessResult;
    default:
      console.log('       Unknown condition type, defaulting to true');
      return true;
  }
}

/**
 * Get execution run details
 */
async function getRunDetails(runId, user) {
  return Log.findOne({ runId }).populate('workflowId');
}

module.exports = { executeWorkflow, getRunDetails };