const mongoose = require('mongoose');
const Question = require('./server/models/Question');

async function migrate() {
    try {
        // الاتصال بقاعدة البيانات
        const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB...');

        const result = await Question.updateMany(
            { category1: 'AA' },
            { $set: { category1: 'A' } }
        );

        console.log(`Migration completed!`);
        console.log(`Matched: ${result.matchedCount}`);
        console.log(`Modified: ${result.modifiedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
