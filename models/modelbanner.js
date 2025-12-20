// models/Banner.js
const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  fileName: { type: String },
  filePath: { type: String },
  author: { type: String },
  meta: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Banner', BannerSchema);
