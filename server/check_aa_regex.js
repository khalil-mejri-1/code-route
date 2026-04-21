const mongoose = require('mongoose');
const Question = require('./models/Question');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const regex = new RegExp('^\\s*AA\\s*$', 'i');
        const count = await Question.countDocuments({ category1: regex });
        console.log('Questions matching AA (regex):', count);
        
        if (count > 0) {
            const sample = await Question.findOne({ category1: regex });
            console.log('Sample question category1:', `'${sample.category1}'`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
