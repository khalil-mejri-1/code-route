const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    deviceId: {
        type: String,
        default: null
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    },
    isFrozen: {
        type: Boolean,
        default: false
    },
    subscriptions: {
        type: Boolean,
        default: false
    },
    allowedCategories: {
        type: [String],
        default: []
    },
    examResults: [{
        category: String,
        examNum: Number,
        correctAnswers: Number,
        wrongAnswers: Number,
        totalQuestions: Number,
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
