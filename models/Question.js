// src/models/Question.js (يُفضل وضعه في ملف منفصل)

const mongoose = require('mongoose');

// مخطط الإجابة (Option Schema)
const OptionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    }
}, { _id: false }); // لا حاجة لـ ID خاص لكل خيار

// مخطط السؤال (Question Schema)
const QuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String, // سيتم تخزين رابط الصورة
        default: ''
    },
    category1: {
        type: String,
        required: [true, 'الفئة الرئيسية مطلوبة'],
        trim: true
    },
    category2: {
        type: String,
        required: [true, 'الموضوع الفرعي مطلوب'],
        trim: true
    },
    nb_serie: {
        type: Number,
        required: true,
    
    },
    options: {
        type: [OptionSchema], // مصفوفة من خيارات الإجابة
        required: true,
        validate: {
            validator: (arr) => arr.length >= 2,
            message: 'يجب أن يحتوي السؤال على خيارين على الأقل'
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);