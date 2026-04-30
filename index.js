const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // لإتاحة الاتصال بين React و Node.js
const Question = require('./models/Question.js'); // ⭐️ استيراد المخطط
const User = require('./models/User.js'); // ⭐️ استيراد مخطط المستخدم
const Category = require('./models/Category.js'); // ⭐️ استيراد مخطط الفئات
const Topic = require('./models/Topic.js'); // ⭐️ استيراد مخطط المواضيع
const ExamStructure = require('./models/ExamStructure.js'); // ⭐️ استيراد مخطط بنية الامتحانات
const Formation = require('./models/Formation.js'); // ⭐️ استيراد مخطط التكوين

const app = express();
const port = 3000;

// 1. **Replace the placeholder with your actual URI string**
const MONGO_URI = "mongodb+srv://coderoute:khalilslam1234@cluster0.o1dasfi.mongodb.net/DriveCodeDB?retryWrites=true&w=majority";
// تأكد من استبدال YourDatabaseName بالاسم الفعلي لقاعدة البيانات

// --- Middlewares ---
app.use(express.json()); // لتمكين قراءة بيانات JSON المرسلة من React
app.use(cors({
    origin: "*"
}));
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
        const deviceId = req.body.deviceId || null;

        // البحث عن المستخدم
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }

        // التحقق من كلمة المرور
        if (user.password !== password) {
            return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }

        // نجاح تسجيل الدخول
        // 1. التحقق من حالة تجميد الحساب
        if (user.isFrozen) {
            return res.status(403).json({ message: 'تم تجميد حسابك بسبب محاولة الدخول من عدة أجهزة. يرجى التواصل مع الإدارة.' });
        }

        // 2. التحقق من الدخول من جهاز مختلف
        console.log(`Login Attempt: User=${user.email}, DB_Device=${user.deviceId}, Req_Device=${deviceId}`);
        
        if (user.deviceId && user.deviceId !== deviceId && user.role !== 'admin') {
            console.log(`FREEZING USER: ${user.email} due to device mismatch.`);
            user.isFrozen = true;
            user.deviceId = null; // إزالة بصمة الجهاز للأمان
            await user.save();
            return res.status(403).json({ 
                message: 'تم كشف محاولة دخول من جهاز مختلف. تم تجميد حسابك وتسجيل الخروج من جميع الأجهزة للأمان. يرجى مراجعة الإدارة.' 
            });
        }

        // 3. تحديث بصمة الجهاز إذا كان الحساب جديداً أو غير مرتبط بجهاز
        if (!user.deviceId && user.role !== 'admin') {
            console.log(`Setting initial deviceId for user: ${user.email}`);
            user.deviceId = deviceId;
            await user.save();
        }

        res.status(200).json({
            message: 'تم تسجيل الدخول بنجاح!',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                isApproved: user.isApproved,
                role: user.role,
                isFrozen: user.isFrozen,
                subscriptions: user.isApproved || user.subscriptions || false,
                allowedCategories: user.allowedCategories || []
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول', error: error.message });
    }
});

// 2.5 تحديث حالة الموافقة للمستخدم
app.put('/api/users/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved } = req.body;
        
        const user = await User.findByIdAndUpdate(id, { 
            isApproved, 
            subscriptions: isApproved // جعل العضوية VIP تلقائياً عند قبول الحساب
        }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }
        
        res.status(200).json({ 
            message: isApproved ? 'تمت الموافقة على المستخدم بنجاح' : 'تم إلغاء الموافقة',
            user: { id: user._id, isApproved: user.isApproved }
        });
    } catch (error) {
        res.status(500).json({ message: 'فشل في تحديث حالة المستخدم', error: error.message });
    }
});

// 2.6 جلب حالة مستخدم معين بالبريد الإلكتروني
app.get('/api/users/status', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });
        
        const user = await User.findOne({ email }, 'isApproved isFrozen role subscriptions allowedCategories');
        if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
        
        res.status(200).json({ 
            isApproved: user.isApproved,
            isFrozen: user.isFrozen,
            role: user.role,
            subscriptions: user.isApproved || user.subscriptions || false,
            allowedCategories: user.allowedCategories || []
        });
    } catch (error) {
        res.status(500).json({ message: 'خطأ في جلب الحالة', error: error.message });
    }
});

