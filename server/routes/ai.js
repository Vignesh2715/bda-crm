const express = require('express');
const router = express.Router();
const { generateInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/insights/:leadId', generateInsights);

module.exports = router;
