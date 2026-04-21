const mongoose = require('mongoose');
const Question = require('./models/Question');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const count = await Question.countDocuments({ image: /a1\.png/i });
        console.log(`Questions with image matching 'a1.png': ${count}`);
        
        if (count > 0) {
            const sample = await Question.findOne({ image: /a1\.png/i });
            console.log('Sample question category1:', sample.category1);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
