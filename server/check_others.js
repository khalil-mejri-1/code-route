const mongoose = require('mongoose');
const Question = require('./models/Question');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const types = ['B', 'A', 'AA', 'Z', 'D', 'CE', 'C', 'امتحانات'];
        const others = await Question.find({ category1: { $nin: types } });
        console.log('Questions with non-standard category1:', others.length);
        if (others.length > 0) {
            console.log('Other categories found:', [...new Set(others.map(q => q.category1))]);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
