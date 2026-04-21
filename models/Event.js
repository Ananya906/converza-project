const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  name: String,
  price: Number
});

const eventSchema = new mongoose.Schema({
  name: String,
  description: String,
  startTime: Date,
  location: String,
  category: String,
  imageUrl: String,
  ticketTypes: [ticketSchema],
  availableTickets: {
    type: Number,
    default: 100
  }
});

module.exports = mongoose.model("Event", eventSchema);