const mongoose = require('mongoose');
const Question = require('./models/Question');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const cats2 = await Question.distinct('category2');
        console.log('Distinct category2:', cats2);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
