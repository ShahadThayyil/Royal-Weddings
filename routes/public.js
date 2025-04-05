const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const Package = require('../models/Package');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');

// Home page
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find().limit(4);
    const galleries = await Gallery.find().limit(8);
    res.render('public/home', { packages, galleries });
  } catch (error) {
    res.status(500).render('error', { error });
  }
});

// About page
router.get('/about', (req, res) => {
  res.render('public/about');
});

// Packages page
router.get('/packages', async (req, res) => {
  try {
    const packages = await Package.find();
    res.render('public/packages', { packages });
  } catch (error) {
    res.status(500).render('error', { error });
  }
});

// Gallery page
router.get('/gallery', async (req, res) => {
  try {
    const galleries = await Gallery.find();
    res.render('public/gallery', { galleries });
  } catch (error) {
    res.status(500).render('error', { error });
  }
});

// Booking page
router.get('/booking', (req, res) => {
  res.render('public/booking');
});

router.post('/booking', async (req, res) => {
  try {
    const { name, email, phone, date, message } = req.body;
    await Booking.create({ name, email, phone, date, message });
    res.redirect('/booking?success=true');
  } catch (error) {
    res.status(500).render('error', { error });
  }
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('public/contact');
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    await Contact.create({ name, email, subject, message });
    res.redirect('/contact?success=true');
  } catch (error) {
    res.status(500).render('error', { error });
  }
});

module.exports = router;