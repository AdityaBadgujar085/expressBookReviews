const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

// Session for /customer routes
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
  })
);

// Authentication middleware for protected customer routes
app.use("/customer/auth/*", function auth(req, res, next) {
  try {
    // We expect login to set: req.session.authorization = { accessToken, username }
    if (!req.session || !req.session.authorization) {
      return res.status(403).json({ message: "User not logged in" });
    }
    const token = req.session.authorization.accessToken;
    jwt.verify(token, "access", (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      // Attach username onto req for downstream usage
      req.user = { username: decoded.username };
      next();
    });
  } catch (e) {
    return res.status(500).json({ message: "Auth middleware error", error: String(e) });
  }
});

const PORT = 5000;
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