// 2.7 تجميد أو إلغاء تجميد حساب مستخدم
app.put('/api/users/:id/freeze', async (req, res) => {
    try {
        const { isFrozen } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isFrozen, deviceId: null }, // عند إلغاء التجميد نصفر الجهاز للسماح بالدخول من جهاز جديد
            { new: true }
        );
        
        if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
        
        res.status(200).json({ 
            message: isFrozen ? 'تم تجميد الحساب' : 'تم إلغاء التجميد بنجاح',
            user: { id: user._id, isFrozen: user.isFrozen }
        });
    } catch (error) {
        res.status(500).json({ message: 'فشل في تحديث حالة الحساب', error: error.message });
    }
});

// 2.8 حفظ نتائج الامتحان للمستخدم
app.post('/api/users/exam-results', async (req, res) => {
    try {
        const { email, category, examNum, correctAnswers, wrongAnswers, totalQuestions } = req.body;
        if (!email) return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

        // إضافة النتيجة للمصفوفة
        user.examResults.push({
            category,
            examNum,
            correctAnswers,
            wrongAnswers,
            totalQuestions,
            completedAt: new Date()
        });

        await user.save();
        res.status(200).json({ message: 'تم حفظ النتيجة بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'فشل في حفظ النتيجة', error: error.message });
    }
});

// 2.9 جلب بيانات الملف الشخصي (البروفايل)
app.get('/api/users/profile', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });

        const user = await User.findOne({ email }, 'fullName email role isApproved isFrozen subscriptions examResults createdAt allowedCategories');
        if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

        const userData = user.toObject();
        userData.subscriptions = user.isApproved || user.subscriptions || false;
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ message: 'فشل في جلب بيانات الملف الشخصي', error: error.message });
    }
});

// 2.10 تحديث دور المستخدم (admin/user)
app.put('/api/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({ message: 'دور غير صالح' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

        res.status(200).json({
            message: `تم تغيير الدور إلى ${role === 'admin' ? 'مدير' : 'مستخدم'} بنجاح`,
            user: { id: user._id, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'فشل في تحديث الدور', error: error.message });
    }
});

// 2.11 تحديث التصنيفات المسموحة للمستخدم (allowedCategories)
app.put('/api/users/:id/categories', async (req, res) => {
    try {
        const { allowedCategories } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { allowedCategories: allowedCategories || [] },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

        res.status(200).json({
            message: 'تم تحديث التصنيفات المسموحة بنجاح',
            user: { id: user._id, allowedCategories: user.allowedCategories }
        });
    } catch (error) {
        res.status(500).json({ message: 'فشل في تحديث التصنيفات المسموحة', error: error.message });
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

        if (!category1) {
            return res.status(400).json({ message: 'يجب تقديم الفئة 1 على الأقل.' });
        }

        // بناء استعلام مرن
        const query = { category1: category1.trim() };
        if (category2) {
            query.category2 = category2.trim();
        } else {
            // إذا لم يتم توفير category2، نبحث عن الأسئلة التي ليس لها موضوع فرعي أو موضوعها فارغ
            query.$or = [{ category2: "" }, { category2: { $exists: false } }];
        }

        // البحث عن أرقام السلاسل الفريدة مع أسمائها المخصصة
        const seriesData = await Question.aggregate([
            { $match: query },
            { 
                $group: { 
                    _id: "$nb_serie",
                    serieName: { $first: "$serieName" },
                    serieSubName: { $first: "$serieSubName" }
                } 
            },
            { $sort: { _id: 1 } }
        ]);

        const formattedSeries = seriesData.map(s => ({
            nb_serie: s._id,
            serieName: s.serieName || `السلسلة ${s._id}`,
            serieSubName: s.serieSubName || ''
        }));

        res.status(200).json(formattedSeries);

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

// --- مسار API لحذف مجموعة من الأسئلة دفعة واحدة ---
app.post('/api/questions/batch-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'الرجاء إرسال مصفوفة من المعرفات (IDs) للحذف.' });
        }

        const result = await Question.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            message: `✅ تم حذف ${result.deletedCount} سؤال بنجاح!`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error deleting batch questions:', error);
        res.status(500).json({
            message: '❌ فشل في حذف مجموعة الأسئلة.',
            error: error.message
        });
    }
});

