const express = require('express');
const router = express.Router();
const db = require('../data/db');

// GET /api/v1/dashboard/stats
router.get('/stats', (req, res) => {
  const incidents = db.getIncidents();

  const total = incidents.length;
  const open = incidents.filter(i => i.status !== 'Resolved').length;
  const investigating = incidents.filter(i => i.status === 'Investigating').length;
  const critical = incidents.filter(i => i.priority === 'P1').length;
  const resolved = incidents.filter(i => i.status === 'Resolved').length;

  const statusCounts = {
    new: incidents.filter(i => i.status === 'New').length,
    investigating: incidents.filter(i => i.status === 'Investigating').length,
    waiting: incidents.filter(i => i.status === 'Waiting').length,
    resolved: incidents.filter(i => i.status === 'Resolved').length,
    reopened: incidents.filter(i => i.status === 'Reopened').length,
  };

  const priorityCounts = {
    P1: incidents.filter(i => i.priority === 'P1').length,
    P2: incidents.filter(i => i.priority === 'P2').length,
    P3: incidents.filter(i => i.priority === 'P3').length,
    P4: incidents.filter(i => i.priority === 'P4').length,
  };

  const categoryMap = new Map();
  incidents.forEach(inc => {
    categoryMap.set(inc.category, (categoryMap.get(inc.category) || 0) + 1);
  });

  const categoryDistribution = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / (total || 1)) * 100),
  }));

  const recurringProblems = [
    {
      id: 'REC-01',
      service: 'Billing Service',
      pattern: 'HikariCP database connection leak on batch invoice triggers',
      occurrences30d: 4,
      avgResolutionMinutes: 44,
      lastIncidentId: 'INC-2024-1042',
      status: 'Active Risk',
    },
    {
      id: 'REC-02',
      service: 'Payment Gateway',
      pattern: 'Third-party webhook callback timeout during traffic spikes',
      occurrences30d: 3,
      avgResolutionMinutes: 26,
      lastIncidentId: 'INC-2024-1039',
      status: 'Under Investigation',
    },
    {
      id: 'REC-03',
      service: 'Auth Service',
      pattern: 'Redis maxmemory OOM eviction on unconstrained cart keys',
      occurrences30d: 2,
      avgResolutionMinutes: 38,
      lastIncidentId: 'INC-2024-1033',
      status: 'Fix Pending',
    },
  ];

  return res.json({
    status: 'success',
    data: {
      totalIncidents: total,
      openIncidents: open,
      investigatingCount: investigating,
      criticalCount: critical,
      resolvedCount: resolved,
      mttaMinutes: 4.2,
      mttrMinutes: 38.5,
      alertReductionPercent: 78,
      repeatIncidentRate: 12,
      knowledgeReusePercent: 86,
      statusCounts,
      priorityCounts,
      categoryDistribution,
      recurringProblems,
    },
  });
});

// GET /api/v1/dashboard/system-health
router.get('/system-health', (req, res) => {
  const services = db.getSystemServices();
  return res.json({
    status: 'success',
    data: services,
  });
});

module.exports = router;
