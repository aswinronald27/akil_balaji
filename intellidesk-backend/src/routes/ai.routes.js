const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { analyzeRootCause } = require('../utils/aiEngine');

// GET /api/v1/ai/root-cause-analysis?incidentId=...
router.get('/root-cause-analysis', async (req, res) => {
  const { incidentId } = req.query;

  if (!incidentId) {
    return res.status(400).json({
      status: 'error',
      message: 'incidentId query parameter is required.',
    });
  }

  let rca = db.getRootCauseAnalysis(incidentId);

  // If no pre-baked RCA exists for this incidentId, dynamically generate one via AI engine
  if (!rca) {
    const incident = db.getIncidentById(incidentId);
    if (!incident) {
      return res.status(404).json({
        status: 'error',
        message: `Incident ${incidentId} not found`,
      });
    }

    try {
      rca = await analyzeRootCause(incident);
      db.saveRootCauseAnalysis(rca);
    } catch (err) {
      console.error('[AI RCA Error]', err);
      return res.status(500).json({
        status: 'error',
        message: `Failed to analyze incident root cause: ${err.message}`,
      });
    }
  }

  return res.json({
    status: 'success',
    data: rca,
  });
});

// POST /api/v1/ai/recommendation-feedback
router.post('/recommendation-feedback', (req, res) => {
  const { incidentId, recommendationId, feedback, comments } = req.body;

  // Log feedback
  console.log(`[AI Feedback] Incident: ${incidentId}, Rec: ${recommendationId}, Feedback: ${feedback}, Comments: ${comments}`);

  return res.json({
    status: 'success',
    message: 'Recommendation feedback recorded successfully.',
    data: {
      incidentId,
      recommendationId,
      feedback,
      recordedAt: new Date().toISOString(),
    },
  });
});

// POST /api/v1/ai/recovery-action/:actionId/execute
router.post('/recovery-action/:actionId/execute', (req, res) => {
  const { actionId } = req.params;
  const { incidentId, approvedBy = 'Alex Chen' } = req.body;

  if (incidentId) {
    const incident = db.getIncidentById(incidentId);
    if (incident) {
      const now = new Date().toISOString();
      const updatedTimeline = [
        ...(incident.timeline || []),
        {
          id: `TL-${Date.now()}`,
          time: now,
          author: approvedBy,
          type: 'action_executed',
          content: `AI Recovery Action ${actionId} approved and initiated by ${approvedBy}. Verification telemetry running.`,
        },
      ];
      db.updateIncident(incidentId, { timeline: updatedTimeline });
    }
  }

  return res.json({
    status: 'success',
    message: `Recovery action ${actionId} successfully dispatched for execution.`,
    executionReceipt: {
      actionId,
      incidentId,
      executedBy: approvedBy,
      status: 'In Progress',
      dispatchedAt: new Date().toISOString(),
    },
  });
});

module.exports = router;
