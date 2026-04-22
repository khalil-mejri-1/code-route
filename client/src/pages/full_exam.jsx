import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, IMGBB_API_KEY, IMGBB_UPLOAD_URL } from '../config';
import bg from "../image/bg.png";
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle,
    XCircle,
    Lock,
    Settings,
    Award,
    UploadCloud,
    X,
    Trash2,
    Trophy,
    Shuffle
} from 'lucide-react';
import './SerieClassic.css';

const FREE_TRIAL_LIMIT = 5;

const parseCategoryParam = (param) => {
    if (!param) return { category1: '', category2: '' };
    if (!param.includes(' / ')) return { category1: param.trim(), category2: '' };
    const parts = param.split(' / ').map(p => p.trim());
    let category1 = '', category2 = '';
    if (parts.length >= 3) {
        category1 = parts.slice(0, 2).join(' / ');
        category2 = parts.slice(2).join(' / ');
    } else if (parts.length === 2) {
        category1 = parts[0];
        category2 = parts[1];
    } else {
        category1 = parts[0] || '';
    }
    return { category1, category2 };
};

export default function FullExam() {
    const location = useLocation();
    const navigate = useNavigate();
    const scrollRef = useRef(null);

    const [quizData, setQuizData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [userAnswersHistory, setUserAnswersHistory] = useState([]);
    const [imageLoading, setImageLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    const [editQuestion, setEditQuestion] = useState('');
    const [editOptions, setEditOptions] = useState([{ text: '', isCorrect: true }, { text: '', isCorrect: false }, { text: '', isCorrect: false }]);
    const [editImageFile, setEditImageFile] = useState(null);
    const [editPreviewUrl, setEditPreviewUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [timeLeft, setTimeLeft] = useState(50);
    const [isExamFinished, setIsExamFinished] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [userChoices, setUserChoices] = useState([]);
    const [reviewIndices, setReviewIndices] = useState([]);

    const isSubscribed = localStorage.getItem('subscriptions') === 'true';

    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category') || 'B';
    const examSerieParam = urlParams.get('examSerie');
    const { category1, category2 } = parseCategoryParam(categoryParam);

    useEffect(() => {
        const fetchQuestions = async () => {
            const cacheKey = `full_exam_session_v3_${category1}_${category2}_${examSerieParam}`;
            const cachedData = sessionStorage.getItem(cacheKey);

            if (cachedData) {
                try {
                    const parsedData = JSON.parse(cachedData);
                    setQuizData(parsedData);
                    setUserAnswersHistory(Array(parsedData.length).fill(null));
                    setLoading(false);
                    return;
                } catch (e) {
                    console.error("Failed to parse cached exam data", e);
                }
            }

            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/quiz/exam`, {
                    params: { category1, category2, examSerie: examSerieParam }
                });
                if (response.data && response.data.length > 0) {
                    setQuizData(response.data);
                    setUserAnswersHistory(Array(response.data.length).fill(null));
                    setUserChoices(Array(response.data.length).fill(null));
                    sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
                } else {
                    setError('لا توجد أسئلة متاحة لهذا الاختبار.');
                }
            } catch (err) {
                console.error(err);
                setError('فشل في جلب أسئلة الاختبار.');
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [category1, category2, examSerieParam]);

    useEffect(() => {
        if (quizData.length > 0) {
            quizData.forEach(q => {
                if (q.image) {
                    const img = new Image();
                    img.src = q.image;
                }
            });
        }
    }, [quizData]);

    const totalQuestions = quizData.length;
    const visibleCount = isSubscribed ? totalQuestions : Math.min(totalQuestions, FREE_TRIAL_LIMIT);
    const isLocked = !isSubscribed && currentQuestionIndex >= FREE_TRIAL_LIMIT;
    const currentQuestion = quizData[currentQuestionIndex];

    useEffect(() => {
        if (currentQuestion) {
            const img = new Image();
            img.src = currentQuestion.image;
            if (img.complete) {
                setImageLoading(false);
            } else {
                setImageLoading(true);
                const timer = setTimeout(() => setImageLoading(false), 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [currentQuestionIndex]);

    useEffect(() => {
        if (isLocked || showAnswer || isExamFinished || isReviewMode) return;

        if (timeLeft <= 0) {
            // Mark as wrong if time runs out
            const newHistory = [...userAnswersHistory];
            newHistory[currentQuestionIndex] = false;
            setUserAnswersHistory(newHistory);

            if (currentQuestionIndex < visibleCount - 1) {
                navigateTo(currentQuestionIndex + 1);
            } else {
                setIsExamFinished(true);
            }
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, currentQuestionIndex, isLocked, showAnswer, isExamFinished, visibleCount]);

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

    const handleAddOption = () => {
        if (editOptions.length >= 6) return alert('الحد الأقصى 6 خيارات.');
        setEditOptions([...editOptions, { text: '', isCorrect: false }]);
    };

    const handleRemoveOption = (index) => {
        if (editOptions.length <= 1) return alert('يجب أن يكون هناك خيار واحد على الأقل.');
        const wasCorrect = editOptions[index].isCorrect;
        const newOpts = editOptions.filter((_, i) => i !== index);
        if (wasCorrect && newOpts.length > 0) {
            newOpts[0].isCorrect = true;
        }
        setEditOptions(newOpts);
    };

    const handleSaveEdit = async () => {
        if (!editQuestion.trim() || editOptions.some(o => !o.text.trim())) {
            return alert('برجاء تزويد السؤال وجميع الخيارات.');
        }

        if (!editOptions.some(o => o.isCorrect)) {
            return alert('يرجى تحديد إجابة صحيحة واحدة على الأقل.');
        }

        setIsSaving(true);
        try {
            let imageUrl = currentQuestion.image;
            if (editImageFile) imageUrl = await uploadToImgBB(editImageFile);

            const options = editOptions;

            await axios.put(`${API_BASE_URL}/questions/${currentQuestion._id}`, {
                question: editQuestion,
                options: options,
                image: imageUrl
            });

            const updatedData = [...quizData];
            updatedData[currentQuestionIndex] = { ...currentQuestion, question: editQuestion, options: options, image: imageUrl };
            setQuizData(updatedData);
            setShowEditModal(false);
            alert('✅ تم التحديث بنجاح!');
        } catch (err) {
            console.error(err);
            alert('❌ فشل التحديث.');
        } finally {
            setIsSaving(false);
        }
    };

    const openEditModal = () => {
        setEditQuestion(currentQuestion.question);
        setEditOptions(currentQuestion.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })));
        setEditImageFile(null);
        setEditPreviewUrl(currentQuestion.image);
        setShowEditModal(true);
    };

    const handleAnswerClick = (idx) => {
        if (!showAnswer && !isLocked) setSelectedAnswer(idx);
    };

    const handleReveal = () => {
        if (selectedAnswer === null || showAnswer || isLocked) return;

        // Save the answer choice
        const isCorrect = currentQuestion.options[selectedAnswer].isCorrect;
        const newHistory = [...userAnswersHistory];
        newHistory[currentQuestionIndex] = isCorrect;
        setUserAnswersHistory(newHistory);

        const newChoices = [...userChoices];
        newChoices[currentQuestionIndex] = selectedAnswer;
        setUserChoices(newChoices);

        // Move to next or finish
        if (currentQuestionIndex < visibleCount - 1) {
            navigateTo(currentQuestionIndex + 1, false);
        } else {
            setIsExamFinished(true);
        }
    };

    const navigateTo = (idx, fromManual = true) => {
        if (isReviewMode) {
            // Find current position in reviewIndices
            const currentReviewIdx = reviewIndices.indexOf(currentQuestionIndex);
            let nextReviewIdx = -1;

            if (idx > currentQuestionIndex) {
                // Moving forward
                if (currentReviewIdx < reviewIndices.length - 1) {
                    nextReviewIdx = reviewIndices[currentReviewIdx + 1];
                }
            } else if (idx < currentQuestionIndex) {
                // Moving backward
                if (currentReviewIdx > 0) {
                    nextReviewIdx = reviewIndices[currentReviewIdx - 1];
                }
            }

            if (nextReviewIdx !== -1) {
                setCurrentQuestionIndex(nextReviewIdx);
                setTimeLeft(50);
                setImageLoading(true);
                setSelectedAnswer(userChoices[nextReviewIdx]);
                setShowAnswer(true);
            }
            return;
        }

        if (idx < 0 || idx >= totalQuestions) return;
        if (!isSubscribed && idx >= FREE_TRIAL_LIMIT) return;

        // If passing without answer MANUALLY, mark as wrong
        if (fromManual && !isReviewMode && !isExamFinished && userAnswersHistory[currentQuestionIndex] === null) {
            const newHistory = [...userAnswersHistory];
            newHistory[currentQuestionIndex] = false;
            setUserAnswersHistory(newHistory);
        }

        setCurrentQuestionIndex(idx);
        setTimeLeft(50); // Reset timer immediately upon navigation
        setImageLoading(true);
        
        const status = userAnswersHistory[idx];
        if (status !== null) {
            const correctIdx = quizData[idx].options.findIndex(o => o.isCorrect);
            setSelectedAnswer(correctIdx);
            setShowAnswer(true);
        } else {
            setSelectedAnswer(null);
            setShowAnswer(false);
        }
    };

    const correctCount = userAnswersHistory.filter(h => h === true).length;
    const answeredCount = userAnswersHistory.filter(h => h !== null).length;

    if (loading) {
        return (
            <div className='serie-classic-wrapper' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#3b5998', textAlign: 'center' }}>
                    جاري تجهيز الاختبار الشامل...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='serie-classic-wrapper' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#f43f5e' }}>{error}</div>
            </div>
        );
    }

    const selectedLetter = selectedAnswer !== null ? ['أ', 'ب', 'ج'][selectedAnswer] : '?';

    if (isExamFinished) {
        return (
            <div className="exam-results-page" style={{ backgroundImage: `url(${bg})` }}>
                <div className="custom-results-card">
                    <div className={`score-main-value ${correctCount >= 24 ? 'status-pass' : 'status-fail'}`}>
                        {correctCount}
                    </div>
                    <div className="score-separator-yellow"></div>
                    <div className="score-total-value">
                        {totalQuestions}
                    </div>

                    <div className={`exam-status-text ${correctCount >= 24 ? 'status-pass' : 'status-fail'}`}>
                        {correctCount >= 24 ? 'مقبول' : 'مؤجل'}
                    </div>

                    <div className="custom-results-actions">
                        <button className="btn-custom-result restart-yellow" onClick={() => window.location.reload()}>إعادة المحاولة</button>
                        <button className="btn-custom-result correction-blue" onClick={() => {
                            const wrongs = userAnswersHistory
                                .map((status, idx) => status === false ? idx : null)
                                .filter(idx => idx !== null);
                            
                            if (wrongs.length > 0) {
                                setReviewIndices(wrongs);
                                setIsExamFinished(false);
                                setIsReviewMode(true);
                                setCurrentQuestionIndex(wrongs[0]);
                                setSelectedAnswer(userChoices[wrongs[0]]);
                                setShowAnswer(true);
                            } else {
                                alert("لم تقم بأي أخطاء! أحسنت.");
                            }
                        }}>إصلاح</button>
                        <button className="btn-custom-result exit-white" onClick={() => navigate(-1)}>خروج</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="serie-classic-wrapper">
            <div className="classic-top-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button className="btn-classic-back" onClick={() => navigate(-1)}>
                        <ChevronRight size={18} /> رجوع
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>الاختبار الشامل - فئة {category1}</span>
                </div>
                <span style={{ fontWeight: 'bold' }}>codedelaroute.tn</span>
            </div>

            {showEditModal && (
                <div className="overlay-premium" style={{ opacity: 1, zIndex: 2000, overflowY: 'auto', padding: '20px' }}>
                    <div className="reveal-anim" style={{ background: 'white', width: '90%', maxWidth: '800px', border: '1px solid #3b5998', borderRadius: '12px', padding: '25px', position: 'relative' }}>
                        <button style={{ position: 'absolute', top: '15px', left: '15px', background: 'none', border: 'none', color: '#3b5998', cursor: 'pointer' }} onClick={() => setShowEditModal(false)}>
                            <X size={28} />
                        </button>
                        <h2 style={{ fontSize: '22px', marginBottom: '25px', color: '#3b5998', textAlign: 'center' }}>🛠️ تعديل محتوى السؤال</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="classic-edit-row">
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#3b5998' }}>السؤال</label>
                                    <textarea
                                        value={editQuestion}
                                        onChange={(e) => setEditQuestion(e.target.value)}
                                        rows="3"
                                        style={{ width: '100%', border: '1px solid #ccc', borderRadius: '8px', padding: '12px', fontSize: '16px' }}
                                    />
                                </div>
                                <div style={{ width: '200px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#3b5998' }}>الصورة الحالية</label>
                                    <div style={{ width: '100%', height: '120px', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {editPreviewUrl ? <img src={editPreviewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span>لا توجد صورة</span>}
                                    </div>
                                    <label style={{ display: 'block', marginTop: '10px', fontSize: '12px', color: '#3b5998', cursor: 'pointer', textDecoration: 'underline' }}>
                                        تغيير الصورة
                                        <input type="file" hidden onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setEditImageFile(file);
                                                setEditPreviewUrl(URL.createObjectURL(file));
                                            }
                                        }} />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <label style={{ margin: 0, fontWeight: 700, color: '#3b5998' }}>خيارات الإجابة (حدد الإجابة الصحيحة)</label>
                                    <button
                                        type="button"
                                        onClick={handleAddOption}
                                        style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', fontSize: '14px', cursor: 'pointer' }}
                                    >
                                        ➕ إضافة خيار
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {editOptions.map((opt, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="radio"
                                                name="correctIndexFull"
                                                checked={opt.isCorrect}
                                                onChange={() => setEditOptions(editOptions.map((o, idx) => ({ ...o, isCorrect: idx === i })))}
                                                title="اجعل هذا الخيار هو الإجابة الصحيحة"
                                            />
                                            <span style={{ minWidth: '30px', fontWeight: 'bold', color: opt.isCorrect ? '#10b981' : '#f43f5e' }}>
                                                {['أ', 'ب', 'ج', 'د', 'هـ', 'و'][i] || i + 1}
                                            </span>
                                            <input
                                                type="text"
                                                value={opt.text}
                                                onChange={(e) => {
                                                    const newOpts = [...editOptions];
                                                    newOpts[i].text = e.target.value;
                                                    setEditOptions(newOpts);
                                                }}
                                                style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '8px', borderRight: opt.isCorrect ? '4px solid #10b981' : '4px solid #f43f5e' }}
                                                placeholder={opt.isCorrect ? 'الإجابة الصحيحة...' : 'إجابة خاطئة...'}
                                            />
                                            {editOptions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveOption(i)}
                                                    style={{ background: '#f43f5e', color: 'white', border: 'none', borderRadius: '4px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button className="btn-classic" onClick={handleSaveEdit} disabled={isSaving} style={{ background: '#3b5998', color: 'white', padding: '15px', marginTop: '10px', fontSize: '18px' }}>
                                {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات ✅'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="classic-main-container">
                <div className="classic-blue-section">
                    {/* Numbers sidebar (Visual Right in RTL, last in JSX) */}
                    {/* Right side Metadata (stacked on desktop, split on mobile via CSS) */}
                    <div className="classic-right-meta-sidebar">
                        {/* Question Number */}
                        <div className="classic-qnum-sidebar">
                            <div className="classic-question-number-display">
                                {/* Flag added here inside the display container */}
                                <img 
                                    src="https://www.atlas-monde.net/wp-content/uploads/2017/03/drapeau-tunisie.png" 
                                    alt="Tunisia Flag" 
                                    style={{ width: '35px', marginBottom: '8px', borderRadius: '2px' }}
                                />
                                <div className="q-label-ar">السؤال عدد</div>
                                <div className="q-number-box">
                                    {currentQuestionIndex + 1}
                                </div>
                            </div>
                        </div>

                        {/* Timer */}
                        <div className="classic-timer-sidebar">
                            <div className="classic-timer-wrapper">
                                <div className="classic-timer-bar-container">
                                    {[...Array(50)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`classic-timer-segment ${i < timeLeft ? 'active' : ''}`}
                                        />
                                    ))}
                                </div>
                                <div className="classic-timer-number">
                                    {timeLeft}
                                </div>
                                <div className="classic-timer-text">Chronomètre</div>
                            </div>
                        </div>
                    </div>

                    {/* Middle (Image) */}
                    <div className="classic-image-container">
                        {isLocked ? (
                            <div style={{ textAlign: 'center', color: '#3b5998' }}>
                                <Lock size={80} />
                                <h3 style={{ marginTop: '20px' }}>العرض المحدود</h3>
                                <button className="btn-classic" onClick={() => navigate('/subscriptions')} style={{ marginTop: '20px' }}>اشترك الآن لفتح الاختبار</button>
                            </div>
                        ) : (
                            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                                {imageLoading && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: '#f9f9f9', zIndex: 10, fontSize: '18px', color: '#3b5998'
                                    }}>
                                        جاري تحميل الصورة...
                                    </div>
                                )}
                                <img
                                    key={currentQuestion.image}
                                    src={currentQuestion.image}
                                    onLoad={() => setImageLoading(false)}
                                    alt="Exam"
                                />
                            </div>
                        )}
                    </div>

                    {/* Answer Box (Visual Left in RTL, first in JSX) */}
                    <div className="classic-answer-sidebar">
                        <h4>اجابتك هي</h4>
                        <div className="classic-answer-box" style={{
                            backgroundColor: selectedAnswer === 0 ? '#ff5252' : // Red
                                            selectedAnswer === 1 ? '#ffd740' : // Yellow
                                            selectedAnswer === 2 ? '#69f0ae' : // Green
                                            '#fff',
                            color: (selectedAnswer === 1) ? '#000' : // Black text for yellow
                                   (selectedAnswer !== null) ? '#fff' : '#3b5998', // White for others, blue for ?
                            transition: 'all 0.3s ease'
                        }}>
                            {selectedLetter}
                        </div>
                        <div className="classic-metadata">
                        </div>
                    </div>
                </div>

                <div className="classic-bottom-section">
                    {!isLocked && (
                        <div className="classic-question-area">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', justifyContent: 'center' }}>
                                <div style={{
                                    background: '#3b5998',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                }}>
                                    فئة السؤال: {currentQuestion?.category1} {currentQuestion?.category2 ? `(${currentQuestion.category2})` : ''}
                                </div>
                                <button
                                    onClick={openEditModal}
                                    className="btn-edit-classic"
                                    style={{ margin: 0 }}
                                >
                                    تعديل السؤال
                                </button>
                                <button
                                    onClick={() => navigate(`/formation?category=${encodeURIComponent(category1)}`)}
                                    className="btn-edit-classic"
                                    style={{ margin: 0, background: '#10b981', color: 'white' }}
                                >
                                    تكوين
                                </button>
                            </div>
                            <h1 className="classic-question-text">{currentQuestion.question}</h1>

                            <div className="classic-options-container">
                                {currentQuestion.options.map((opt, i) => {
                                    const isCorrect = opt.isCorrect;
                                    const isUserChoice = userChoices[currentQuestionIndex] === i;
                                    
                                    let optionBoxClass = "";
                                    if (isReviewMode) {
                                        if (isCorrect) optionBoxClass = "review-correct-box";
                                        else if (isUserChoice && !isCorrect) optionBoxClass = "review-incorrect-box";
                                    } else if (selectedAnswer === i) {
                                        optionBoxClass = "option-selected-box";
                                    }

                                    return (
                                        <div key={i} className={`classic-option-item`} onClick={() => !isReviewMode && handleAnswerClick(i)}>
                                            <div className={`classic-option-box ${['option-a', 'option-b', 'option-c'][i]} ${optionBoxClass}`}>
                                                {['أ', 'ب', 'ج'][i]}
                                            </div>
                                            <div className="classic-option-text" style={
                                                isReviewMode 
                                                    ? (isCorrect ? { color: '#10b981' } : (isUserChoice ? { color: '#f43f5e' } : {}))
                                                    : (selectedAnswer === i ? { color: '#3b5998', textDecoration: 'underline' } : {})
                                            }>
                                                {opt.text}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="classic-controls-wrapper">
                        <div className="classic-controls">
                            {isReviewMode && (
                                <button 
                                    className="btn-classic" 
                                    onClick={() => navigateTo(currentQuestionIndex - 1)} 
                                    disabled={reviewIndices.indexOf(currentQuestionIndex) === 0}
                                >
                                    <ChevronRight size={24} />
                                </button>
                            )}

                            {!showAnswer && !isLocked && (
                                <button className="btn-classic" onClick={handleReveal} disabled={selectedAnswer === null} style={{ background: '#3b5998', color: 'white', borderColor: '#3b5998' }}>
                                    تأكيد الإجابة
                                </button>
                            )}

                            <button 
                                className="btn-classic" 
                                onClick={() => navigateTo(currentQuestionIndex + 1)} 
                                disabled={isReviewMode ? reviewIndices.indexOf(currentQuestionIndex) >= reviewIndices.length - 1 : currentQuestionIndex >= visibleCount - 1}
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
