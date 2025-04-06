require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const path = require('path');
const engine = require('ejs-mate');
const multer = require('multer'); // ⬅️ Added for image upload

// Import routes
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// View engine and static files
app.engine('ejs', engine);
app.set('view engine','ejs');
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));

// Body parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// 🔽 Multer setup for image uploading
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads'); // Save uploads to /public/uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  }
});
const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // Serve uploads

// Routes
app.use('/admin', adminRoutes); // Use upload in /admin/gallery route inside admin.js
app.use('/', publicRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
