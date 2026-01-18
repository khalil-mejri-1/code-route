const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // لإتاحة الاتصال بين React و Node.js
const Question = require('./models/Question.js'); // ⭐️ استيراد المخطط
const User = require('./models/User.js'); // ⭐️ استيراد مخطط المستخدم
const Category = require('./models/Category.js'); // ⭐️ استيراد مخطط الفئات
const Topic = require('./models/Topic.js'); // ⭐️ استيراد مخطط المواضيع

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

// Start the database connection
connectDB();

// ------------------------------------------------------------------
// ⭐️⭐️ AUTH ROUTES (مسارات المصادقة) ⭐️⭐️
// ------------------------------------------------------------------

// 1. تسجيل مستخدم جديد (Sign Up)
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // التحقق من وجود المستخدم
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'البريد الإلكتروني مسجل مسبقاً.' });
        }

        // إنشاء مستخدم جديد (ملاحظة: في الإنتاج يجب تشفير كلمة المرور باستخدام bcrypt)
        const newUser = new User({
            fullName,
            email,
            password
        });

        await newUser.save();

        res.status(201).json({
            message: 'تم إنشاء الحساب بنجاح!',
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الحساب', error: error.message });
    }
});

// 2. تسجيل الدخول (Login)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // البحث عن المستخدم
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }

        // التحقق من كلمة المرور (مقارنة مباشرة للنص، يجب استخدام التشفير في التطبيقات الحقيقية)
        if (user.password !== password) {
            return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }

        // نجاح تسجيل الدخول
        res.status(200).json({
            message: 'تم تسجيل الدخول بنجاح!',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول', error: error.message });
    }
});


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


// ⭐️⭐️ NEW ENDPOINT: جلب أرقام السلاسل المتاحة لفئة معينة ⭐️⭐️
app.get('/api/quiz/series', async (req, res) => {
    try {
        const { category1, category2 } = req.query;

        if (!category1 || !category2) {
            return res.status(400).json({ message: 'يجب تقديم الفئة 1 والفئة 2.' });
        }

        // البحث عن أرقام السلاسل الفريدة
        const series = await Question.distinct('nb_serie', {
            category1: category1.trim(),
            category2: category2.trim()
        });

        // ترتيب السلاسل تصاعدياً
        series.sort((a, b) => a - b);

        res.status(200).json(series);

    } catch (error) {
        console.error('Error fetching series:', error);
        res.status(500).json({ message: 'فشل في جلب السلاسل المتاحة.', error: error.message });
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
// ⭐️⭐️ NEW ENDPOINT: حذف جميع الأسئلة (DELETE ALL) ⭐️⭐️
// ------------------------------------------------------------------
app.delete('/api/questions/all', async (req, res) => {
    try {
        const result = await Question.deleteMany({});
        res.status(200).json({
            message: `✅ تم حذف جميع الأسئلة بنجاح! عدد الأسئلة المحذوفة: ${result.deletedCount}`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error deleting all questions:', error);
        res.status(500).json({
            message: '❌ فشل في عملية حذف جميع الأسئلة.',
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

// ------------------------------------------------------------------


// --- مسارات موجودة سابقاً (تبديل الصور والإجابات) ---

// ------------------------------------------------------------------
// ⭐️⭐️ USERS & CATEGORIES ROUTES ⭐️⭐️
// ------------------------------------------------------------------

// 1. جلب قائمة جميع المستخدمين
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // استثناء كلمة المرور للأمان
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'فشل في جلب المستخدمين', error: error.message });
    }
});

// 2. جلب جميع الفئات
app.get('/api/categories', async (req, res) => {
    try {
        let categories = await Category.find({});

        // إذا كانت القائمة فارغة، يمكننا إضافة الفئات الافتراضية
        if (categories.length === 0) {
            const defaultCategories = [
                { category: "B", description: "دروس في B", image: "https://www.codedelaroute.tn/images/b.png" },
                { category: "A / A1", description: "دروس في A / A1", image: "https://www.codedelaroute.tn/images/a.png" },
                { category: "A1 / AM", description: "دروس في A1 / AM", image: "https://www.codedelaroute.tn/images/a1.png" },
                { category: "B+E", description: "دروس في B+E", image: "https://www.codedelaroute.tn/images/b+e.png" },
                { category: "C / C1", description: "دروس في C / C1", image: "https://www.codedelaroute.tn/images/c.png" },
                { category: "C+E / C1+E", description: "دروس في C+E / C1+E", image: "https://www.codedelaroute.tn/images/c+e.png" },
                { category: "D", description: "دروس في D", image: "https://www.codedelaroute.tn/images/d.png" },
                { category: "D1", description: "دروس في D1", image: "https://www.codedelaroute.tn/images/d1.png" },
                { category: "D+E / D1+E", description: "دروس في D+E / D1+E", image: "https://www.codedelaroute.tn/images/d+e.png" },
            ];
            categories = await Category.insertMany(defaultCategories);
        }

        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'فشل في جلب الفئات', error: error.message });
    }
});

// 3. إضافة فئة جديدة
app.post('/api/categories', async (req, res) => {
    try {
        const { category, description, image } = req.body;
        const newCategory = new Category({ category, description, image });
        await newCategory.save();
        res.status(201).json({ message: 'تم إضافة الفئة بنجاح!', category: newCategory });
    } catch (error) {
        res.status(400).json({ message: 'فشل في إضافة الفئة', error: error.message });
    }
});

// 4. حذف فئة
app.delete('/api/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'تم حذف الفئة بنجاح!' });
    } catch (error) {
        res.status(500).json({ message: 'فشل في حذف الفئة', error: error.message });
    }
});

// 5. تحديث فئة
app.put('/api/categories/:id', async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'تم تحديث الفئة بنجاح!', category: updatedCategory });
    } catch (error) {
        res.status(400).json({ message: 'فشل في تحديث الفئة', error: error.message });
    }
});

