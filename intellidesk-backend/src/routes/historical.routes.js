const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { calculateSimilarity } = require('../utils/similarity');

// GET /api/v1/historical/search
router.get('/search', (req, res) => {
  const { q = '', service, minSimilarity = 0.3 } = req.query;
  const historical = db.getHistoricalIncidents();

  let results = historical;

  if (service && service !== 'all') {
    results = results.filter(item => item.service.toLowerCase() === service.toLowerCase());
  }

  if (q.trim()) {
    results = results.map(item => {
      const matchText = `${item.title} ${item.description} ${item.resolution} ${item.rootCause}`;
      const score = calculateSimilarity(q, matchText);
      return {
        ...item,
        similarityScore: Math.max(score, item.similarityScore || 0.5),
      };
    });

    results = results.filter(item => item.similarityScore >= parseFloat(minSimilarity));
    results.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  return res.json({
    status: 'success',
    count: results.length,
    data: results,
  });
});

// GET /api/v1/historical/:id
router.get('/:id', (req, res) => {
  const item = db.getHistoricalIncidentById(req.params.id);
  if (!item) {
    return res.status(404).json({
      status: 'error',
      message: `Historical incident ${req.params.id} not found`,
    });
  }
  return res.json({
    status: 'success',
    data: item,
  });
});

module.exports = router;
