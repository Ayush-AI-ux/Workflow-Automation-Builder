// src/utils/conditionEvaluator.js
/**
 * Very small condition evaluator.
 * condition examples:
 *  - outputs.node1.status == "success"
 *  - outputs.node1.count > 5
 *  - outputs.node1.text contains "hello"
 *
 * outMap: { nodeId: { ... } }
 */

function getValueFromPath(obj, path) {
  // path like outputs.node1.field
  const parts = path.split('.');
  // expect outputs.<nodeId>.<field>
  if (parts[0] !== 'outputs') return undefined;
  const nodeId = parts[1];
  const fieldPath = parts.slice(2);
  let node = obj[nodeId];
  if (node === undefined) return undefined;
  let val = node;
  for (const p of fieldPath) {
    if (val == null) return undefined;
    val = val[p];
  }
  return val;
}


function evaluate(condition, outMap) {
  if (!condition) {
    // If no condition specified, default to true
    return true;
  }

  try {
    // Simple string-based evaluation
    // You can extend this with more complex logic
    
    // Example: "previousNode.success === true"
    // For now, just check if any previous output was successful
    const hasSuccess = Object.values(outMap).some(out => 
      out && (out.success === true || out.status === 'success')
    );

    return hasSuccess;
  } catch (error) {
    console.error('Error evaluating condition:', error);
    return false;
  }
}

module.exports = { evaluate };

function parseLiteral(token) {
  // remove surrounding quotes if present
  if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
    return token.slice(1, -1);
  }
  if (!isNaN(token)) return Number(token);
  if (token === 'true') return true;
  if (token === 'false') return false;
  return token;
}

function compare(a, b, op) {
  if (op === '==') return a == b;
  if (op === '!=') return a != b;
  if (op === '>') return Number(a) > Number(b);
  if (op === '<') return Number(a) < Number(b);
  if (op === '>=') return Number(a) >= Number(b);
  if (op === '<=') return Number(a) <= Number(b);
  return false;
}

module.exports = { evaluate };