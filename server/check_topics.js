const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const t = await Topic.find({ category: 'AA' });
        console.log('Topics for AA:', t);
        
        const tA = await Topic.find({ category: 'A' });
        console.log('Topics for A:', tA);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
