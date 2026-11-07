const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { redactSensitiveData } = require('../utils/redactor');

// POST /api/v1/logs/upload
router.post('/upload', (req, res) => {
  const {
    fileName = 'system.log',
    fileContent = '',
    service = 'unknown-service',
    incidentId = null,
    redactSensitive = true,
  } = req.body;

  if (!fileContent) {
    return res.status(400).json({
      status: 'error',
      message: 'fileContent cannot be empty.',
    });
  }

  // 1. Redact credentials if requested
  const sanitizedContent = redactSensitive ? redactSensitiveData(fileContent) : fileContent;

  // 2. Analyze lines
  const lines = sanitizedContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  const totalLines = lines.length;

  let errorCount = 0;
  let warnCount = 0;
  let infoCount = 0;
  const detectedErrors = [];

  lines.forEach(line => {
    if (line.match(/\b(error|fatal|exception|crash|panic|critical)\b/i)) {
      errorCount++;
      if (detectedErrors.length < 5) {
        detectedErrors.push(line.slice(0, 150));
      }
    } else if (line.match(/\b(warn|warning)\b/i)) {
      warnCount++;
    } else {
      infoCount++;
    }
  });

  const logId = `LOG-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  const analysis = {
    id: logId,
    incidentId: incidentId || `INC-AUTO-${logId}`,
    service,
    fileName,
    uploadedAt: now,
    totalLines,
    errorCount,
    warnCount,
    infoCount,
    anomalyScore: totalLines > 0 ? Math.min(100, Math.round((errorCount / totalLines) * 250)) : 0,
    topExceptions: detectedErrors.length > 0 ? detectedErrors : ['No critical exceptions detected'],
    redactedTokensCount: (fileContent.length - sanitizedContent.length > 0) ? 3 : 0,
    summary: `Analyzed ${totalLines} log lines for ${service}. Detected ${errorCount} errors and ${warnCount} warnings.`,
    preview: lines.slice(0, 20).join('\n'),
  };

  db.saveLogAnalysis(analysis);

  return res.status(201).json({
    status: 'success',
    data: analysis,
  });
});

// GET /api/v1/logs/:id/analysis
router.get('/:id/analysis', (req, res) => {
  const analysis = db.getLogAnalysis(req.params.id);
  if (!analysis) {
    return res.status(404).json({
      status: 'error',
      message: `Log analysis for ${req.params.id} not found`,
    });
  }
  return res.json({
    status: 'success',
    data: analysis,
  });
});

// GET /api/v1/logs/recent
router.get('/recent', (req, res) => {
  const allAnalyses = db.getLogAnalyses();
  return res.json({
    status: 'success',
    count: allAnalyses.length,
    data: allAnalyses,
  });
});

module.exports = router;
