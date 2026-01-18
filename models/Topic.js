const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String, // اسم الفئة الرئيسية مثل "B" أو "A / A1"
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Topic', topicSchema);
