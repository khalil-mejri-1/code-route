// src/pages/Serie.js

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../comp/navbar';
import { FaChevronRight, FaChevronLeft, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, IMGBB_API_KEY, IMGBB_UPLOAD_URL } from '../config';
// تأكد من وجود ملف Serie.css لاستخدام الأنماط

const API_URL = `${API_BASE_URL}/quiz/questions`;
const FREE_TRIAL_LIMIT = 3;

// ⭐️ دالة مساعدة لتجزئة الباراميتر المدمج
const parseCategoryParam = (param) => {
    if (!param) return { category1: '', category2: '' };

    const parts = param.split(' / ').map(p => p.trim()).filter(p => p.length > 0);

    let category1 = '';
    let category2 = '';

    if (parts.length >= 3) {
        category1 = parts.slice(0, 2).join(' / ');
        category2 = parts.slice(2).join(' / ');
    } else if (parts.length === 2) {
        category1 = parts[0];
        category2 = parts[1];
    } else {
        category1 = parts[0] || '';
        category2 = '';
    }

    return { category1, category2 };
};


export default function Serie() {
    const location = useLocation();
    const scrollRef = useRef(null);

    const [quizData, setQuizData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showEditModal, setShowEditModal] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    // --- Edit Mode States (Admin) ---
    const [editInputText, setEditInputText] = useState('');
    const [editOutputText, setEditOutputText] = useState('');
    const [editImageFile, setEditImageFile] = useState(null);
    const [editPreviewUrl, setEditPreviewUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const fileInputRef = useRef(null);

    // Scroll active question into view
    useEffect(() => {
        if (scrollRef.current) {
            const activeBtn = scrollRef.current.querySelector('.active-lesson');
            if (activeBtn) {
                activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [currentQuestionIndex]);

    // ملاحظة: تم إزالة تطبيق slice هنا. سيتم تطبيق الحد لاحقاً فقط على التنقل.
    const isSubscribed = localStorage.getItem('subscriptions') === 'true';

    const currentQuestion = quizData[currentQuestionIndex];
    const totalQuestions = quizData.length;
    // الحد المرئي هو الحد التجريبي إذا لم يكن مشتركاً، وإلا فهو العدد الكلي
    const visibleLessonCount = isSubscribed ? totalQuestions : FREE_TRIAL_LIMIT;


    // ⭐️⭐️ الدوال المساعدة ⭐️⭐️

    const handleNext = () => {
        // يسمح بالانتقال للدروس التي تقل عن الحد المرئي
        if (currentQuestionIndex < visibleLessonCount - 1) {
            setImageLoading(true);
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setImageLoading(true);
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleJumpToQuestion = (index) => {
        // يسمح بالانتقال فقط ضمن الدروس المرئية (المسموح بها)
        if (index >= 0 && index < visibleLessonCount) {
            setImageLoading(true);
            setCurrentQuestionIndex(index);
        }
    };

    const getCorrectAnswerLetter = () => {
        if (!currentQuestion) return '?';
        const correctIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);
        return ['أ', 'ب', 'ج'][correctIndex] || '?';
    };

    const getOptionClass = (isCorrect) => {
        return isCorrect ? 'quiz-option correct-answer' : 'quiz-option incorrect-answer';
    };

    // --- جلب البيانات من الـ API ---
    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            setError(null);

            const urlParams = new URLSearchParams(location.search);
            const rawCategoryParam = urlParams.get('category');
            const nbSerieParam = urlParams.get('nb_serie') || '1';

            const { category1, category2 } = parseCategoryParam(rawCategoryParam || '');

            if (!category1) {
                setLoading(false);
                return setError('الرابط غير مكتمل. لا يمكن تحديد فئة المركبة.');
            }

            try {
                const response = await axios.get(API_URL, {
                    params: {
                        category1: category1,
                        category2: category2,
                        nb_serie: parseInt(nbSerieParam),
                    }
                });

                if (response.data && response.data.length > 0) {
                    // ⭐️ جلب جميع البيانات بدون قطعها هنا، ليتسنى عرض أرقام الدروس المحجوبة
                    setQuizData(response.data);
                    setCurrentQuestionIndex(0);
                    setImageLoading(true);
                } else {
                    setQuizData([]);
                    setError(`لم يتم العثور على أسئلة للفئة: "${category1} / ${category2}" والسلسلة: ${nbSerieParam}.`);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setError('فشل الاتصال بالخادم أو جلب البيانات. تأكد من أن الخادم يعمل.');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [location.search, isSubscribed]);


    // --- استخراج وتجزئة بيانات الفئة من الـ URL (للعرض) ---
    const { category1: mainCategory, category2: currentTopic } = parseCategoryParam(new URLSearchParams(location.search).get('category') || '');

    // ⭐️ دالة لفتح نافذة التعديل (المحسنة)
    const handleEditCorrectAnswer = () => {
        // تجهيز النص المستخرج من البيانات الحالية
        const correctOpt = currentQuestion.options.find(o => o.isCorrect);
        const incorrectOpts = currentQuestion.options.filter(o => !o.isCorrect);

        const initialOutput = [
            currentQuestion.question,
            correctOpt?.text || '',
            ...incorrectOpts.map(o => o.text)
        ].join('\n');

        setEditOutputText(initialOutput);
        setEditInputText('');
        setEditImageFile(null);
        setEditPreviewUrl(currentQuestion.image);
        setStatusMessage('');
        setShowEditModal(true);
    };

    // ⭐️ منطق استخراج النص (مثل Admin 2)
    const processEditResult = () => {
        const lines = editInputText.split('\n');

        const cleaned = lines.filter(line => {
            const trimmed = line.trim();
            if (trimmed === '' || trimmed.length === 1) return false;
            if (/dell/i.test(trimmed)) return false;
            if (trimmed.includes('codedelaroute') || trimmed.includes('Code de la route')) return false;
            if (trimmed.includes('الاجابات الخاطلة') || trimmed.includes('اجابتك هى') || trimmed.includes('Votre réponse')) return false;
            if (/Serie\s+\d+/i.test(trimmed)) return false;
            if (/^\d{1,2}:\d{2}$/.test(trimmed)) return false;
            return true;
        });

        const timeRegex = /\b\d{1,2}:\d{2}\b/;
        let result = [];
        let method = 'تنظيف بسيط';

        let colonIndex = -1;
        for (let i = cleaned.length - 1; i >= 0; i--) {
            if (cleaned[i].includes(':') && !(timeRegex.test(cleaned[i]) && cleaned[i].length < 10)) {
                if (cleaned.length - 1 - i >= 1) {
                    colonIndex = i;
                    break;
                }
            }
        }

        if (colonIndex !== -1) {
            result = cleaned.slice(colonIndex);
            method = 'تم العثور على (:)';
        } else {
            result = cleaned;
        }

        // حذف البادئات (أ، ب، ج...)
        result = result.map(line => line.replace(/^([a-zA-Z\u0600-\u065F\u066A-\u06FF]\u0640?\s+)+/, ''));

        setEditOutputText(result.join('\n'));
        setStatusMessage(method);
    };

    // ⭐️ رفع الصورة (مثل Admin 2)
    const uploadToImgBB = async (file) => {
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });

        const params = new URLSearchParams();
        params.append('image', base64);

        const response = await fetch(`${IMGBB_UPLOAD_URL}?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });

        const data = await response.json();
        if (data.success) return data.data.url;
        throw new Error('فشل رفع الصورة');
    };

    // ⭐️ حفظ التعديلات الكلية
    const handleSaveEdit = async () => {
        const lines = editOutputText.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 2) {
            alert('يجب أن يحتوي النص المستخرج على سؤال وإجابة واحدة على الأقل.');
            return;
        }

        setIsSaving(true);
        try {
            let imageUrl = currentQuestion.image;
            if (editImageFile) {
                imageUrl = await uploadToImgBB(editImageFile);
            }

            const questionText = lines[0];
            const options = lines.slice(1).map((text, idx) => ({
                text,
                isCorrect: idx === 0
            }));

            await axios.put(`${API_BASE_URL}/questions/${currentQuestion._id}`, {
                question: questionText,
                options: options,
                image: imageUrl
            });

            // تحديث البيانات محلياً
            const updatedData = [...quizData];
            updatedData[currentQuestionIndex] = {
                ...currentQuestion,
                question: questionText,
                options: options,
                image: imageUrl
            };
            setQuizData(updatedData);
            setShowEditModal(false);
            alert('✅ تم تحديث الدرس بنجاح!');
        } catch (err) {
            console.error(err);
            alert('❌ فشل في تحديث الدرس.');
        } finally {
            setIsSaving(false);
        }
    };


    // --- عرض حالة التحميل والخطأ ---
    if (loading) {
        return (
            <>
                <Navbar />
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <h2>جاري تحميل الدروس... 🔄</h2>
                </div>
            </>
        );
    }

    if (error || totalQuestions === 0) {
        return (
            <>
                <Navbar />
                <div style={{ textAlign: 'center', padding: '100px', color: 'red' }}>
                    <h2>{error || 'لا توجد دروس متاحة حاليًا لهذه السلسلة.'} ⚠️</h2>
                </div>
            </>
        );
    }
    // -----------------------------

    // ⭐️ ملاحظة: إذا كان currentQuestionIndex يشير إلى درس محجوب (غير مشترك و index >= FREE_TRIAL_LIMIT)،
    // نعرض رسالة الحجب بدلاً من المحتوى، مع الإبقاء على التنقل.
    const isCurrentLessonLocked = !isSubscribed && currentQuestionIndex >= FREE_TRIAL_LIMIT;

    return (
        <>
            <Navbar />
            <div className="quiz-container">
                {/* ⭐️ نافذة تعديل الإجابة بتصميم جميل */}
                {showEditModal && (
                    <div className="modern-modal-overlay">
                        <div className="modern-modal-content edit-lesson-modal" style={{ maxWidth: '800px', width: '90%' }}>
                            <div className="modal-header-admin">
                                <h3>🛠️ تعديل محتوى الدرس</h3>
                                <button className="close-btn-top" onClick={() => setShowEditModal(false)}><FaTimesCircle /></button>
                            </div>

                            <div className="modal-body-scrollable">
                                <div className="admin-edit-section">
                                    <label>1. استخراج النص (Extract)</label>
                                    <textarea
                                        className="admin-textarea"
                                        placeholder="ضع النص الخام هنا لإعادة استخراجه..."
                                        value={editInputText}
                                        onChange={(e) => setEditInputText(e.target.value)}
                                        rows={4}
                                    />
                                    <button className="admin-process-btn" onClick={processEditResult}>استخراج / Clean ✨</button>
                                    {statusMessage && <small className="status-msg">{statusMessage}</small>}
                                </div>

                                <div className="admin-edit-section">
                                    <label>2. السؤال والإجابات (الصحيحة أولاً)</label>
                                    <textarea
                                        className="admin-textarea output-textarea"
                                        placeholder="السطر 1: السؤال\nالسطر 2: الإجابة الصحيحة\nالباقي: إجابات خاطئة"
                                        value={editOutputText}
                                        onChange={(e) => setEditOutputText(e.target.value)}
                                        rows={6}
                                    />
                                </div>

                                <div className="admin-edit-section">
                                    <label>3. تعديل الصورة</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setEditImageFile(e.target.files[0]);
                                                setEditPreviewUrl(URL.createObjectURL(e.target.files[0]));
                                            }
                                        }}
                                        className="admin-file-input"
                                    />
                                    {editPreviewUrl && (
                                        <div className="admin-preview-box">
                                            <img src={editPreviewUrl} alt="Preview" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer-admin">
                                <button className="cancel-btn" onClick={() => setShowEditModal(false)}>إلغاء</button>
                                <button
                                    className="save-btn"
                                    onClick={handleSaveEdit}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات ✅'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="quiz-header">
                    <h2>درس : {mainCategory} {currentTopic && `- ${currentTopic}`}</h2>
                    {/* نستخدم totalQuestions لعدد الدروس الكلي ونعرض الحد التجريبي إذا لم يكن مشتركاً */}
                    {/* <p>الدرس {currentQuestionIndex + 1} من {totalQuestions}</p> */}
                    {/* <h3>Serie {(new URLSearchParams(location.search).get('nb_serie') || '1')}</h3> */}

                </div>

                <div className="quiz-content-wrapper">

                    {/* عمود رقم الدرس (أقصى اليمين) */}
                    <div className="answer-sheet">
                        <div className="lesson-numbers-list">
                            <h4>أرقام الدروس</h4>
                            <div className="lesson-buttons-grid" ref={scrollRef}>
                                {/* ⭐️ تم التعديل: التكرار على جميع الأسئلة لجعل جميع الأزرار مرئية */}
                                {quizData.map((_, index) => {
                                    // تحديد ما إذا كان الدرس محجوبًا
                                    const isLocked = !isSubscribed && index >= FREE_TRIAL_LIMIT;
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`${index === currentQuestionIndex ? 'active-lesson' : ''} ${isLocked ? 'locked-lesson' : ''}`}
                                            onClick={() => handleJumpToQuestion(index)}
                                            // ⭐️ تعطيل الزر إذا كان محجوبًا
                                            disabled={isLocked}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* زر التعديل للمسؤول */}
                    <button
                        className="edit-answer-btn"
                        onClick={handleEditCorrectAnswer}
                        style={{
                            marginTop: '10px',
                            padding: '5px 10px',
                            fontSize: '12px',
                            backgroundColor: '#f39c12',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            position: "absolute",
                            top: "80px",
                            right: "10px"
                        }}
                    >
                        تعديل الدرس
                    </button>
                    {/* العمود الرئيسي للسؤال والصورة */}
                    <div className="question-main">
                        {isCurrentLessonLocked ? (
                            <div className="premium-lock-screen" style={{ textAlign: 'center', padding: '100px', border: '2px dashed #f00', borderRadius: '10px' }}>
                                <h3>🔒 الدرس رقم {currentQuestionIndex + 1} محجوب</h3>
                                <p>لقد وصلت إلى الحد الأقصى للدروس المجانية (الدروس **{FREE_TRIAL_LIMIT + 1}** وما بعدها). يرجى **الاشتراك** للمتابعة والاستمتاع بجميع الأسئلة!</p>
                            </div>
                        ) : (
                            <>
                                <div className="question-image-box">
                                    {imageLoading && (
                                        <div className="image-loader-placeholder">
                                            <div className="spinner"></div>
                                            <p>جاري تحميل الصورة...</p>
                                        </div>
                                    )}
                                    <img
                                        src={currentQuestion.image}
                                        alt="صورة الدرس"
                                        className="question-image"
                                        style={imageLoading ? { display: 'none' } : {}}
                                        onLoad={() => setImageLoading(false)}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/400x250?text=صورة+غير+متوفرة";
                                            setImageLoading(false);
                                        }}
                                    />
                                </div>

                                <div className="question-text-box">
                                    <p className="question-title">{currentQuestion.question}</p>
                                </div>

                                {/* منطقة الخيارات */}
                                <div className="options-grid">
                                    {currentQuestion.options.map((option, index) => (
                                        <div
                                            key={index}
                                            className={getOptionClass(option.isCorrect)}
                                        >
                                            <span className="option-letter">{['أ', 'ب', 'ج'][index]}</span>
                                            {option.text}
                                            {option.isCorrect ? (
                                                <FaCheckCircle className="answer-icon correct-icon" />
                                            ) : (
                                                <FaTimesCircle className="answer-icon incorrect-icon" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* عمود التحكم (أقصى اليسار) */}
                    <div className="control-panel">
                        {/* <div className="your-response-box">
                            <p>الإجابة الصحيحة</p>
                            <span className="response-placeholder correct-letter-display">

                                {isCurrentLessonLocked ? '🔒' : getCorrectAnswerLetter()}
                            </span>


                        </div> */}

                        {/* <div className="question-info">
                            <p>{mainCategory} و {currentTopic}</p>
                            <p>Serie {(new URLSearchParams(location.search).get('nb_serie') || '1')}</p>
                        </div> */}

                        {/* <button className="reveal-button disabled-button" disabled>استقبال</button> */}

                        {/* رسالة الحجب - تم نقلها الآن إلى شاشة أكبر */}
                    </div>

                </div>

                {/* أزرار التنقل بين الأسئلة في الأسفل */}
                <div className="quiz-navigation">
                    <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="nav-button">
                        <FaChevronRight /><span className='disable_phone'> الدرس السابق</span>

                    </button>
                    <button
                        onClick={handleNext}
                        // ⭐️ تعطيل زر التالي إذا وصل إلى الحد المرئي
                        disabled={currentQuestionIndex >= visibleLessonCount - 1}
                        className="nav-button next-button"
                    >
                        <span className='disable_phone'>التالي</span> <FaChevronLeft />
                    </button>
                </div>

                {/* عرض رسالة الحجب في الأسفل إذا كان الدرس الأخير المجاني هو المرئي */}
                {(!isSubscribed && currentQuestionIndex >= FREE_TRIAL_LIMIT - 1 && totalQuestions > FREE_TRIAL_LIMIT) && (
                    <div className="premium-lock-message" style={{ color: 'red', marginTop: '15px', textAlign: 'center', border: '1px solid red', padding: '10px', borderRadius: '5px' }}>
                        وصلت إلى الحد الأقصى للدروس المجانية. يرجى الاشتراك للمتابعة!
                    </div>
                )}
            </div>
        </>
    );
}