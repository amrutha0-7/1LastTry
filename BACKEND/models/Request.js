const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  receiver: String,
  organization: String,
  message: String,
  status: String,
  requestedAt: Date,
  receiverLocation: Object,
  isNGO: Boolean,
  donationId: String,
  foodType: String,
  quantity: Number,
  donor: String,
  createdAt: String,
  updatedAt: String,
});

module.exports = mongoose.model('Request', RequestSchema); 