// --- مسار API لحذف خيار معين من جميع الأسئلة دفعة واحدة ---
app.post('/api/questions/delete-option-globally', async (req, res) => {
    try {
        const { optionText } = req.body;
        if (!optionText || optionText.trim() === "") {
            return res.status(400).json({ message: 'الرجاء إدخال نص الخيار المراد حذفه.' });
        }

        const trimmedText = optionText.trim();

        // حذف الخيار من مصفوفة options في جميع الأسئلة
        const result = await Question.updateMany(
            { "options.text": trimmedText },
            { $pull: { options: { text: trimmedText } } }
        );

        res.status(200).json({
            message: `✅ تم حذف الخيار "${trimmedText}" من بنجاح!`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error deleting global option:', error);
        res.status(500).json({
            message: '❌ فشل في حذف الخيار عالميًا.',
            error: error.message
        });
    }
});

// ------------------------------------------------------------------
// ⭐️⭐️ NEW ENDPOINT: إعادة تسمية (تغيير رقم) سلسلة معينة ⭐️⭐️
// ------------------------------------------------------------------
app.put('/api/quiz/series/rename', async (req, res) => {
    try {
        const { 
            category1, 
            category2, 
            oldSerieNum, 
            newSerieNum, 
            serieName, 
            serieSubName,
            newCategory1 
        } = req.body;

        if (!category1 || oldSerieNum === undefined) {
            return res.status(400).json({ message: 'يجب تقديم الفئة والرقم القديم.' });
        }

        // تحديث جميع الأسئلة
        const filter = { category1: category1.trim(), nb_serie: parseInt(oldSerieNum) };
        if (category2) {
            filter.category2 = category2.trim();
        } else {
             // البحث عن الأسئلة التي ليس لها موضوع فرعي أو موضوعها فارغ
             filter.$or = [{ category2: "" }, { category2: { $exists: false } }];
        }

        const updateFields = {};
        if (serieName !== undefined) updateFields.serieName = serieName;
        if (serieSubName !== undefined) updateFields.serieSubName = serieSubName;

        if (newCategory1 !== undefined && newCategory1.trim() !== category1.trim()) {
            // إذا كان هناك نقل لصنف جديد، نضعها في الأخير تلقائياً
            const targetCat = newCategory1.trim();
            const lastSerie = await Question.findOne({ category1: targetCat }).sort({ nb_serie: -1 });
            const nextSerieNum = lastSerie ? lastSerie.nb_serie + 1 : 1;
            
            updateFields.category1 = targetCat;
            updateFields.nb_serie = nextSerieNum;
        } else {
            // إذا كان في نفس الصنف، نكتفي بتحديث الرقم إذا وجد
            if (newSerieNum !== undefined) updateFields.nb_serie = parseInt(newSerieNum);
        }

        const result = await Question.updateMany(
            filter,
            { $set: updateFields }
        );

        res.status(200).json({
            message: `✅ تم تحديث بيانات السلسلة بنجاح!`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error updating series metadata:', error);
        res.status(500).json({
            message: '❌ فشل في تحديث بيانات السلسلة.',
            error: error.message
        });
    }
});

// ------------------------------------------------------------------
// ⭐️⭐️ NEW ENDPOINT: تحويل سلسلة من فئة إلى أخرى مع تغيير رقمها تلقائياً ⭐️⭐️
// ------------------------------------------------------------------
app.post('/api/quiz/series/move', async (req, res) => {
    try {
        const { sourceCategory, sourceSeries, targetCategory } = req.body;

        if (!sourceCategory || !sourceSeries || !targetCategory) {
            return res.status(400).json({ message: 'يجب تقديم الفئة المصدر، قائمة السلاسل، والفئة الهدف.' });
        }

        // تحويل sourceSeries إلى مصفوفة إذا لم تكن كذلك
        const seriesToMove = Array.isArray(sourceSeries) ? sourceSeries : [sourceSeries];

        let movedCountTotal = 0;
        let migrationMapping = [];

        // نقوم بمعالجة كل سلسلة واحدة تلو الأخرى للتأكد من الترقيم الصحيح
        for (const serieNum of seriesToMove) {
            // 1. البحث عن أعلى رقم سلسلة في الفئة الهدف (في كل تكرار لضمان الترقيم المتسلسل)
            const targetSeries = await Question.distinct('nb_serie', { category1: targetCategory.trim() });
            let newSerieNumber = 1;
            if (targetSeries.length > 0) {
                newSerieNumber = Math.max(...targetSeries) + 1;
            }

            // 2. تحديث جميع الأسئلة التي تنطبق عليها الشروط
            const result = await Question.updateMany(
                {
                    category1: sourceCategory.trim(),
                    nb_serie: parseInt(serieNum)
                },
                {
                    $set: {
                        category1: targetCategory.trim(),
                        nb_serie: newSerieNumber
                    }
                }
            );

            if (result.matchedCount > 0) {
                movedCountTotal += result.modifiedCount;
                migrationMapping.push({ old: serieNum, new: newSerieNumber });
            }
        }

        if (movedCountTotal === 0) {
            return res.status(404).json({ message: '❌ لم يتم العثور على أي أسئلة في السلاسل المحددة بالفئة المصدر.' });
        }

        res.status(200).json({
            message: `✅ تم نقل ${seriesToMove.length} سلسلة بنجاح!`,
            movedCountTotal,
            migrationMapping
        });

    } catch (error) {
        console.error('Error moving series:', error);
        res.status(500).json({
            message: '❌ فشل في عملية نقل السلسلة.',
            error: error.message
        });
    }
});
// ------------------------------------------------------------------

// ⭐️⭐️ NEW ENDPOINT: اختبار شامل لفئة كاملة (جميع السلاسل والفئات الفرعية) ⭐️⭐️
app.get('/api/quiz/exam', async (req, res) => {
    try {
        const { category1, category2, examSerie } = req.query;

        if (!category1) {
            return res.status(400).json({ message: 'يجب تقديم الفئة 1.' });
        }

        // Check for custom structure first
        const customStructure = await ExamStructure.findOne({ category: category1.trim() });

        if (customStructure && customStructure.rules.length > 0) {
            let consolidatedQuestions = [];

            // Loop through rules and fetch questions for each source category
            for (const rule of customStructure.rules) {
                let query = { category1: rule.categorySource };
                
                if (rule.selectionMode === 'specific' && rule.series && rule.series.length > 0) {
                    query.nb_serie = { $in: rule.series };
                }

                const sourceQuestions = await Question.find(query).exec();
                if (sourceQuestions.length > 0) {
                    // Shuffle and pick 'count' questions
                    const picked = sourceQuestions.sort(() => Math.random() - 0.5).slice(0, rule.count);
                    consolidatedQuestions = consolidatedQuestions.concat(picked);
                }
            }

            // Re-shuffle the final collection
            consolidatedQuestions = consolidatedQuestions.sort(() => Math.random() - 0.5);
            return res.status(200).json(consolidatedQuestions);
        }

        // Original logic if no custom structure exists
        const query = { category1: category1.trim() };
        if (category2) {
            query.category2 = category2.trim();
        }

        // جلب جميع الأسئلة التي تطابق الشروط
        const questions = await Question.find(query).exec();

        // خلط الأسئلة عشوائياً
        let shuffled = questions.sort(() => Math.random() - 0.5);

        // دمج 5 أسئلة عشوائية من الفئة + أسئلة سلسلة الامتحان المحددة
        if (examSerie && category1.trim() !== 'امتحانات') {
            const categoryQuestionsCount = 5;
            const randomCategoryQuestions = shuffled.slice(0, categoryQuestionsCount);

            const examSerieQuery = {
                category1: 'امتحانات',
                nb_serie: parseInt(examSerie)
            };
            const examQuestions = await Question.find(examSerieQuery).exec();

            let filteredExamQuestions = [];
            if (examQuestions.length > categoryQuestionsCount) {
                // حذف آخر 5 أسئلة
                filteredExamQuestions = examQuestions.slice(0, examQuestions.length - categoryQuestionsCount);
            } else {
                filteredExamQuestions = examQuestions;
            }

            // دمج الخليط (5 من الفئة المحددة و الباقي من الامتحان)
            shuffled = randomCategoryQuestions.concat(filteredExamQuestions);

            // خلط الناتج النهائي ليتم توزيع أسئلة الفئة الأولى (الـ 5 العشوائية) طوال الامتحان
            shuffled = shuffled.sort(() => Math.random() - 0.5);
        } else if (!examSerie) {
            // إذا لم يتم تحديد سلسلة نعيد 30 سؤال كالتالي مثلاً (بناءً على طلب سابق لتحديد عدد معين)
            // سنركز على إعادة 30 سؤال كحد أقصى أو ما يجده
            shuffled = shuffled.slice(0, 30);
        }

        res.status(200).json(shuffled);

    } catch (error) {
        console.error('Error fetching exam questions:', error);
        res.status(500).json({ message: 'فشل في جلب أسئلة الاختبار الشامل.', error: error.message });
    }
});

// ------------------------------------------------------------------
// ⭐️⭐️ EXAM STRUCTURE ROUTES ⭐️⭐️
// ------------------------------------------------------------------

// 1. Get Exam Structure for a category
app.get('/api/exam-structure/:category', async (req, res) => {
    try {
        const structure = await ExamStructure.findOne({ category: req.params.category });
        res.status(200).json(structure);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exam structure', error: error.message });
    }
});

// 2. Create or Update Exam Structure
app.post('/api/exam-structure', async (req, res) => {
    try {
        const { category, rules } = req.body;

        // Calculate total questions
        const totalQuestions = rules.reduce((acc, rule) => acc + rule.count, 0);

        const structure = await ExamStructure.findOneAndUpdate(
            { category },
            { category, rules, totalQuestions },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'Exam structure saved!', structure });
    } catch (error) {
        res.status(400).json({ message: 'Error saving exam structure', error: error.message });
    }
});

// ------------------------------------------------------------------
// ⭐️⭐️ FORMATION ROUTES ⭐️⭐️
// ------------------------------------------------------------------

// 1. Get Formation images for a category
app.get('/api/formation/:category', async (req, res) => {
    try {
        const formation = await Formation.findOne({ category: req.params.category });
        if (!formation) {
            return res.status(200).json({ category: req.params.category, images: [] });
        }
        res.status(200).json(formation);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching formation images', error: error.message });
    }
});

// 2. Add/Update Formation images
app.post('/api/formation', async (req, res) => {
    try {
        const { category, images } = req.body; // images should be an array of URLs

        const formation = await Formation.findOneAndUpdate(
            { category },
            { category, images },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'Formation images saved!', formation });
    } catch (error) {
        res.status(400).json({ message: 'Error saving formation images', error: error.message });
    }
});
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

// 2. حذف مستخدم
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }
        res.status(200).json({ message: 'تم حذف المستخدم بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'فشل في حذف المستخدم', error: error.message });
    }
});

