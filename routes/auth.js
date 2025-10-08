// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const { createUser, findUserByEmail } = require('../models/userModel');
require('dotenv').config();

// GET /signup
router.get('/signup', (req, res) => {
  res.render('signup', { errors: [], old: {}, messages: req.flash() });
});

// GET /login
router.get('/login', (req, res) => {
  res.render('login', { messages: req.flash() });
});

// POST /signup
router.post(
  '/signup',
  [
    check('firstName').trim().notEmpty().withMessage('First name is required').escape(),
    check('lastName').trim().notEmpty().withMessage('Last name is required').escape(),
    check('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    check('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const { firstName, lastName, email, password } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).render('signup', { errors: errors.array(), old: req.body, messages: req.flash() });
    }

    try {
      const existing = await findUserByEmail(email);
      if (existing) {
        return res.status(400).render('signup', {
          errors: [{ msg: 'Email already registered' }],
          old: req.body,
          messages: req.flash()
        });
      }

      const hashed = await bcrypt.hash(password, 10);

      const isAdmin = email === process.env.ADMIN_EMAIL;

      const user = await createUser(firstName, lastName, email, hashed, isAdmin);

      req.flash('success', 'Account created. Please log in.');
      return res.redirect('/login');
    } catch (err) {
      console.error('Error creating user:', err);
      req.flash('error', 'Something went wrong. Try again.');
      return res.redirect('/signup');
    }
  }
);

// POST /login
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
);

// GET /logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'You have logged out.');
    res.redirect('/');
  });
});

module.exports = router;
