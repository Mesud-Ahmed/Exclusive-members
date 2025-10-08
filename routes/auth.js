// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

const { createUser, findUserByEmail } = require('../models/userModel');

// GET /signup
router.get('/signup', (req, res) => {
  res.render('signup', { errors: [], old: {}, messages: req.flash() });
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
    const admin = req.body.admin === 'on';

    if (!errors.isEmpty()) {
      return res.status(400).render('signup', { errors: errors.array(), old: req.body, messages: req.flash() });
    }

    try {
      const existing = await findUserByEmail(email);
      if (existing) {
        return res.status(400).render('signup', { errors: [{ msg: 'Email already registered' }], old: req.body, messages: req.flash() });
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await createUser(firstName, lastName, email, hashed, admin);

      req.flash('success', 'Account created. Please log in.');
      return res.redirect('/login');
    } catch (err) {
      console.error('Error creating user:', err);
      req.flash('error', 'Something went wrong. Try again.');
      return res.redirect('/signup');
    }
  }
);

module.exports = router;
