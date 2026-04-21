const mongoose = require('mongoose');
const Question = require('./models/Question');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const series = await Question.distinct('nb_serie', { category1: 'A' });
        console.log('Series numbers in category A:', series.sort((a, b) => a - b));
        
        // Also check if some questions have 'category2' set in A
        const cat2InA = await Question.distinct('category2', { category1: 'A' });
        console.log('Unique category2 in A:', cat2InA);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
