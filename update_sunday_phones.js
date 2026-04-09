const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://2cpatron_db_user:jBLtbsqZmkaxOmuy@cluster0.2ottrnd.mongodb.net/atelier_taher?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const studentSchema = new mongoose.Schema({
  name: String,
  price: Number,
  phone: String,
  registrationDate: String,
  schedule: {
    tue_m: { type: Boolean, default: true },
    wed_m: { type: Boolean, default: true },
    wed_a: { type: Boolean, default: true },
    sat_m: { type: Boolean, default: true },
    sat_a: { type: Boolean, default: true },
    sun_m: { type: Boolean, default: true }
  }
}, { strict: false });

const Student = mongoose.model('Student', studentSchema);

const updates = [
  { name: "AICHA HERCHI", phone: "92786994", price: 100 },
  { name: "EMNA KOUBAA", phone: "25071880", price: 100 },
  { name: "MANEL YOUSFI", phone: "44165037", price: 100 },
  { name: "ARBIA HARATHI", phone: "55385240", price: 100 },
  { name: "MARIEM TRABELSI", phone: "29833550", price: 140 },
  { name: "MARWA HENTATI", phone: "29833550", price: 100 },
  { name: "NESRINE NAFATI", phone: "20718716", price: 100 },
  { name: "RIHAB BOUALI", phone: "23181643", price: 100 },
  { name: "RIHAB BOUHLEL", phone: "99407726", price: 100 },
  { name: "RIM HIDRI", phone: "25413797", price: 100 },
  { name: "RIM NASRI", phone: "58881648", price: 100 },
  { name: "MALEK MKAWAR", phone: "28299141", price: 140 },
  { name: "WIDED AHMER", phone: "55674431", price: 100 },
  { name: "BASSMA HAMDEWI", phone: "26555171", price: 140 },
  { name: "RAWAA BOUZIDI", phone: "44227937", price: 100 },
  { name: "EMNA GHODHBEN", phone: "44711748", price: 140 },
  { name: "OMAYMA HMIDET", phone: "92386665", price: 100 },
  { name: "EMNA LWETTI", phone: "22330870", price: 100 },
  { name: "NESRINE DRADRA", phone: "23983814", price: 110 },
  { name: "HANA BRLGHITH", phone: "25784749", price: 100 },
  { name: "YOSRA BEN ALI", phone: "54354293", price: 110 },
  { name: "IMEN SAFI", phone: "26082196", price: 110 },
  { name: "MALEK KEMEL", phone: "20949813", price: 110 },
  { name: "MANEL HARCHI", phone: "24900048", price: 100 }
];

const updateStudentsInfo = async () => {
    try {
        let updatedCount = 0;
        let addedCount = 0;
        
        for (const data of updates) {
            // Find existing student by name
            const res = await Student.findOne({ name: data.name });
            if (res) {
                res.phone = data.phone;
                res.price = data.price;
                res.schedule = res.schedule || {
                    tue_m: false, wed_m: false, wed_a: false, sat_m: false, sat_a: false, sun_m: true
                };
                res.schedule.sun_m = true;
                await res.save();
                updatedCount++;
            } else {
                const today = new Date().toISOString().split('T')[0];
                await Student.create({
                    name: data.name,
                    phone: data.phone,
                    price: data.price,
                    registrationDate: today,
                    schedule: {
                        tue_m: false, wed_m: false, wed_a: false, sat_m: false, sat_a: false, sun_m: true
                    }
                });
                addedCount++;
            }
        }
        
        console.log(`Successfully updated ${updatedCount} and added ${addedCount} Sunday students.`);
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

updateStudentsInfo();
