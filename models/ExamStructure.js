const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
    categorySource: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    series: [Number], // Optional: only pick from these series
    selectionMode: { type: String, enum: ['all', 'specific'], default: 'all' }
});

const examStructureSchema = new mongoose.Schema({
    category: { type: String, required: true, unique: true }, // The category this structure applies to
    rules: [ruleSchema],
    totalQuestions: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ExamStructure', examStructureSchema);
