const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  receiver: String,
  organization: String,
  message: String,
  status: String,
  requestedAt: Date,
  receiverLocation: Object,
  isNGO: Boolean,
});

const DonationSchema = new mongoose.Schema({
  donor: String,
  foodType: String,
  quantity: Number,
  foodDescription: String,
  bestBefore: String,
  preferredPickup: String,
  specialInstructions: String,
  location: Object,
  status: { type: String, default: 'available' },
  createdAt: String,
  displayTime: String,
  updatedAt: String,
  visibleAfter: String,
  requests: [RequestSchema],
});

module.exports = mongoose.model('Donation', DonationSchema); 