const express = require('express');
const router = express.Router();
const { getLeads, getLeadById, createLead, updateLead, deleteLead, assignLead, getPipelineLeads } = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/pipeline', getPipelineLeads);
router.get('/', getLeads);
router.get('/:id', getLeadById);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', authorize('admin', 'manager'), deleteLead);
router.put('/:id/assign', authorize('admin', 'manager'), assignLead);

module.exports = router;
