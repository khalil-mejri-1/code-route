// src/components/Admin/QuestionForm.js

import React, { useState } from 'react';
import axios from 'axios';

// ⭐️ تغيير API_URL لنقطة نهاية الدفعة (BATCH)
const API_URL = 'https://code-route-rho.vercel.app/api/quiz/questions/batch'; 

// 🔑 مفتاح API الخاص بك لـ ImgBB
const IMGBB_API_KEY = 'd9eb76a38b59f5fb253a8be1456c90c0';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

// ⭐️ قائمة فئات رخص القيادة (الفئة 1)
const LICENSE_TYPES = [
    "B",    
    "A / A1",    
    "A1 / AM",    
    "B+E",    
    "C / C1",    
    "C+E / C1+E",    
    "D",    
    "D1",    
    "D+E / D1+E"
];

// ⭐️ قائمة المواضيع (الفئة 2)
const TOPIC_CATEGORIES = [
    "العلامات و الاشارات",
    "الأولوية",
    "قواعد الجولان",
    "المخالفات و العقوبات",
"السواق و العربات ",
    "الصيانة",
    "المقاطعة و المجاوزة",
"اسعافات اولية ",
"مواد خطيرة ",
"وقوف و توقف "
];

// ⭐️⭐️ تعريف كائن البيانات المشتركة الافتراضي (للفئة ورقم السلسلة فقط)
const DefaultMetaData = {
    nbSerie: '1', 
    category1: LICENSE_TYPES[0], 
    category2: TOPIC_CATEGORIES[7], 
};


/**
 * 💡 دالة تحليل الإدخال النصي الجماعي (BATCH)
 * تفصل الأسئلة بفاصل "_________".
 * @param {string} bulkText - النص المدخل (السؤال + الخيارات في سطور متتالية)
 * @returns {Array<{question: string, options: Array<Object>}>} مصفوفة من كائنات الأسئلة
 */
const parseBulkInput = (bulkText) => {
    // الفصل بالفاصل المطلوب: _________ (مع تجاهل المسافات الزائدة)
    const questionBlocks = bulkText.split(/---+/).map(block => block.trim()).filter(block => block !== '');

    if (questionBlocks.length === 0) return [];

    return questionBlocks.map((block, index) => {
        // تنظيف السطور بشكل صارم
        const lines = block.split('\n').map(line => line.trim()).filter(line => line !== '');
        
        // 🚨 خط التحقق من الطول
        if (lines.length < 2) { 
            throw new Error(`السؤال رقم ${index + 1}: يجب أن يحتوي على نص السؤال وخيار واحد على الأقل.`);
        }

        const questionText = lines[0];
        const optionTexts = lines.slice(1).filter(text => text !== ''); // الخيارات تبدأ من السطر الثاني
        
        // تطبيق المطلوب: الخيار الأول هو الصحيح دائمًا
        const options = optionTexts.map((text, oIndex) => ({
            text: text,
            isCorrect: oIndex === 0,
        })).slice(0, 3); // الحد الأقصى 3 خيارات
        
        // التحقق من وجود خيارات فعلية بعد الفلترة
        if (options.length === 0) {
            throw new Error(`السؤال رقم ${index + 1}: لم يتم العثور على أي خيارات بعد نص السؤال.`);
        }

        return { question: questionText, options };
    });
};

/**
 * 💡 دالة مساعدة لحساب عدد الأسئلة بأمان دون التسبب في تعطل التطبيق
 * @param {string} bulkText - النص المدخل
 * @returns {number} عدد الأسئلة المحللة، أو 0 في حالة وجود خطأ في التنسيق
 */
const getParsedQuestionCount = (bulkText) => {
    try {
        if (!bulkText || bulkText.trim() === '') return 0;
        return parseBulkInput(bulkText).length;
    } catch (e) {
        return 0; // إرجاع 0 في حالة وجود خطأ لمنع تعطل واجهة المستخدم
    }
};


