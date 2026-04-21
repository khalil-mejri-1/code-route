const mongoose = require('mongoose');
const Question = require('./models/Question');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function restore() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Move everything from AA back to A
        const result = await Question.updateMany(
            { category1: 'AA' },
            { 
                $set: { 
                    category1: 'A',
                    nb_serie: 0 
                } 
            }
        );

        console.log(`🚀 Restore completed! Moved ${result.modifiedCount} questions from AA back to A with nb_serie: 0.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

restore();
