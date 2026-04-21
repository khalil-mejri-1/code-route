const mongoose = require('mongoose');
const Question = require('./models/Question');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function migrate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Move everything from A back to AA
        const result = await Question.updateMany(
            { category1: 'A' },
            { 
                $set: { 
                    category1: 'AA',
                    nb_serie: 1 
                } 
            }
        );

        console.log(`🚀 Done! Moved ${result.modifiedCount} questions from A to AA.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

migrate();