export default function QuestionForm() {
    // 🌟 حالة الميتا داتا (الفئات، رقم السلسلة) - مشتركة لجميع الأسئلة
    const [metaData, setMetaData] = useState(DefaultMetaData);
    // 🌟 حالة الإدخال النصي الكبير لجميع الأسئلة والخيارات
    const [bulkInput, setBulkInput] = useState('');
    // 🌟 حالة مصفوفة ملفات الصور (لتخزين 10 صور أو أكثر)
    const [imageFiles, setImageFiles] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // ⭐️ دالة لتحديث حقل معين للميتا داتا
    const handleMetaDataChange = (field, value) => {
        setMetaData(prev => ({ ...prev, [field]: value }));
    };
    
    // ⭐️ دالة للتعامل مع اختيار ملفات الصور المتعددة
    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
    };
    
    // 🌟 دالة لرفع الصورة إلى ImgBB (تبقى كما هي) 🌟
    const uploadImageToImgBB = async (file) => {
        try {
            const formData = new FormData();
            const base64Image = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(file);
            });

            formData.append('image', base64Image);

            const response = await axios.post(
                `${IMGBB_UPLOAD_URL}?key=${IMGBB_API_KEY}`, 
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data.data.url; 
        } catch (error) {
            console.error('فشل رفع الصورة إلى ImgBB:', error);
            const errorMessage = error.response?.data?.error?.message || 'خطأ غير معروف أثناء رفع الصورة.';
            throw new Error('فشل رفع الصورة: ' + errorMessage);
        }
    };

    // 🚨 دالة الإرسال الرئيسية (تم تعديلها لاستخدام دالة التحليل)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // 1. تحليل الإدخال النصي
        let parsedQuestions;
        try {
            // 🚨 هنا يجب أن نستخدم دالة التحليل مباشرةً لنعالج الخطأ ونمنع الإرسال إذا كان هناك خطأ في التنسيق
            parsedQuestions = parseBulkInput(bulkInput);
        } catch (err) {
            setError('خطأ في تنسيق الإدخال النصي: ' + err.message);
            setLoading(false);
            return;
        }

        // 2. التحقق من تطابق العدد
        if (imageFiles.length !== parsedQuestions.length) {
            setError(`يجب أن يكون عدد الأسئلة المدخلة (${parsedQuestions.length}) مطابقاً لعدد الصور المرفوعة (${imageFiles.length}). الرجاء التأكد من عدد الفواصل _________.`);
            setLoading(false);
            return;
        }

        const questionsToSend = [];
        
        // 3. رفع الصور ودمج البيانات
        try {
            for (let i = 0; i < parsedQuestions.length; i++) {
                const q = parsedQuestions[i];
                const file = imageFiles[i];

                setMessage(`جاري رفع صورة السؤال رقم ${i + 1} من ${parsedQuestions.length}...`);
                
                // رفع الصورة و الحصول على الرابط
                const uploadedUrl = await uploadImageToImgBB(file);

                // التحقق من البيانات المشتركة
                const numericNbSerie = parseInt(metaData.nbSerie);
                if (isNaN(numericNbSerie) || numericNbSerie < 1) {
                    throw new Error(`رقم السلسلة يجب أن يكون رقماً صحيحاً وموجباً.`);
                }
                
                // بناء كائن بيانات السؤال للإرسال
                questionsToSend.push({
                    question: q.question,
                    image: uploadedUrl, // الصورة المرفوعة
                    category1: metaData.category1,
                    category2: metaData.category2,
                    nb_serie: numericNbSerie,
                    options: q.options,
                });
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
            return;
        }
        
        // 4. إرسال جميع الأسئلة دفعة واحدة
        try {
            setMessage(`تم رفع جميع الصور بنجاح. جاري إرسال ${questionsToSend.length} سؤال...`);
            const response = await axios.post(API_URL, questionsToSend);
            
            setMessage(response.data.message);
            
            // إعادة تعيين النموذج بالكامل
            setBulkInput('');
            setImageFiles([]);
        } catch (err) {
            const serverMessage = err.response?.data?.message;
            if (serverMessage) {
                 setError('فشل الإرسال: ' + serverMessage);
            } else {
                 setError('خطأ في الاتصال بالخادم. تأكد من أن الخادم يعمل على المنفذ 3000 ونقطة نهاية /batch.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="question-form-container" style={styles.container}>
            <h2 style={styles.header}>إضافة أسئلة جديدة (دفعة الصور والنصوص)</h2>
            
            {message && <div style={styles.success}>{message}</div>}
            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
                
                {/* ⭐️ حقول البيانات المشتركة (الميتا داتا) */}
                <div style={{ border: '2px solid #3498db', padding: '15px', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
                    <h3 style={{...styles.subheader, color: '#3498db', borderBottom: '2px solid #3498db'}}>
                        البيانات المشتركة (تنطبق على جميع الأسئلة في الدفعة)
                    </h3>
                    
                    {/* حقل رقم السلسلة */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>رقم السلسلة (Series Number) *</label>
                        <input
                            type="number"
                            value={metaData.nbSerie}
                            onChange={(e) => handleMetaDataChange('nbSerie', e.target.value)}
                            required
                            min="1"
                            style={styles.input}
                        />
                    </div>

                    {/* ⭐️ الفئة 1: المركبة */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>الفئة 1: نوع المركبة *</label>
                        <select
                            value={metaData.category1}
                            onChange={(e) => handleMetaDataChange('category1', e.target.value)}
                            required
                            style={styles.input}
                        >
                            {LICENSE_TYPES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                        </select>
                    </div>

                    {/* ⭐️ الفئة 2: الموضوع */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>الفئة 2: الموضوع *</label>
                        <select
                            value={metaData.category2}
                            onChange={(e) => handleMetaDataChange('category2', e.target.value)}
                            required
                            style={styles.input}
                        >
                            {TOPIC_CATEGORIES.map((topic) => (<option key={topic} value={topic}>{topic}</option>))}
                        </select>
                    </div>
                </div>

                {/* ⭐️ حقل رفع الصور المتعددة */}
                <div style={styles.formGroup}>
                    <label style={styles.label}>🖼️ تحميل صور الأسئلة (دفعة) *</label>
                    <div style={styles.note}>
                        **ملاحظة هامة:** يجب أن يكون عدد الصور المحددة مطابقاً تماماً لعدد الأسئلة المدخلة في الحقل النصي أدناه.
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        multiple 
                        onChange={handleFilesChange}
                        required
                        style={{...styles.input, paddingRight: '10px', backgroundColor: 'white'}}
                    />
                    {imageFiles.length > 0 && 
                        <p style={{marginTop: '5px', fontSize: '0.9em', color: '#2ecc71'}}>
                            ✅ تم اختيار **{imageFiles.length}** صورة.
                        </p>}
                </div>
                
                {/* ⭐️ حقل الإدخال النصي الكبير للأسئلة والخيارات */}
                <div style={styles.formGroup}>
                    <label style={styles.label}>📝 إدخال الأسئلة والخيارات (لكل سؤال) *</label>
                    <div style={styles.note}>
                        **الشكل المطلوب:**
                        <br/>
                        1. السطر الأول: **نص السؤال**
                        2. السطر الثاني: **الخيار الصحيح (يُعين تلقائيًا)**
                        3. السطر الثالث والرابع: الخيارات الخاطئة (اختياري)
                        4. **الفاصل بين الأسئلة:** `_________`
                    </div>
                    <textarea
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                        required
                        style={{...styles.textarea, minHeight: '300px', fontFamily: 'monospace'}}
                        placeholder={`السؤال 1؟\nالخيار الصحيح (1)\nالخيار الخاطئ 1\nالخيار الخاطئ 2\n\n_________\n\nالسؤال 2؟\nالخيار الصحيح (2)\nالخيار الخاطئ 1\n\n...`}
                    />
                    
                     {/* 💡 عرض عدد الأسئلة المحللة للمراجعة (باستخدام الدالة الآمنة) */}
                    {bulkInput.trim() !== '' && (
                        <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#3498db' }}>
                            عدد الأسئلة التي تم تحليلها من النص: **{getParsedQuestionCount(bulkInput)}**
                        </p>
                    )}
                </div>

                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'جاري الإرسال...' : `إضافة الدفعة`}
                </button>
            </form>
        </div>
    );
}

// ... (Styles object remains the same)
const styles = {
    container: {
        maxWidth: '700px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        direction: 'rtl',
        fontFamily: 'Arial, sans-serif'
    },
    header: {
        textAlign: 'center',
        color: '#3498db',
    },
    formGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        boxSizing: 'border-box',
        appearance: 'none', 
        WebkitAppearance: 'none',
        background: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'><path fill=\'%23888\' d=\'M6 9l4-4H2z\'/></svg>") no-repeat right 10px center',
        backgroundSize: '12px',
        paddingRight: '30px', 
    },
    textarea: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        boxSizing: 'border-box',
        minHeight: '80px',
    },
    subheader: {
        marginTop: '20px',
        marginBottom: '10px',
        borderBottom: '1px solid #eee',
        paddingBottom: '5px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    note: { // 💡 نمط توضيحي للإدخال
        backgroundColor: '#ecf0f1',
        border: '1px solid #bdc3c7',
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '4px',
        fontSize: '0.9em'
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#2ecc71',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '20px',
        fontSize: '1em'
    },
    success: {
        padding: '10px',
        backgroundColor: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb',
        borderRadius: '4px',
        marginBottom: '15px',
        textAlign: 'center'
    },
    error: {
        padding: '10px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb',
        borderRadius: '4px',
        marginBottom: '15px',
        textAlign: 'center'
    }
};