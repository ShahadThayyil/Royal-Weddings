const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');
const Gallery = require('../models/Gallery');
const Package = require('../models/Package');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');

// 🗂️ Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 📸 Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// 🔐 Login routes
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

// 📊 Admin Dashboard
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

// 🖼️ Gallery Upload Route
router.post('/gallery', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { title } = req.body;
    const imageFilename = req.file.filename;

    await Gallery.create({ title, imageFilename });
    res.redirect('/admin/dashboard');
  } catch (error) {
    res.status(500).render('error', { error });
  }
});

// ❌ Delete Gallery
router.delete('/gallery/:id', isAuthenticated, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    const filePath = path.join(uploadDir, gallery.imageFilename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🎁 Package Upload Route (with image upload)
router.post('/package', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, features } = req.body;
    const imageFilename = req.file.filename;

    await Package.create({
      name,
      description,
      price,
      features,
      imageUrl: `/uploads/${imageFilename}`
    });

    res.redirect('/admin/dashboard');
  } catch (error) {
    res.status(500).render('error', { error });
  }
});

// ❌ Delete Package (and image file)
router.delete('/package/:id', isAuthenticated, async (req, res) => {
  try {
    const pack = await Package.findById(req.params.id);
    if (!pack) return res.status(404).json({ error: 'Package not found' });

    const filePath = path.join(uploadDir, path.basename(pack.imageUrl));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Package.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🚪 Logout
router.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

module.exports = router;
