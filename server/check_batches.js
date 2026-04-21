const mongoose = require('mongoose');
const Question = require('./models/Question');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const times = await Question.distinct('createdAt', { category1: { $in: ['A', 'AA'] } });
        console.log('Distinct CreatedAt values in A/AA:', times.length);
        
        const groups = await Question.aggregate([
            { $match: { category1: { $in: ['A', 'AA'] } } },
            { $group: { _id: '$createdAt', count: { $sum: 1 } } }
        ]);
        console.log('Groups of CreatedAt:', groups);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
