// index.js (ملف الخادم الرئيسي)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // لإتاحة الاتصال بين React و Node.js
const Question = require('./models/Question.js'); // ⭐️ استيراد المخطط

const app = express();
const port = 3000;

// 1. **Replace the placeholder with your actual URI string**
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority"; 
// تأكد من استبدال YourDatabaseName بالاسم الفعلي لقاعدة البيانات

// --- Middlewares ---
app.use(express.json()); // لتمكين قراءة بيانات JSON المرسلة من React
app.use(cors()); // السماح لمتصفح React بالوصول إلى الخادم

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected successfully!');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1); 
    }
};

// Start the database connection
connectDB();


// --- ⭐️ مسار API لإنشاء الأسئلة ---
// index.js (مسار app.post المصحح)

// ⭐️⭐️ نقطة النهاية المحدثة لإضافة الأسئلة بالجملة ⭐️⭐️
// (افتراض أن هذا الملف هو ملف الخادم الرئيسي مثل app.js أو server.js)

app.post('/api/quiz/questions', async (req, res) => {
    try {
        // ⭐️⭐️ استقبال الحقوق المنفصلة مباشرة من req.body
        const { question, image, category1, category2, nb_serie, options } = req.body;
        
        // بناء كائن السؤال الجديد
        const questionData = {
            question,
            image,
            nb_serie: parseInt(nb_serie),
            options,
            category1: category1.trim(), // تنظيف
            category2: category2.trim(), // تنظيف
        };
        
        const newQuestion = new Question(questionData); 
        
        const savedQuestion = await newQuestion.save();
        
        res.status(201).json({ 
            message: 'تم إضافة السؤال بنجاح!', 
            question: savedQuestion 
        });

    } catch (error) {
        res.status(400).json({ 
            message: 'فشل في إضافة السؤال.', 
            error: error.message 
        });
    }
});



app.post('/api/quiz/questions/batch', async (req, res) => { 
    try {
        // التحقق مما إذا كان المدخل مصفوفة
        const questionsArray = Array.isArray(req.body) ? req.body : [req.body];

        if (questionsArray.length === 0) {
            return res.status(400).json({ message: 'الرجاء إرسال مصفوفة من الأسئلة لإضافة دفعة.' });
        }
        
        // تجهيز بيانات الأسئلة وتحويل نوع البيانات لـ nb_serie
        const processedQuestions = questionsArray.map(q => ({
            question: q.question,
            image: q.image || '', // الصورة قد تكون اختيارية
            nb_serie: parseInt(q.nb_serie),
            options: q.options,
            category1: q.category1 ? q.category1.trim() : '',
            category2: q.category2 ? q.category2.trim() : '',
        }));

        // استخدام insertMany لإضافة مجموعة الأسئلة دفعة واحدة
        // يمكن إضافة { ordered: false } للسماح بإضافة الأسئلة الصحيحة حتى لو فشل أحدها
        const savedQuestions = await Question.insertMany(processedQuestions); 
        
        res.status(201).json({ 
            message: `تم إضافة ${savedQuestions.length} سؤال بنجاح!`, 
            questions: savedQuestions 
        });

    } catch (error) {
        // رسالة الخطأ ستكون أكثر تعقيداً في حالة insertMany
        res.status(400).json({ 
            message: 'فشل في إضافة بعض أو كل الأسئلة. تحقق من متطلبات الحقول (مثل category1 و nb_serie).', 
            error: error.message,
            // يمكن إضافة تفاصيل الأخطاء هنا إذا كانت الأخطاء ناتجة عن التحقق في المخطط (Schema Validation)
        });
    }
});

// --- مسار API لجلب الأسئلة ---
// index.js (تعديل المسار /api/quiz/questions)

// --- مسار API لجلب الأسئلة ---
app.get('/api/quiz/questions', async (req, res) => {
    try {
        // ⭐️⭐️ استقبال حقلي البحث category1, category2 
        const { category1, category2, nb_serie } = req.query; 

        const query = {};
        
        if (category1) {
            query.category1 = category1.trim(); 
        }
        if (category2) {
            query.category2 = category2.trim(); 
        }
        
        if (nb_serie) {
            query.nb_serie = parseInt(nb_serie); 
        }

        // جلب الأسئلة
        const questions = await Question.find(query).exec();

        res.status(200).json(questions);

    } catch (error) {
        // ... (معالجة الخطأ)
    }
});


// Define a simple route for the server
app.get('/', (req, res) => {
    res.send('DriveCode API Server is running.');
});

// Start the Express server
app.listen(port, () => {
    console.log(`🚀 API listening at http://localhost:${port}`);
});