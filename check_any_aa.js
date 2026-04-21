const mongoose = require('mongoose');
const Question = require('./models/Question');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const regex = new RegExp('AA', 'i');
        const count = await Question.countDocuments({ 
            $or: [
                { category1: regex }, 
                { category2: regex }
            ] 
        });
        console.log(`Total questions involving 'AA' in any category field: ${count}`);
        
        if (count > 0) {
            const data = await Question.find({ 
                $or: [{ category1: regex }, { category2: regex }] 
            }).limit(5);
            console.log('Samples:', JSON.stringify(data.map(q => ({ c1: q.category1, c2: q.category2 })), null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
