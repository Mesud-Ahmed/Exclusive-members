// config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { findUserByEmail, findUserById } = require('../models/userModel');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' }, // we use email as username
      async (email, password, done) => {
        try {
          const user = await findUserByEmail(email);
          if (!user) {
            return done(null, false, { message: 'Incorrect email or password' });
          }

          const match = await bcrypt.compare(password, user.password);
          if (!match) {
            return done(null, false, { message: 'Incorrect email or password' });
          }

          // success
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // store user id in session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // read user from id stored in session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await findUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
