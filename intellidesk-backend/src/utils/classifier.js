/**
 * AI Classifier utility for incident categorization, priority assignment, and service suggestion.
 */
function classifyIncident({ title = '', description = '', service = '', errorLogs = '' }) {
  const content = `${title} ${description} ${service} ${errorLogs}`.toLowerCase();

  let category = 'Application';
  let priority = 'P3 - Medium';
  let confidence = 0.85;
  const tags = [];

  // Categorization heuristics
  if (content.match(/database|sql|postgres|mysql|query|deadlock|pool|connection timeout|slow query|replica/i)) {
    category = 'Database';
    tags.push('database', 'query-performance');
    confidence = 0.94;
  } else if (content.match(/auth|jwt|token|login|sso|oauth|unauthorized|401|403|credential|session/i)) {
    category = 'Authentication';
    tags.push('auth', 'security-identity');
    confidence = 0.96;
  } else if (content.match(/network|dns|latency|packet|gateway|502|503|504|timeout|socket|proxy|egress/i)) {
    category = 'Network';
    tags.push('networking', 'traffic');
    confidence = 0.91;
  } else if (content.match(/storage|disk|s3|volume|ebs|nfs|out of disk|quota|full disk/i)) {
    category = 'Storage';
    tags.push('storage', 'capacity');
    confidence = 0.89;
  } else if (content.match(/cpu|memory|oom|heap|node|pod|k8s|kubernetes|crashloop|reboot/i)) {
    category = 'Infrastructure';
    tags.push('infrastructure', 'compute');
    confidence = 0.92;
  } else if (content.match(/security|breach|ddos|attack|cve|vulnerability|exploit|malicious/i)) {
    category = 'Security';
    tags.push('security', 'cve');
    confidence = 0.97;
  }

  // Priority heuristics
  if (
    content.match(/critical|outage|down|all users|revenue|payment fail|data loss|breach|p1|production down|emergency/i)
  ) {
    priority = 'P1 - Critical';
  } else if (
    content.match(/high|degraded|slow|majority|timeout|elevated|p2|error spike|failover/i)
  ) {
    priority = 'P2 - High';
  } else if (
    content.match(/low|minor|cosmetic|warning|info|p4|typo|non-blocking/i)
  ) {
    priority = 'P4 - Low';
  }

  // Service suggestion if not provided or to reinforce
  let suggestedService = service;
  if (!suggestedService || suggestedService === 'unknown') {
    if (category === 'Authentication') suggestedService = 'auth-service';
    else if (category === 'Database') suggestedService = 'database-cluster';
    else if (content.includes('payment') || content.includes('checkout') || content.includes('stripe')) suggestedService = 'payment-gateway';
    else if (content.includes('order') || content.includes('inventory')) suggestedService = 'order-service';
    else if (content.includes('notification') || content.includes('email') || content.includes('sms')) suggestedService = 'notification-service';
    else suggestedService = 'api-gateway';
  }

  return {
    category,
    priority,
    confidence: Math.round(confidence * 100) / 100,
    suggestedService,
    tags: Array.from(new Set(tags)),
    summary: `Heuristically classified as ${category} incident with ${priority} urgency.`,
  };
}

module.exports = {
  classifyIncident,
};
