// src/pages/Serie.js

import React, { useState, useEffect } from 'react';
import Navbar from '../comp/navbar';
import { FaChevronRight, FaChevronLeft, FaTimesCircle, FaCheckCircle } from 'react-icons/fa'; 
import { useLocation } from 'react-router-dom';
import axios from 'axios'; 
// تأكد من وجود ملف Serie.css لاستخدام الأنماط

const API_URL = 'http://localhost:3000/api/quiz/questions'; 
const FREE_TRIAL_LIMIT = 3; 

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


export default function Serie() {
    const location = useLocation(); 
    
    const [quizData, setQuizData] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };
    
    const handleJumpToQuestion = (index) => {
        // يسمح بالانتقال فقط ضمن الدروس المرئية (المسموح بها)
        if (index >= 0 && index < visibleLessonCount) { 
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

            if (!category1 || category1 === 'Unknown' || !category2 || category2 === 'Unknown') {
                setLoading(false);
                return setError('الرابط غير مكتمل. لا يمكن تحديد فئة المركبة أو الموضوع.');
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
                <div className="quiz-header">
                    <h2>درس رخصة القيادة: {mainCategory} - {currentTopic}</h2>
                    {/* نستخدم totalQuestions لعدد الدروس الكلي ونعرض الحد التجريبي إذا لم يكن مشتركاً */}
                    <p>الدرس {currentQuestionIndex + 1} من {totalQuestions}</p> 
                </div>

                <div className="quiz-content-wrapper">
                    
                    {/* عمود رقم الدرس (أقصى اليمين) */}
                    <div className="answer-sheet">
                       <div className="lesson-numbers-list">
                           <h4>أرقام الدروس</h4>
                           <div className="lesson-buttons-grid"> 
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
                                <img 
                                    src={currentQuestion.image} 
                                    alt="صورة الدرس" 
                                    className="question-image" 
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x250?text=صورة+غير+متوفرة"; }}
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
                        <div className="your-response-box">
                            <p>الإجابة الصحيحة</p>
                            <span className="response-placeholder correct-letter-display">
                                {/* إخفاء الإجابة في الدروس المحجوبة */}
                                {isCurrentLessonLocked ? '🔒' : getCorrectAnswerLetter()}
                            </span>
                        </div>
                        
                        <div className="question-info">
                            <p>{mainCategory} و {currentTopic}</p>
                            <p>Serie 1</p>
                        </div>
                        
                        <button className="reveal-button disabled-button" disabled>استقبال</button>
                        
                        {/* رسالة الحجب - تم نقلها الآن إلى شاشة أكبر */}
                    </div>

                </div>
                
                {/* أزرار التنقل بين الأسئلة في الأسفل */}
                <div className="quiz-navigation">
                    <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="nav-button">
                        <FaChevronRight /> الدرس السابق
                    </button>
                    <button 
                        onClick={handleNext} 
                        // ⭐️ تعطيل زر التالي إذا وصل إلى الحد المرئي
                        disabled={currentQuestionIndex >= visibleLessonCount - 1} 
                        className="nav-button next-button"
                    >
                        التالي <FaChevronLeft />
                    </button>
                </div>

                {/* عرض رسالة الحجب في الأسفل إذا كان الدرس الأخير المجاني هو المرئي */}
                {(!isSubscribed && currentQuestionIndex >= FREE_TRIAL_LIMIT - 1 && totalQuestions > FREE_TRIAL_LIMIT) && (
                     <div className="premium-lock-message" style={{color: 'red', marginTop: '15px', textAlign: 'center', border: '1px solid red', padding: '10px', borderRadius: '5px'}}>
                         وصلت إلى الحد الأقصى للدروس المجانية. يرجى الاشتراك للمتابعة!
                     </div>
                )}
            </div>
        </>
    );
}