// 2. جلب جميع الفئات
app.get('/api/categories', async (req, res) => {
    try {
        let categories = await Category.find({});

        if (categories.length === 0) {
            const defaultCategories = [
                { category: "B", description: "دروس في B", image: "https://www.codedelaroute.tn/images/b.png", order: 1, visible: true },
                { category: "A / A1", description: "دروس في A / A1", image: "https://www.codedelaroute.tn/images/a.png", order: 2, visible: true },
                { category: "A1 / AM", description: "دروس في A1 / AM", image: "https://www.codedelaroute.tn/images/a1.png", order: 3, visible: true },
                { category: "B+E", description: "دروس في B+E", image: "https://www.codedelaroute.tn/images/b+e.png", order: 4, visible: true },
                { category: "C / C1", description: "دروس في C / C1", image: "https://www.codedelaroute.tn/images/c.png", order: 5, visible: true },
                { category: "C+E / C1+E", description: "دروس في C+E / C1+E", image: "https://www.codedelaroute.tn/images/c+e.png", order: 6, visible: true },
                { category: "D", description: "دروس في D", image: "https://www.codedelaroute.tn/images/d.png", order: 7, visible: true },
                { category: "D1", description: "دروس في D1", image: "https://www.codedelaroute.tn/images/d1.png", order: 8, visible: true },
                { category: "D+E / D1+E", description: "دروس في D+E / D1+E", image: "https://www.codedelaroute.tn/images/d+e.png", order: 9, visible: true },
                { category: "امتحانات", description: "امتحانات تجريبية", image: "https://www.codedelaroute.tn/images/exam.png", order: 10, visible: true },
            ];
            categories = await Category.insertMany(defaultCategories);
        }

        const categoriesWithCounts = await Promise.all(categories.map(async (cat) => {
            const topicCount = await Topic.countDocuments({ category: cat.category });
            const catObj = cat.toObject ? cat.toObject() : cat;
            return { ...catObj, topicCount };
        }));

        res.status(200).json(categoriesWithCounts);
    } catch (error) {
        res.status(500).json({ message: 'فشل في جلب الفئات', error: error.message });
    }
});

// 3. إضافة فئة جديدة
app.post('/api/categories', async (req, res) => {
    try {
        const { category, description, image, order, visible, isFree } = req.body;
        const newCategory = new Category({ category, description, image, order: order || 0, visible: visible !== undefined ? visible : true, isFree: isFree || false });
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