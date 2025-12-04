// src/pages/Examen_test.js (النسخة النهائية والمعدلة)

import React, { useState, useEffect } from 'react';
import Navbar from '../comp/navbar';
import { FaChevronRight, FaChevronLeft, FaTimesCircle, FaCheckCircle } from 'react-icons/fa'; 
import { useLocation } from 'react-router-dom';
import axios from 'axios'; 
// import '../styles/ExamenTest.css'; // تأكد من استيراد الأنماط

const API_URL = 'http://localhost:3000/api/quiz/questions'; 
const FREE_TRIAL_LIMIT = 3; // ⭐️ تحديد الحد المجاني للاختبار (يمكنك تعديله)

// ⭐️ دالة مساعدة لتجزئة الباراميتر المدمج
const parseCategoryParam = (param) => {
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
        category1 = parts[0] || 'Unknown';
        category2 = parts[1] || 'Unknown';
    }

    return { category1, category2 };
};


export default function Examen_test() {
    const location = useLocation(); 
    
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

            if (!category1 || !category2) {
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
            if(isTargetLocked) return;
            
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
                <div className="quiz-header">
                    <h2>اختبار رخصة القيادة: {mainCategory} - {currentTopic}</h2>
                    {/* نعرض العدد الكلي للأسئلة */}
                    <p>السؤال {currentQuestionIndex + 1} من {totalQuestions}</p>
                </div>

                <div className="quiz-content-wrapper">
                    
                    {/* عمود رقم السؤال (أقصى اليمين) */}
                    <div className="answer-sheet">
                       <div className="lesson-numbers-list">
                           <h4>أرقام الأسئلة</h4>
                           <div className="lesson-buttons-grid"> 
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
                        
                        <div className="question-info">
                            <p>{mainCategory} و {currentTopic}</p>
                            <p>Serie 1</p>
                        </div>
                        
                        <button 
                            className="reveal-button" 
                            onClick={handleRevealAnswer}
                            // ⭐️ تعطيل الزر إذا كان محجوباً أو لم يتم اختيار إجابة
                            disabled={selectedAnswer === null || showAnswer || isCurrentQuestionLocked}
                        >
                            تأكيد الإجابة
                        </button>
                        
                        {showAnswer && !isCurrentQuestionLocked && (
                            <div className={`answer-status ${userAnswersHistory[currentQuestionIndex] ? 'status-correct' : 'status-incorrect'}`}>
                                {userAnswersHistory[currentQuestionIndex] ? 'إجابة صحيحة!' : 'إجابة خاطئة!'}
                            </div>
                        )}
                    </div>

                </div>
                
                {/* أزرار التنقل بين الأسئلة في الأسفل */}
                <div className="quiz-navigation">
                    <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="nav-button">
                        <FaChevronRight /> السابق
                    </button>
                    <button 
                        onClick={handleNext} 
                        // ⭐️ تعطيل زر التالي عند الوصول لآخر سؤال مسموح به
                        disabled={currentQuestionIndex === visibleQuestionCount - 1} 
                        className="nav-button next-button"
                    >
                        التالي <FaChevronLeft />
                    </button>
                </div>
            </div>
        </>
    );
}