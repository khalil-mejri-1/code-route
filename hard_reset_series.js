const mongoose = require('mongoose');
const Question = require('./models/Question');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function hardReset() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Fetch all 134 questions
        const questions = await Question.find({ category1: { $in: ['A', 'AA'] } });
        console.log(`Processing ${questions.length} questions...`);

        // Distribution logic:
        // 1-30 -> AA Series 1
        // 31-60 -> AA Series 2
        // 61-90 -> A Series 1
        // 91-120 -> A Series 2
        // 121-134 -> A Series 3

        for (let i = 0; i < questions.length; i++) {
            let cat, num, name, sub;
            if (i < 30) {
                cat = 'AA'; num = 1; name = 'السلسلة 1'; sub = 'AA';
            } else if (i < 60) {
                cat = 'AA'; num = 2; name = 'السلسلة 2'; sub = 'AA';
            } else if (i < 90) {
                cat = 'A'; num = 1; name = 'السلسلة 1'; sub = 'A';
            } else if (i < 120) {
                cat = 'A'; num = 2; name = 'السلسلة 2'; sub = 'A';
            } else {
                cat = 'A'; num = 3; name = 'السلسلة 3'; sub = 'A';
            }

            await Question.findByIdAndUpdate(questions[i]._id, {
                $set: {
                    category1: cat,
                    nb_serie: num,
                    serieName: name,
                    serieSubName: sub
                }
            });
        }

        console.log('🚀 Hard Reset & Redistribution successful!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

hardReset();
