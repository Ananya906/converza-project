const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    
    eventId: {
        type: String,
        required: true 
    },
    eventName: {
        type: String,
        required: true
    },
 
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    contactNo: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },

    ticketType: {
        type: String,
        required: true
    },
    ticketsQuantity: {
        type: Number,
        required: true,
        min: 1
    },
    pricePerTicket: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },

    // --- Metadata ---
    bookingDate: {
        type: Date,
        default: Date.now
    }
}, { 
    // This tells Mongoose to use the 'bookings' collection in MongoDB
    collection: 'bookings' 
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;