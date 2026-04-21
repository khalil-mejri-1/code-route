const mongoose = require('mongoose');
const Question = require('./models/Question');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function fix() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Fetch all 134 questions from A and AA
        const allQuestions = await Question.find({ category1: { $in: ['A', 'AA'] } }).sort({ createdAt: 1 });
        console.log(`Found ${allQuestions.length} questions to redistribute.`);

        // Plan:
        // AA: 2 series of 30 questions
        // A: 2 series of 30 questions + 1 series of 14 questions

        for (let i = 0; i < allQuestions.length; i++) {
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

            await Question.updateOne(
                { _id: allQuestions[i]._id },
                { 
                    $set: { 
                        category1: cat,
                        nb_serie: num,
                        serieName: name,
                        serieSubName: sub
                    } 
                }
            );
        }

        console.log('🚀 Redistribution completed!');
        
        // Let's verify
        const aaCount = await Question.countDocuments({ category1: 'AA' });
        const aCount = await Question.countDocuments({ category1: 'A' });
        console.log(`Final state: AA=${aaCount}, A=${aCount}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

fix();
