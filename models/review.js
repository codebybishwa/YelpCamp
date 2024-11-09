const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Review', reviewSchema);
