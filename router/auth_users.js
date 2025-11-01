const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

// In-memory users store (simple demo)
let users = [];

/* ------------------------------------
   Helpers required by the starter code
------------------------------------- */

// Return false if username already exists; true if available
const isValid = (username) => {
  const existing = users.find(u => u.username === username);
  // If user exists, not valid for new registration
  return existing ? false : true;
};

// Validate credentials for login
const authenticatedUser = (username, password) => {
  const found = users.find(u => u.username === username && u.password === password);
  return !!found;
};

/* -----------------------------
   Task 7: Login (customer)
   Endpoint: /customer/login
------------------------------ */
regd_users.post("/login", (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Create JWT and store in session
    const accessToken = jwt.sign({ username }, "access", { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "Customer logged in successfully", token: accessToken });
  } catch (e) {
    return res.status(500).json({ message: "Login error", error: String(e) });
  }
});

/* ------------------------------------------------
   Task 8: Add/Modify a review (auth required)
   Endpoint: /customer/auth/review/:isbn
   - review content provided via query ?review=...
   - stored under book.reviews[username]
------------------------------------------------- */
regd_users.put("/auth/review/:isbn", (req, res) => {
  try {
    const { isbn } = req.params;
    const reviewText = req.query.review;
    if (!reviewText) {
      return res.status(400).json({ message: "Review text required as query ?review=" });
    }
    const book = books[isbn];
    if (!book) return res.status(404).json({ message: `No book found for ISBN ${isbn}` });

    // Username from auth middleware/session (set in index.js middleware)
    const username =
      (req.user && req.user.username) ||
      (req.session && req.session.authorization && req.session.authorization.username);

    if (!username) return res.status(403).json({ message: "Not authorized" });

    if (!book.reviews) book.reviews = {};
    const action = book.reviews[username] ? "updated" : "added";
    book.reviews[username] = reviewText;

    return res.status(200).json({ message: `Review ${action} successfully`, reviews: book.reviews });
  } catch (e) {
    return res.status(500).json({ message: "Error adding/modifying review", error: String(e) });
  }
});

/* ------------------------------------------------
   Task 9: Delete own review (auth required)
   Endpoint: /customer/auth/review/:isbn
------------------------------------------------- */
regd_users.delete("/auth/review/:isbn", (req, res) => {
  try {
    const { isbn } = req.params;
    const book = books[isbn];
    if (!book) return res.status(404).json({ message: `No book found for ISBN ${isbn}` });

    const username =
      (req.user && req.user.username) ||
      (req.session && req.session.authorization && req.session.authorization.username);

    if (!username) return res.status(403).json({ message: "Not authorized" });

    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username];
      return res.status(200).json({ message: "Your review deleted", reviews: book.reviews });
    } else {
      return res.status(404).json({ message: "You have no review to delete for this ISBN" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Error deleting review", error: String(e) });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
