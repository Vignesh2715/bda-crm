const express = require('express');
const router = express.Router();
const { getFollowUps, getTodayFollowUps, createFollowUp, updateFollowUp, deleteFollowUp } = require('../controllers/followUpController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/today', getTodayFollowUps);
router.get('/', getFollowUps);
router.post('/', createFollowUp);
router.put('/:id', updateFollowUp);
router.delete('/:id', deleteFollowUp);

module.exports = router;
