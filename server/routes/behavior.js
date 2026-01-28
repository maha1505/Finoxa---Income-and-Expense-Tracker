const express = require('express');
const router = express.Router();
const behaviorController = require('../controllers/behaviorController');
const auth = require('../middleware/authMiddleware');

// @route   GET api/behavior/letter/latest
// @desc    Get latest future self letter
// @access  Private
router.get('/letter/latest', auth, behaviorController.getLatestLetter);

// @route   GET api/behavior/letter/archive
// @desc    Get all archived letters
// @access  Private
router.get('/letter/archive', auth, behaviorController.getArchivedLetters);

// @route   GET api/behavior/streak
// @desc    Get current streak
// @access  Private
router.get('/streak', auth, behaviorController.getStreak);

// @route   GET api/behavior/scores
// @desc    Get regret scores
// @access  Private
router.get('/scores', auth, behaviorController.getRegretScores);

// @route   POST api/behavior/evaluate
// @desc    Trigger streak evaluation (for testing/CRON)
// @access  Private
router.post('/evaluate', auth, behaviorController.triggerEvaluation);

// @route   POST api/behavior/generate-letter
// @desc    Trigger letter generation (for testing/CRON)
// @access  Private
router.post('/generate-letter', auth, behaviorController.triggerLetterGeneration);

module.exports = router;
