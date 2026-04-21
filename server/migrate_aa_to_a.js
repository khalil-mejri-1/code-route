const mongoose = require('mongoose');
const Question = require('./models/Question');

const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";

async function migrate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 0. Log all categories
        const allCats = await Question.distinct('category1');
        console.log('All categories in DB:', allCats);

        // 1. Get all series in source category AA
        const sourceSeries = await Question.distinct('nb_serie', { category1: 'AA' });
        console.log(`Found ${sourceSeries.length} series in AA:`, sourceSeries);

        if (sourceSeries.length === 0) {
            console.log('No series found in AA to migrate.');
            process.exit(0);
        }

        // 2. Process each series
        for (const serieNum of sourceSeries.sort((a, b) => a - b)) {
            // Find max series number in target category A
            const targetSeries = await Question.distinct('nb_serie', { category1: 'A' });
            let nextNum = 1;
            if (targetSeries.length > 0) {
                nextNum = Math.max(...targetSeries) + 1;
            }

            console.log(`Moving series ${serieNum} from AA to A as series ${nextNum}...`);

            const result = await Question.updateMany(
                { category1: 'AA', nb_serie: serieNum },
                { $set: { category1: 'A', nb_serie: nextNum } }
            );

            console.log(`✅ Moved ${result.modifiedCount} questions.`);
        }

        console.log('🚀 Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during migration:', err);
        process.exit(1);
    }
}

migrate();
