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


// --- مسار API لإنشاء سؤال واحد ---
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


// --- مسار API لإضافة الأسئلة بالجملة (Batch Create) ---
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
        const savedQuestions = await Question.insertMany(processedQuestions); 
        
        res.status(201).json({ 
            message: `تم إضافة ${savedQuestions.length} سؤال بنجاح!`, 
            questions: savedQuestions 
        });

    } catch (error) {
        res.status(400).json({ 
            message: 'فشل في إضافة بعض أو كل الأسئلة. تحقق من متطلبات الحقول (مثل category1 و nb_serie).', 
            error: error.message,
        });
    }
});

// --- مسار API لجلب الأسئلة (مع الفلترة) ---
app.get('/api/quiz/questions', async (req, res) => {
    try {
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
        console.error('Error fetching filtered questions:', error);
        res.status(500).json({ message: 'Error fetching questions' });
    }
});


// --- مسار API لجلب جميع الأسئلة (بدون فلترة) ---
app.get('/api/questions', async (req, res) => {
    try {
        const questions = await Question.find({});
        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching questions' });
    }
});


// ------------------------------------------------------------------
// ⭐️⭐️ NEW ENDPOINT: تحديث سؤال محدد (UPDATE) ⭐️⭐️
// ------------------------------------------------------------------
app.put('/api/questions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // التأكد من أن nb_serie هو رقم إذا كان موجوداً
        if (updateData.nb_serie) {
            updateData.nb_serie = parseInt(updateData.nb_serie);
        }

        // خيار runValidators: true يضمن تطبيق قواعد التحقق من المخطط (Schema)
        const updatedQuestion = await Question.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true } 
        );

        if (!updatedQuestion) {
            return res.status(404).json({ message: '❌ لم يتم العثور على السؤال للتحديث.' });
        }

        res.status(200).json({
            message: `✅ تم تحديث السؤال بنجاح: ${id}`,
            question: updatedQuestion
        });

    } catch (error) {
        // التحقق من أخطاء التحقق من الصحة (Validation errors)
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'فشل في التحقق من صحة البيانات أثناء التحديث.', 
                error: error.message 
            });
        }
        console.error('Error updating question:', error);
        res.status(500).json({
            message: '❌ فشل في عملية تحديث السؤال.',
            error: error.message
        });
    }
});

// ------------------------------------------------------------------
// ⭐️⭐️ NEW ENDPOINT: حذف سؤال محدد (DELETE) ⭐️⭐️
// ------------------------------------------------------------------
app.delete('/api/questions/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedQuestion = await Question.findByIdAndDelete(id);

        if (!deletedQuestion) {
            return res.status(404).json({ message: '❌ لم يتم العثور على السؤال للحذف.' });
        }

        res.status(200).json({
            message: `✅ تم حذف السؤال بنجاح: ${id}`,
            id: id
        });

    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({
            message: '❌ فشل في عملية حذف السؤال.',
            error: error.message
        });
    }
});
// ------------------------------------------------------------------


// --- مسارات موجودة سابقاً (تبديل الصور والإجابات) ---

app.post('/api/questions/swap-images', async (req, res) => {
    try {
        // ... الكود الأصلي لتبديل الصور
        const { question1Id, question2Id } = req.body;

        if (!question1Id || !question2Id) {
            return res.status(400).json({ message: 'يجب تقديم معرّفي السؤالين (IDs).' });
        }

        const q1 = await Question.findById(question1Id);
        const q2 = await Question.findById(question2Id);

        if (!q1 || !q2) {
            return res.status(404).json({ message: 'لم يتم العثور على سؤال واحد أو كلا السؤالين.' });
        }

        const tempImage = q1.image;
        q1.image = q2.image;
        q2.image = tempImage;

        await q1.save();
        await q2.save();

        res.status(200).json({
            message: `✅ تم تبديل الصور بنجاح بين السؤالين: ${question1Id} و ${question2Id}`,
            updatedQ1: q1,
            updatedQ2: q2
        });

    } catch (error) {
        console.error('Error swapping images:', error);
        res.status(500).json({
            message: '❌ فشل في عملية تبديل الصور.',
            error: error.message
        });
    }
});


app.post('/api/questions/swap-answer', async (req, res) => {
    try {
        // ... الكود الأصلي لتبديل الإجابة الصحيحة
        const { questionId, newCorrectText } = req.body;

        if (!questionId || !newCorrectText) {
            return res.status(400).json({ message: 'يجب تقديم معرّف السؤال ونص الإجابة الصحيحة الجديدة.' });
        }

        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({ message: 'لم يتم العثور على السؤال.' });
        }

        let foundNewCorrect = false;

        const updatedOptions = question.options.map(option => {
            let isCorrect = false;

            if (option.text.trim() === newCorrectText.trim()) {
                isCorrect = true;
                foundNewCorrect = true;
            }

            return {
                text: option.text,
                isCorrect: isCorrect
            };
        });

        if (!foundNewCorrect) {
              return res.status(400).json({ message: '❌ لم يتم العثور على الخيار بالنص المحدد لتغييره إلى إجابة صحيحة.' });
        }
        
        question.options = updatedOptions;
        await question.save();

        res.status(200).json({
            message: `✅ تم تعيين "${newCorrectText}" كإجابة صحيحة جديدة للسؤال: ${questionId}`,
            updatedQuestion: question
        });

    } catch (error) {
        console.error('Error swapping correct answer:', error);
        res.status(500).json({
            message: '❌ فشل في عملية تبديل الإجابة الصحيحة.',
            error: error.message
        });
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