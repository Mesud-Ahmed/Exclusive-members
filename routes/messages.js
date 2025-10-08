// routes/messages.js
const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();

const { createMessage, getAllMessages, deleteMessage } = require('../models/messageModel');

// Middleware to ensure user is logged in
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  req.flash('error', 'You must log in to do that.');
  res.redirect('/login');
}

// Middleware to ensure admin access
function ensureAdmin(req, res, next) {
  if (req.user && req.user.admin) return next();
  req.flash('error', 'Admins only');
  res.redirect('/');
}

// HOME: show all messages
// GET /
router.get('/', async (req, res) => {
  try {
    const messagesList = await getAllMessages();
    // render message_list and avoid clashing variable names with flash messages
    res.render('message_list', { messagesList });
  } catch (err) {
    console.error('Error fetching messages:', err);
    req.flash('error', 'Could not load messages.');
    res.render('message_list', { messagesList: [] });
  }
});

// GET /messages/new - show new message form (must be logged in)
router.get('/messages/new', ensureAuthenticated, (req, res) => {
  res.render('message_form', { errors: [], old: {} });
});

// POST /messages/new - create message
router.post(
  '/messages/new',
  ensureAuthenticated,
  [
    check('title').trim().notEmpty().withMessage('Title is required').escape(),
    check('text').trim().notEmpty().withMessage('Text is required').escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const { title, text } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).render('message_form', { errors: errors.array(), old: req.body });
    }

    try {
      // correct argument order: userId, title, text
      await createMessage(req.user.id, title, text);
      req.flash('success', 'Message created.');
      res.redirect('/');
    } catch (err) {
      console.error('Error creating message:', err);
      req.flash('error', 'Could not create message.');
      res.redirect('/messages/new');
    }
  }
);

// GET /messages/delete/:id - admin only
router.get('/messages/delete/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    await deleteMessage(req.params.id);
    req.flash('success', 'Message deleted.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not delete message.');
  }
  res.redirect('/');
});

module.exports = router;
