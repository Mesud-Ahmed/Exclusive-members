// routes/membership.js
const express = require('express');
const router = express.Router();
const { updateMembershipStatus } = require('../models/userModel');

// Hardcode your secret passcode
const CLUB_SECRET = 'open-sesame';

// Middleware to make sure user is logged in
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You must log in first.');
  res.redirect('/login');
}

// GET /join
router.get('/join', ensureAuthenticated, (req, res) => {
  res.render('join', { messages: req.flash() });
});

// POST /join
router.post('/join', ensureAuthenticated, async (req, res) => {
  const { passcode } = req.body;

  if (passcode === CLUB_SECRET) {
    try {
      await updateMembershipStatus(req.user.id, 'member');
      req.flash('success', '🎉 You are now a club member!');
      return res.redirect('/');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Database error. Please try again.');
      return res.redirect('/join');
    }
  } else {
    req.flash('error', '❌ Incorrect passcode.');
    return res.redirect('/join');
  }
});

module.exports = router;
