// src/pages/Examen_test.js (النسخة النهائية والمعدلة)

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../comp/navbar';
import { FaChevronRight, FaChevronLeft, FaTimesCircle, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, IMGBB_API_KEY, IMGBB_UPLOAD_URL } from '../config';
// import '../styles/ExamenTest.css'; // تأكد من استيراد الأنماط

const API_URL = `${API_BASE_URL}/quiz/questions`;
const FREE_TRIAL_LIMIT = 3; // ⭐️ تحديد الحد المجاني للاختبار (يمكنك تعديله)

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


export default function Examen_test() {
    const location = useLocation();
    const navigate = useNavigate();
    const scrollRef = useRef(null);

    // ⭐️ حالات إدارة البيانات والتحميل
    const [quizData, setQuizData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // حالات التفاعل
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    // History: true (صحيح), false (خاطئ), null (لم تتم الإجابة/الكشف بعد)
    const [userAnswersHistory, setUserAnswersHistory] = useState([]);

    // --- Edit Mode States ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [editQuestionText, setEditQuestionText] = useState('');
    const [editOptions, setEditOptions] = useState([]);
    const [editImageFile, setEditImageFile] = useState(null);
    const [editPreviewUrl, setEditPreviewUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Scroll active question into view
    useEffect(() => {
        if (scrollRef.current) {
            const activeBtn = scrollRef.current.querySelector('.active-lesson');
            if (activeBtn) {
                activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [currentQuestionIndex]);

    // ⭐️ حالة الاشتراك
    const isSubscribed = localStorage.getItem('subscriptions') === 'true';

    // --- 1. جلب البيانات من الـ API ---
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
                return setError('الرابط غير مكتمل.');
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
                    setQuizData(response.data);
                    setCurrentQuestionIndex(0);
                    // تهيئة سجل الإجابات بحجم البيانات الجديدة
                    setUserAnswersHistory(Array(response.data.length).fill(null));
                } else {
                    setQuizData([]);
                    setError(`لم يتم العثور على أسئلة للاختبار: "${category1} / ${category2}" والسلسلة: ${nbSerieParam}.`);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setError('فشل الاتصال بالخادم أو جلب البيانات.');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [location.search, isSubscribed]); // إضافة isSubscribed لضمان إعادة التحميل إذا تغيرت حالة الاشتراك


    const totalQuestions = quizData.length;
    // ⭐️ حساب العدد المرئي من الأسئلة
    const visibleQuestionCount = isSubscribed ? totalQuestions : Math.min(totalQuestions, FREE_TRIAL_LIMIT);

    // ⭐️ تحديد ما إذا كان السؤال الحالي محجوباً
    const isCurrentQuestionLocked = !isSubscribed && currentQuestionIndex >= FREE_TRIAL_LIMIT;

    // يجب التحقق من وجود السؤال قبل محاولة الوصول إلى محتواه
    const currentQuestion = quizData[currentQuestionIndex];
    if (currentQuestionIndex >= totalQuestions && totalQuestions > 0) {
        // في حالة تجاوز المؤشر لعدد الأسئلة بعد جلبها، نرجعه للحد المسموح به
        setCurrentQuestionIndex(visibleQuestionCount - 1);
    }

    // --- (استخدام المتغيرات المستخلصة للعرض) ---
    const { category1: mainCategory, category2: currentTopic } = parseCategoryParam(new URLSearchParams(location.search).get('category') || '');

    // ⭐️ دالة النقر على الإجابة (لا يمكن النقر إذا كان السؤال محجوباً)
    const handleAnswerClick = (optionIndex) => {
        if (!showAnswer && !isCurrentQuestionLocked) {
            setSelectedAnswer(optionIndex);
        }
    };

    // ⭐️ دالة الكشف عن النتيجة (لا يمكن الكشف إذا كان السؤال محجوباً)
    const handleRevealAnswer = () => {
        if (selectedAnswer === null || showAnswer || isCurrentQuestionLocked) return;

        const isCorrect = currentQuestion.options[selectedAnswer].isCorrect;
        const newHistory = [...userAnswersHistory];
        newHistory[currentQuestionIndex] = isCorrect;
        setUserAnswersHistory(newHistory);

        setShowAnswer(true);
    };

    // دالة التنقل (يجب أن تعيد تعيين حالة الاختيار والكشف)
    const navigateToQuestion = (index) => {
        // ⭐️ يمكن التنقل فقط ضمن الأسئلة المرئية للمستخدم غير المشترك
        if (index >= 0 && index < totalQuestions) {
            // منع الانتقال للأسئلة المحجوبة عند النقر على الأسئلة في الـ Grid
            const isTargetLocked = !isSubscribed && index >= FREE_TRIAL_LIMIT;
            if (isTargetLocked) return;

            setCurrentQuestionIndex(index);

            // استعادة حالة الإجابة (لتجنب إعادة اختيار الإجابة في كل مرة)
            const answerStatus = userAnswersHistory[index];
            if (answerStatus !== null) {
                // إذا تمت الإجابة، نعثر على الإجابة الصحيحة لعرض الكشف
                const correctIndex = quizData[index].options.findIndex(opt => opt.isCorrect);
                setSelectedAnswer(correctIndex); // نعرض الإجابة الصحيحة
                setShowAnswer(true);
            } else {
                setSelectedAnswer(null);
                setShowAnswer(false);
            }
        }
    };

    // ⭐️ تعديل handleNext و handlePrev لاستخدام visibleQuestionCount
    const handleNext = () => {
        if (currentQuestionIndex < visibleQuestionCount - 1) {
            navigateToQuestion(currentQuestionIndex + 1);
        }
    };
    const handlePrev = () => navigateToQuestion(currentQuestionIndex - 1);
    const handleJumpToQuestion = (index) => navigateToQuestion(index);


    // ⭐️ دوال التعديل
    const handleOpenEditModal = () => {
        if (!currentQuestion) return;
        setEditQuestionText(currentQuestion.question || '');
        setEditOptions(currentQuestion.options.map(opt => ({ ...opt }))); // Deep copy
        setEditImageFile(null);
        setEditPreviewUrl(currentQuestion.image || null);
        setShowEditModal(true);
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...editOptions];
        newOptions[index].text = value;
        setEditOptions(newOptions);
    };

    const handleSetCorrectAnswer = (index) => {
        const newOptions = editOptions.map((opt, i) => ({
            ...opt,
            isCorrect: i === index
        }));
        setEditOptions(newOptions);
    };

    const handleAddOption = () => {
        setEditOptions([...editOptions, { text: '', isCorrect: false }]);
    };

    const handleRemoveOption = (index) => {
        const newOptions = editOptions.filter((_, i) => i !== index);
        if (newOptions.length > 0 && !newOptions.some(o => o.isCorrect)) {
            newOptions[0].isCorrect = true;
        }
        setEditOptions(newOptions);
    };

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

    const handleSaveEdit = async () => {
        if (!editQuestionText.trim() || editOptions.length === 0) {
            alert('يرجى التأكد من كتابة السؤال ووجود إجابة واحدة على الأقل.');
            return;
        }

        setIsSaving(true);
        try {
            let imageUrl = currentQuestion.image;
            if (editImageFile) {
                imageUrl = await uploadToImgBB(editImageFile);
            }

            await axios.put(`${API_BASE_URL}/questions/${currentQuestion._id}`, {
                question: editQuestionText,
                options: editOptions,
                image: imageUrl
            });

            // تحديث البيانات محلياً
            const updatedData = [...quizData];
            updatedData[currentQuestionIndex] = {
                ...currentQuestion,
                question: editQuestionText,
                options: editOptions,
                image: imageUrl
            };
            setQuizData(updatedData);
            setShowEditModal(false);
        } catch (err) {
            console.error(err);
            alert('❌ فشل في تحديث السؤال.');
        } finally {
            setIsSaving(false);
        }
    };

    // ⭐️ تعديل getOptionClass (الخيار المختار/الصحيح)
    const getOptionClass = (optionIndex, isCorrect) => {
        let className = 'quiz-option';

        // إذا كان السؤال محجوباً، لا نطبق أي فئة تفاعلية
        if (isCurrentQuestionLocked) {
            return className + ' locked-option';
        }

        if (showAnswer) {
            if (isCorrect) {
                className += ' correct-answer';
            } else if (selectedAnswer === optionIndex) {
                className += ' incorrect-answer';
            }
        } else if (selectedAnswer === optionIndex) {
            className += ' selected';
        }
        return className;
    };

    // ⭐️ تعديل getLessonNumberClass (لون زر السؤال في الـ Grid)
    const getLessonNumberClass = (index) => {
        // إذا كان السؤال محجوباً
        if (!isSubscribed && index >= FREE_TRIAL_LIMIT) {
            return 'locked-lesson';
        }

        if (index === currentQuestionIndex) return 'active-lesson';

        const answerStatus = userAnswersHistory[index];
        if (answerStatus === true) return 'answered-correctly';
        if (answerStatus === false) return 'answered-incorrectly';
        return '';
    };

    const getResponsePlaceholder = () => {
        if (isCurrentQuestionLocked) return '🔒';

        if (selectedAnswer !== null) {
            return ['أ', 'ب', 'ج'][selectedAnswer];
        }
        return '?';
    };


    // --- عرض حالة التحميل والخطأ ---
    if (loading) {
        return <><Navbar /><div style={{ textAlign: 'center', padding: '100px' }}><h2>جاري تحميل الاختبار... 🔄</h2></div></>;
    }

    if (error || totalQuestions === 0) {
        return <><Navbar /><div style={{ textAlign: 'center', padding: '100px', color: 'red' }}><h2>{error || 'لا توجد أسئلة متاحة حاليًا لهذا الاختبار.'} ⚠️</h2></div></>;
    }

    // -----------------------------

    return (
        <>
            <Navbar />
            <div className="quiz-container">
                {/* ⭐️ نافذة تعديل السؤال */}
                {showEditModal && (
                    <div className="modern-modal-overlay">
                        <div className="modern-modal-content edit-lesson-modal" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header-admin">
                                <h3>🛠️ تعديل محتوى السؤال</h3>
                                <button className="close-btn-top" onClick={() => setShowEditModal(false)}><FaTimesCircle /></button>
                            </div>

                            <div className="modal-body-scrollable">
                                <div className="admin-edit-section">
                                    <label>تعديل السؤال:</label>
                                    <textarea
                                        className="admin-textarea"
                                        value={editQuestionText}
                                        onChange={(e) => setEditQuestionText(e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div className="admin-edit-section">
                                    <label>تعديل الإجابات (اختر الإجابة الصحيحة بالدائرة):</label>
                                    {editOptions.map((opt, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
                                            <input
                                                type="radio"
                                                name="correctAnswer"
                                                checked={opt.isCorrect}
                                                onChange={() => handleSetCorrectAnswer(index)}
                                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                title="إجابة صحيحة"
                                            />
                                            <input
                                                type="text"
                                                value={opt.text}
                                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                                className="admin-textarea"
                                                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', margin: 0 }}
                                            />
                                            <button
                                                onClick={() => handleRemoveOption(index)}
                                                style={{ padding: '8px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={handleAddOption}
                                        style={{ marginTop: '10px', padding: '8px 15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        + إضافة إجابة
                                    </button>
                                </div>

                                <div className="admin-edit-section">
                                    <label>تعديل الصورة:</label>
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
                                            <img src={editPreviewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
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
                    <h2>اختبار رخصة القيادة: {mainCategory} {currentTopic && `- ${currentTopic}`}</h2>

                    <h3>Serie {(new URLSearchParams(location.search).get('nb_serie') || '1')}</h3>

                    {/* <p>السؤال {currentQuestionIndex + 1} من {totalQuestions}</p> */}
                </div>

                <div className="quiz-content-wrapper">

                    {/* عمود رقم السؤال (أقصى اليمين) */}
                    <div className="answer-sheet">
                        <div className="lesson-numbers-list">
                            <h4>أرقام الأسئلة</h4>
                            <div className="lesson-buttons-grid" ref={scrollRef}>
                                {/* ⭐️ التكرار على جميع الأسئلة لجعل جميع الأزرار مرئية */}
                                {quizData.map((_, index) => {
                                    const isLocked = !isSubscribed && index >= FREE_TRIAL_LIMIT;
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            className={getLessonNumberClass(index)}
                                            onClick={() => handleJumpToQuestion(index)}
                                            // ⭐️ تعطيل الأزرار المحجوبة
                                            disabled={isLocked}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>


                    {/* العمود الرئيسي للسؤال والصورة */}
                    <div className="question-main">
                        {/* ⭐️ عرض شاشة حجب إذا كان السؤال الحالي محجوباً */}
                        {isCurrentQuestionLocked ? (
                            <div className="premium-lock-screen" style={{ textAlign: 'center', padding: '100px', border: '2px dashed #f00', borderRadius: '10px', color: '#f00' }}>
                                <h3>🔒 السؤال رقم {currentQuestionIndex + 1} محجوب</h3>
                                <p>لقد وصلت إلى الحد الأقصى للأسئلة المجانية ({FREE_TRIAL_LIMIT} أسئلة). يرجى **الاشتراك** لتتمكن من حل الاختبار كاملاً!</p>
                            </div>
                        ) : (
                            <>
                                <div className="question-image-box">
                                    <img
                                        src={currentQuestion.image}
                                        alt="سؤال الإختبار"
                                        className="question-image"
                                    />
                                </div>

                                <div className="question-text-box">
                                    <p className="question-title">{currentQuestion.question}</p>
                                </div>

                                {/* منطقة الخيارات */}
                                <div className="options-grid">
                                    انقر على على إجابة الصحيحة
                                    {currentQuestion.options.map((option, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className={getOptionClass(index, option.isCorrect)}
                                            onClick={() => handleAnswerClick(index)}
                                            disabled={showAnswer || isCurrentQuestionLocked} // ⭐️ تعطيل النقر إذا كان السؤال محجوباً
                                        >
                                            <span className="option-letter">{['أ', 'ب', 'ج'][index]}</span>
                                            {option.text}

                                            {showAnswer && option.isCorrect && (
                                                <FaCheckCircle className="answer-icon correct-icon" />
                                            )}
                                            {showAnswer && !option.isCorrect && selectedAnswer === index && (
                                                <FaTimesCircle className="answer-icon incorrect-icon" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* عمود التحكم (أقصى اليسار) */}
                    <div className="control-panel">
                        <div className="your-response-box">
                            <p>إجابتك هي</p>
                            <span className="response-placeholder">
                                {getResponsePlaceholder()}
                            </span>
                        </div>

                        {/* ⭐️ زر التعديل */}
                        <button
                            className="edit-answer-btn"
                            onClick={handleOpenEditModal}
                            style={{
                                marginTop: '10px',
                                padding: '8px 15px',
                                fontSize: '14px',
                                backgroundColor: '#f39c12',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                width: '100%',
                                marginBottom: '10px'
                            }}
                        >
                            تعديل السؤال والإجابات
                        </button>

                        {/* <div className="question-info">
                            <p>{mainCategory} و {currentTopic}</p>

                        </div> */}

                        {/* الزر الخاص بالهاتف (يعرض فقط في وضع الموبايل عبر CSS) */}
                        {showAnswer && !isCurrentQuestionLocked && (
                            <div className={`answer-status ${userAnswersHistory[currentQuestionIndex] ? 'status-correct' : 'status-incorrect'}`}>
                                {userAnswersHistory[currentQuestionIndex] ? 'إجابة صحيحة!' : 'إجابة خاطئة!'}
                            </div>
                        )}
                        <button
                            className="reveal-button mobile-only-reveal"
                            onClick={handleRevealAnswer}
                            disabled={selectedAnswer === null || showAnswer || isCurrentQuestionLocked}
                        >
                            تأكيد الإجابة
                        </button>


                    </div>

                </div>

                {/* أزرار التنقل بين الأسئلة في الأسفل */}
                <div className="quiz-navigation">
                    <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="nav-button">
                        <FaChevronRight /><span> السابق</span>
                    </button>

                    <button
                        className="reveal-button mobile-only"
                        onClick={handleRevealAnswer}
                        // ⭐️ تعطيل الزر إذا كان محجوباً أو لم يتم اختيار إجابة
                        disabled={selectedAnswer === null || showAnswer || isCurrentQuestionLocked}
                        style={{ width: 'auto', minWidth: '200px' }} // Inline override for nav context
                    >
                        تأكيد الإجابة
                    </button>

                    <button
                        onClick={handleNext}
                        // ⭐️ تعطيل زر التالي عند الوصول لآخر سؤال مسموح به
                        disabled={currentQuestionIndex === visibleQuestionCount - 1}
                        className="nav-button next-button"
                    >
                        <span>التالي</span> <FaChevronLeft />
                    </button>
                </div>
            </div>
        </>
    );
}