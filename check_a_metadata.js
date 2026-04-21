const mongoose = require('mongoose');
const Question = require('./models/Question');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const subs = await Question.distinct('serieSubName', { category1: 'A' });
        console.log('Unique serieSubName in category A:', subs);
        
        const names = await Question.distinct('serieName', { category1: 'A' });
        console.log('Unique serieName in category A:', names);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
