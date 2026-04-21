const mongoose = require('mongoose');
const Question = require('./models/Question');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const stats = await Question.aggregate([
            { $match: { category1: 'AA' } },
            { $group: { _id: '$serieName', count: { $sum: 1 } } }
        ]);
        console.log('AA category questions by serieName:', stats);
        
        const stats2 = await Question.aggregate([
            { $match: { category1: 'AA' } },
            { $group: { _id: '$nb_serie', count: { $sum: 1 } } }
        ]);
        console.log('AA category questions by nb_serie:', stats2);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
