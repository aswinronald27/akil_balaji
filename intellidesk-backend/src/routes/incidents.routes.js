const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { classifyIncident } = require('../utils/classifier');

// POST /api/v1/incidents/classify (Must be defined before /:id to prevent route clash)
router.post('/classify', (req, res) => {
  const { title, description, service, errorLogs } = req.body;
  const result = classifyIncident({ title, description, service, errorLogs });
  return res.json({
    status: 'success',
    data: result,
  });
});

// GET /api/v1/incidents
router.get('/', (req, res) => {
  const { status, priority, category, service, search } = req.query;
  const incidents = db.getIncidents({ status, priority, category, service, search });
  return res.json({
    status: 'success',
    count: incidents.length,
    data: incidents,
  });
});

// GET /api/v1/incidents/:id
router.get('/:id', (req, res) => {
  const incident = db.getIncidentById(req.params.id);
  if (!incident) {
    return res.status(404).json({
      status: 'error',
      message: `Incident ${req.params.id} not found`,
    });
  }
  return res.json({
    status: 'success',
    data: incident,
  });
});

// POST /api/v1/incidents
router.post('/', (req, res) => {
  const {
    title,
    description,
    service = 'unknown',
    priority,
    category,
    assignee = 'Alex Chen',
    affectedComponents = [],
    errorLogs = '',
  } = req.body;

  if (!title) {
    return res.status(400).json({
      status: 'error',
      message: 'Title is required to report an incident.',
    });
  }

  // Auto-classify if priority or category is omitted
  const classification = classifyIncident({ title, description, service, errorLogs });
  const finalPriority = priority || classification.priority;
  const finalCategory = category || classification.category;
  const finalService = service !== 'unknown' ? service : classification.suggestedService;

  const now = new Date().toISOString();
  const count = db.getIncidents().length + 1;
  const id = `INC-${String(count).padStart(4, '0')}`;

  const newIncident = {
    id,
    title,
    description: description || title,
    service: finalService,
    status: 'Investigating',
    priority: finalPriority,
    category: finalCategory,
    assignee,
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
    impact: finalPriority.startsWith('P1') ? 'High / Critical outage' : 'Degraded performance',
    affectedComponents: affectedComponents.length > 0 ? affectedComponents : [finalService],
    timeline: [
      {
        id: `TL-${Date.now()}-1`,
        time: now,
        author: 'System Monitor',
        type: 'alert',
        content: `Incident logged: "${title}" assigned to ${assignee}`,
      },
    ],
    preventionTasks: [],
  };

  const created = db.createIncident(newIncident);

  return res.status(201).json({
    status: 'success',
    data: created,
  });
});

// PATCH /api/v1/incidents/:id/status
router.patch('/:id/status', (req, res) => {
  const { status, author = 'Alex Chen', comment } = req.body;
  const incident = db.getIncidentById(req.params.id);

  if (!incident) {
    return res.status(404).json({
      status: 'error',
      message: `Incident ${req.params.id} not found`,
    });
  }

  const updates = { status, updatedAt: new Date().toISOString() };
  if (status === 'Resolved' && !incident.resolvedAt) {
    updates.resolvedAt = new Date().toISOString();
  }

  const timelineEntry = {
    id: `TL-${Date.now()}`,
    time: updates.updatedAt,
    author,
    type: 'status_change',
    content: comment || `Incident status updated to "${status}"`,
  };

  const updatedTimeline = [...(incident.timeline || []), timelineEntry];
  updates.timeline = updatedTimeline;

  const updatedIncident = db.updateIncident(req.params.id, updates);

  return res.json({
    status: 'success',
    data: updatedIncident,
  });
});

// POST /api/v1/incidents/:id/prevention-tasks
router.post('/:id/prevention-tasks', (req, res) => {
  const { title, assignee = 'DevOps Team', priority = 'Medium', status = 'Todo' } = req.body;
  const incident = db.getIncidentById(req.params.id);

  if (!incident) {
    return res.status(404).json({
      status: 'error',
      message: `Incident ${req.params.id} not found`,
    });
  }

  const newTask = {
    id: `TSK-${Date.now().toString().slice(-4)}`,
    title: title || 'Follow-up preventative architecture fix',
    assignee,
    priority,
    status,
    createdAt: new Date().toISOString(),
  };

  const updatedTasks = [...(incident.preventionTasks || []), newTask];
  const updatedIncident = db.updateIncident(req.params.id, { preventionTasks: updatedTasks });

  return res.status(201).json({
    status: 'success',
    data: newTask,
    incident: updatedIncident,
  });
});

module.exports = router;
