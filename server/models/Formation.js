const mongoose = require('mongoose');

const formationSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        unique: true
    },
    images: [{
        type: String // URLs of the images
    }]
}, { timestamps: true });

module.exports = mongoose.model('Formation', formationSchema);