// ------------------------------------------------------------------
// ⭐️⭐️ TOPICS ROUTES (المواضيع الفرعية) ⭐️⭐️
// ------------------------------------------------------------------

// 1. جلب المواضيع (مع إمكانية الفلترة حسب الفئة)
app.get('/api/topics', async (req, res) => {
    try {
        const { category } = req.query;

        // تحديث المواضيع القديمة التي ليس لها فئة لتتبع الفئة "B" افتراضياً
        await Topic.updateMany({ category: { $exists: false } }, { $set: { category: "B" } });
        await Topic.updateMany({ category: "" }, { $set: { category: "B" } });

        const query = category ? { category } : {};
        let topics = await Topic.find(query);

        // إذا كانت القائمة فارغة تماماً في قاعدة البيانات، إضافة مواضيع افتراضية
        const allTopicsCount = await Topic.countDocuments();
        if (allTopicsCount === 0) {
            const defaultTopics = [
                { name: "العلامات و الاشارات", category: "B", image: "https://i.pinimg.com/originals/54/83/72/5483725409b8436c9256c141723999da.gif" },
                { name: "الأولوية", category: "B", image: "https://www.codepermis.net/upload/images/image.jpg" },
                { name: "قواعد الجولان", category: "B", image: "https://www.codepermis.net/upload/images/en1g5vqv.jpg" },
                { name: "المخالفات و العقوبات", category: "B", image: "https://www.almuraba.net/wp-content/uploads/2024/05/%D9%83%D9%85-%D9%85%D8%AE%D8%A7%D9%84%D9%81%D8%A9-%D8%A7%D9%84%D8%AC%D9%88%D8%A7%D9%84.jpg" },
                { name: "الصيانة", category: "B", image: "https://elsafacarservice.com/wp-content/uploads/2024/08/%D9%85%D8%A7-%D9%87%D9%8A-%D8%A3%D9%86%D9%88%D8%A7%D8%B9-%D8%B5%D9%8A%D8%A7%D9%86%D8%A9-%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA.webp" },
                { name: "المقاطعة و المجاوزة", category: "B", image: "https://www.codepermis.net/upload/images/s7300318.gif" },
            ];
            topics = await Topic.insertMany(defaultTopics);
            // إذا كان المستخدم يطلب فئة معينة، نفلتر النتائج بعد الإضافة
            if (category) {
                topics = topics.filter(t => t.category === category);
            }
        }

        res.status(200).json(topics);
    } catch (error) {
        res.status(500).json({ message: 'فشل في جلب المواضيع', error: error.message });
    }
});

// 2. إضافة موضوع جديد
app.post('/api/topics', async (req, res) => {
    try {
        const { name, category, image } = req.body;
        if (!name || !category) {
            return res.status(400).json({ message: 'الاسم والفئة مطلوبان' });
        }
        const newTopic = new Topic({ name, category, image });
        await newTopic.save();
        res.status(201).json({ message: 'تم إضافة الموضوع بنجاح!', topic: newTopic });
    } catch (error) {
        res.status(400).json({ message: 'فشل في إضافة الموضوع', error: error.message });
    }
});

// 3. حذف موضوع
app.delete('/api/topics/:id', async (req, res) => {
    try {
        await Topic.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'تم حذف الموضوع بنجاح!' });
    } catch (error) {
        res.status(500).json({ message: 'فشل في حذف الموضوع', error: error.message });
    }
});

// 4. تحديث موضوع
app.put('/api/topics/:id', async (req, res) => {
    try {
        const updatedTopic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'تم تحديث الموضوع بنجاح!', topic: updatedTopic });
    } catch (error) {
        res.status(400).json({ message: 'فشل في تحديث الموضوع', error: error.message });
    }
});

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