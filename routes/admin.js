const express = require('express');
const router = express.Router();
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');
const Gallery = require('../models/Gallery');
const Package = require('../models/Package');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');

// Login routes
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('admin/login');
});

router.post('/login', isNotAuthenticated, (req, res) => {
  const { username, password } = req.body;
  
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.isAuthenticated = true;
    res.redirect('/admin/dashboard');
  } else {
    res.render('admin/login', { error: 'Invalid credentials' });
  }
});

// Dashboard routes
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const galleries = await Gallery.find().sort('-createdAt');
    const packages = await Package.find().sort('-createdAt');
    const bookings = await Booking.find().sort('-createdAt');
    const contacts = await Contact.find().sort('-createdAt');
    
    res.render('admin/dashboard', {
      galleries,
      packages,
      bookings,
      contacts
    });
  } catch (error) {
    res.status(500).render('error', { error });
  }
});

// Gallery management routes
router.post('/gallery', isAuthenticated, async (req, res) => {
  try {
    const { title, imageUrl } = req.body;
    await Gallery.create({ title, imageUrl });
    res.redirect('/admin/dashboard');
  } catch (error) {
    res.status(500).render('error', { error });
  }
});

router.delete('/gallery/:id', isAuthenticated, async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Package management routes
router.post('/package', isAuthenticated, async (req, res) => {
  try {
    const { name, description, price, imageUrl, features } = req.body;
    await Package.create({ name, description, price, imageUrl, features });
    res.redirect('/admin/dashboard');
  } catch (error) {
    res.status(500).render('error', { error });
  }
});

router.delete('/package/:id', isAuthenticated, async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout route
router.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

module.exports = router;