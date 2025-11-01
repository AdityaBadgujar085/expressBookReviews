const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios').default;

const public_users = express.Router();

/* ---------------------------
   Task 1: Get all books
---------------------------- */
public_users.get('/', function (req, res) {
  try {
    // Neatly formatted JSON
    return res.status(200).send(JSON.stringify(books, null, 2));
  } catch (e) {
    return res.status(500).json({ message: 'Error fetching books', error: String(e) });
  }
});

/* -----------------------------------
   Task 2: Get book details by ISBN
------------------------------------ */
public_users.get('/isbn/:isbn', function (req, res) {
  try {
    const { isbn } = req.params;
    const book = books[isbn];
    if (!book) return res.status(404).json({ message: `No book found for ISBN ${isbn}` });
    return res.status(200).json(book);
  } catch (e) {
    return res.status(500).json({ message: 'Error fetching by ISBN', error: String(e) });
  }
});

/* ------------------------------------
   Task 3: Get books by Author
------------------------------------- */
public_users.get('/author/:author', function (req, res) {
  try {
    const { author } = req.params;
    const results = [];
    Object.keys(books).forEach((k) => {
      if (books[k].author && books[k].author.toLowerCase() === author.toLowerCase()) {
        results.push({ isbn: k, ...books[k] });
      }
    });
    if (results.length === 0) {
      return res.status(404).json({ message: `No books found for author '${author}'` });
    }
    return res.status(200).json(results);
  } catch (e) {
    return res.status(500).json({ message: 'Error fetching by author', error: String(e) });
  }
});

/* -----------------------------------
   Task 4: Get books by Title
------------------------------------ */
public_users.get('/title/:title', function (req, res) {
  try {
    const { title } = req.params;
    const results = [];
    Object.keys(books).forEach((k) => {
      if (books[k].title && books[k].title.toLowerCase() === title.toLowerCase()) {
        results.push({ isbn: k, ...books[k] });
      }
    });
    if (results.length === 0) {
      return res.status(404).json({ message: `No books found with title '${title}'` });
    }
    return res.status(200).json(results);
  } catch (e) {
    return res.status(500).json({ message: 'Error fetching by title', error: String(e) });
  }
});

/* -----------------------------
   Task 5: Get book reviews
------------------------------ */
public_users.get('/review/:isbn', function (req, res) {
  try {
    const { isbn } = req.params;
    const book = books[isbn];
    if (!book) return res.status(404).json({ message: `No book found for ISBN ${isbn}` });
    return res.status(200).json(book.reviews || {});
  } catch (e) {
    return res.status(500).json({ message: 'Error fetching reviews', error: String(e) });
  }
});

/* -----------------------------
   Task 6: Register new user
------------------------------ */
public_users.post('/register', function (req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if (!isValid(username)) {
      // isValid should return false if already exists; we’ll handle as below
      return res.status(409).json({ message: "Username already exists" });
    }
    // Save new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
  } catch (e) {
    return res.status(500).json({ message: 'Registration error', error: String(e) });
  }
});

/* ==========================================================
   Tasks 10–13: Async/Await or Promises using Axios
   - These call our own server endpoints to demonstrate async.
   Endpoints provided:
     /books/async
     /isbn/:isbn/async
     /author/:author/async
     /title/:title/async
   ========================================================== */

// Task 10: All books (async)
public_users.get('/books/async', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).json(response.data);
  } catch (e) {
    return res.status(500).json({ message: 'Async fetch all books failed', error: String(e) });
  }
});

// Task 11: By ISBN (async)
public_users.get('/isbn/:isbn/async', async (req, res) => {
  try {
    const { isbn } = req.params;
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (e) {
    return res.status(500).json({ message: 'Async fetch by ISBN failed', error: String(e) });
  }
});

// Task 12: By Author (async)
public_users.get('/author/:author/async', async (req, res) => {
  try {
    const { author } = req.params;
    const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
    return res.status(200).json(response.data);
  } catch (e) {
    return res.status(500).json({ message: 'Async fetch by author failed', error: String(e) });
  }
});

// Task 13: By Title (async)
public_users.get('/title/:title/async', async (req, res) => {
  try {
    const { title } = req.params;
    const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
    return res.status(200).json(response.data);
  } catch (e) {
    return res.status(500).json({ message: 'Async fetch by title failed', error: String(e) });
  }
});

module.exports.general = public_users;
