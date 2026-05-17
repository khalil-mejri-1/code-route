const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
    sectionKey: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('PageContent', pageContentSchema);
