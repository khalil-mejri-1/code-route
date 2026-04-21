const mongoose = require('mongoose');
const Question = require('./models/Question');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function restore() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Move back to AA and set nb_serie to 2 (based on their serieName)
        const result = await Question.updateMany(
            { category1: 'A' },
            { 
                $set: { 
                    category1: 'AA',
                    nb_serie: 2 
                } 
            }
        );

        console.log(`🚀 Restore completed! Moved ${result.modifiedCount} questions from A back to AA with nb_serie: 2.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

restore();
