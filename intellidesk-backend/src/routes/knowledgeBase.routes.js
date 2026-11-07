const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { calculateSimilarity } = require('../utils/similarity');

// GET /api/v1/knowledge-base/solutions
router.get('/solutions', (req, res) => {
  const { category, q = '' } = req.query;
  let solutions = db.getKnowledgeBaseSolutions();

  if (category && category !== 'All') {
    solutions = solutions.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }

  if (q.trim()) {
    solutions = solutions.filter(s => {
      const text = `${s.title} ${s.description} ${s.tags.join(' ')}`;
      return text.toLowerCase().includes(q.toLowerCase()) || calculateSimilarity(q, text) > 0.35;
    });
  }

  return res.json({
    status: 'success',
    count: solutions.length,
    data: solutions,
  });
});

// GET /api/v1/knowledge-base/solutions/:id
router.get('/solutions/:id', (req, res) => {
  const solution = db.getKnowledgeBaseSolutionById(req.params.id);
  if (!solution) {
    return res.status(404).json({
      status: 'error',
      message: `Knowledge base solution ${req.params.id} not found`,
    });
  }
  return res.json({
    status: 'success',
    data: solution,
  });
});

// POST /api/v1/knowledge-base/solutions/:id/vote
router.post('/solutions/:id/vote', (req, res) => {
  const { helpful = true } = req.body;
  const solution = db.getKnowledgeBaseSolutionById(req.params.id);

  if (!solution) {
    return res.status(404).json({
      status: 'error',
      message: `Knowledge base solution ${req.params.id} not found`,
    });
  }

  const updatedVotes = helpful ? (solution.helpfulVotes || 0) + 1 : Math.max(0, (solution.helpfulVotes || 0) - 1);
  const updatedSolution = db.updateKnowledgeBaseSolution(req.params.id, { helpfulVotes: updatedVotes });

  return res.json({
    status: 'success',
    data: updatedSolution,
  });
});

module.exports = router;
