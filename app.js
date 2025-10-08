// app.js (important parts)
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const path = require("path");
const messagesRouter = require("./routes/messages");

const authRouter = require("./routes/auth");
const membershipRouter = require("./routes/membership"); // join page
// other routers: messages, etc.

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
// serve static assets (css, images, js)
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport); // <-- passport config

// Convenience: expose current user and flash messages to every view
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.messages = req.flash(); // { error: [...], success: [...] }
  next();
});

app.use("/", messagesRouter);
app.use("/", authRouter);
app.use("/", membershipRouter);

app.listen(3000, () =>
  console.log("Clubhouse running on http://localhost:3000")
);
