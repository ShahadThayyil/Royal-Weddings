const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  imageFilename: {   // ✅ renamed field to match uploaded filename
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}); 

module.exports = mongoose.model('Gallery', gallerySchema);