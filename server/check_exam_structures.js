const mongoose = require('mongoose');
const ExamStructure = require('./models/ExamStructure');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const es = await ExamStructure.find({});
        console.log('Exam Structures:', JSON.stringify(es, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
