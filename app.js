require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const authRouter = require('./routes/auth');


const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET || 'devsecret', resave: false, saveUninitialized: false }));

app.use(flash());


// Routes
app.use('/', authRouter);


app.listen(3000, () => console.log('Clubhouse running on http://localhost:3000'));
