const mongoose = require('mongoose');
const Question = require('./models/Question');
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function verify() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const stats = await Question.aggregate([
            { $match: { category1: { $in: ['A', 'AA'] } } },
            { 
                $group: { 
                    _id: { cat: "$category1", serie: "$nb_serie" },
                    count: { $sum: 1 },
                    name: { $first: "$serieName" }
                } 
            },
            { $sort: { "_id.cat": 1, "_id.serie": 1 } }
        ]);

        console.log('Current Distribution in DB:');
        stats.forEach(s => {
            console.log(`- Category: ${s._id.cat} | Series: ${s._id.serie} | Questions: ${s.count} | Name: ${s.name}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
