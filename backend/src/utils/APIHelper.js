// Helper utilities for dynamic API parsing and variable evaluation

// Resolves a nested property path from a context object (e.g. "req.body.name")
function resolveValue(expression, context) {
  try {
    const path = expression.trim();
    const parts = path.split('.');
    let current = context;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    return current;
  } catch (err) {
    return undefined;
  }
}

// Recursively processes values, substituting placeholders like {{req.body.key}}
function evaluateTemplate(template, context) {
  if (typeof template === 'string') {
    // If the template is exactly a single placeholder, return the resolved value directly (keeps type like boolean/object)
    const exactMatch = template.match(/^\{\{([^}]+)\}\}$/);
    if (exactMatch) {
      const val = resolveValue(exactMatch[1], context);
      return val !== undefined ? val : '';
    }
    
    // Otherwise, replace inline within the string
    return template.replace(/\{\{([^}]+)\}\}/g, (match, exp) => {
      const val = resolveValue(exp, context);
      return val !== undefined ? (typeof val === 'object' ? JSON.stringify(val) : val) : '';
    });
  }
  
  if (Array.isArray(template)) {
    return template.map(item => evaluateTemplate(item, context));
  }
  
  if (template !== null && typeof template === 'object') {
    const result = {};
    for (const key of Object.keys(template)) {
      result[key] = evaluateTemplate(template[key], context);
    }
    return result;
  }
  
  return template;
}

// Safely evaluates dynamic Javascript boolean conditions
function evaluateCondition(conditionStr, context) {
  if (!conditionStr || conditionStr.trim() === '') return true;
  try {
    // Standard function executor using context bindings
    const func = new Function('req', 'steps', `return Boolean(${conditionStr});`);
    return func(context.req, context.steps);
  } catch (err) {
    console.error('Condition evaluation error:', conditionStr, err.message);
    return false;
  }
}

module.exports = {
  evaluateTemplate,
  evaluateCondition
};
