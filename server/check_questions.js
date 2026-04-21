const mongoose = require('mongoose');
const Question = require('./models/Question');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const count1 = await Question.countDocuments({ category1: 'AA' });
        const count2 = await Question.countDocuments({ category2: 'AA' });
        console.log(`Questions with category1 'AA': ${count1}`);
        console.log(`Questions with category2 'AA': ${count2}`);
        
        // Let's also check case insensitive or with spaces
        const count3 = await Question.countDocuments({ category1: /aa/i });
        console.log(`Questions with category1 like 'aa': ${count3}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
