import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, IMGBB_API_KEY, IMGBB_UPLOAD_URL } from '../config';
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
    Target,
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
    const [editQuestion, setEditQuestion] = useState('');
    const [editOptions, setEditOptions] = useState(['', '', '']);
    const [editImageFile, setEditImageFile] = useState(null);
    const [editPreviewUrl, setEditPreviewUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

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

    const totalQuestions = quizData.length;
    const visibleCount = isSubscribed ? totalQuestions : Math.min(totalQuestions, FREE_TRIAL_LIMIT);
    const isLocked = !isSubscribed && currentQuestionIndex >= FREE_TRIAL_LIMIT;
    const currentQuestion = quizData[currentQuestionIndex];

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
        if (!editQuestion.trim() || editOptions.some(o => !o.trim())) {
            return alert('برجاء تزويد السؤال وجميع الخيارات.');
        }

        setIsSaving(true);
        try {
            let imageUrl = currentQuestion.image;
            if (editImageFile) imageUrl = await uploadToImgBB(editImageFile);
            
            const options = editOptions.map((text, idx) => ({ text, isCorrect: idx === 0 }));

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
        setEditOptions(currentQuestion.options.map(o => o.text));
        setEditImageFile(null);
        setEditPreviewUrl(currentQuestion.image);
        setShowEditModal(true);
    };

    const handleAnswerClick = (idx) => {
        if (!showAnswer && !isLocked) setSelectedAnswer(idx);
    };

    const handleReveal = () => {
        if (selectedAnswer === null || showAnswer || isLocked) return;
        const isCorrect = currentQuestion.options[selectedAnswer].isCorrect;
        const newHistory = [...userAnswersHistory];
        newHistory[currentQuestionIndex] = isCorrect;
        setUserAnswersHistory(newHistory);
        setShowAnswer(true);
    };

    const navigateTo = (idx) => {
        if (idx < 0 || idx >= totalQuestions) return;
        if (!isSubscribed && idx >= FREE_TRIAL_LIMIT) return;
        setCurrentQuestionIndex(idx);
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

    return (
        <div className="serie-classic-wrapper">
            <div className="classic-top-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button className="btn-classic-back" onClick={() => navigate(-1)}>
                        <ChevronRight size={18} /> رجوع
                    </button>
                    <span>الاختبار الشامل - فئة {category1}</span>
                </div>
                <span style={{ fontWeight: 'bold' }}>codedelaroute.tn</span>
                <span>{answeredCount} / {totalQuestions} سؤال</span>
            </div>

            {showEditModal && (
                <div className="overlay-premium" style={{ opacity: 1, zIndex: 2000, overflowY: 'auto', padding: '20px' }}>
                    <div className="reveal-anim" style={{ background: 'white', width: '90%', maxWidth: '800px', border: '1px solid #3b5998', borderRadius: '12px', padding: '40px', position: 'relative' }}>
                        <button style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: '#3b5998', cursor: 'pointer' }} onClick={() => setShowEditModal(false)}>
                            <X size={32} />
                        </button>
                        <h2 style={{ fontSize: '28px', marginBottom: '30px', color: '#3b5998', textAlign: 'center' }}>🛠️ تعديل محتوى السؤال</h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
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
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 700, color: '#3b5998' }}>الخيارات (الخيار الأول هو الصحيح)</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {editOptions.map((opt, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ minWidth: '30px', fontWeight: 'bold', color: i === 0 ? '#10b981' : '#f43f5e' }}>{['أ', 'ب', 'ج'][i]}</span>
                                            <input 
                                                type="text"
                                                value={opt}
                                                onChange={(e) => {
                                                    const newOpts = [...editOptions];
                                                    newOpts[i] = e.target.value;
                                                    setEditOptions(newOpts);
                                                }}
                                                style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '8px', borderRight: i === 0 ? '4px solid #10b981' : '4px solid #f43f5e' }}
                                                placeholder={i === 0 ? 'الإجابة الصحيحة...' : 'إجابة خاطئة...'}
                                            />
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
                    <div className="classic-numbers-sidebar">
                        <div className="classic-numbers-header">أسئلة الاختبار</div>
                        <div className="classic-numbers-grid" ref={scrollRef}>
                            {quizData.map((_, i) => {
                                const h = userAnswersHistory[i];
                                const locked = !isSubscribed && i >= FREE_TRIAL_LIMIT;
                                return (
                                    <div
                                        key={i}
                                        className={`classic-number-row ${i === currentQuestionIndex ? 'active' : ''}`}
                                        onClick={() => !locked && navigateTo(i)}
                                        style={h !== null ? { color: h ? '#10b981' : '#f43f5e', fontWeight: 'bold' } : locked ? { opacity: 0.3 } : {}}
                                    >
                                        <span>{i + 1}</span>
                                        {locked && <Lock size={10} />}
                                    </div>
                                );
                            })}
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
                                <img src={currentQuestion.image} alt="Exam" />
                            </div>
                        )}
                    </div>

                    {/* Answer Box (Visual Left in RTL, first in JSX) */}
                    <div className="classic-answer-sidebar">
                        <h4>اجابتك هي</h4>
                        <p style={{ margin: '0 0 10px' }}>Votre réponse</p>
                        <div className="classic-answer-box">
                            {selectedLetter}
                        </div>
                        <div className="classic-metadata">
                            <p className="category-label">{category2 || 'اختبار شامل'}</p>
                            <p style={{ color: '#10b981', fontWeight: 'bold' }}>الصح: {correctCount}</p>
                            <button 
                                onClick={openEditModal} 
                                className="btn-edit-classic"
                            >
                                تعديل السؤال
                            </button>
                        </div>
                    </div>
                </div>

                <div className="classic-bottom-section">
                    {!isLocked && (
                        <div className="classic-question-area">
                            <h1 className="classic-question-text">{currentQuestion.question}</h1>
                            
                            <div className="classic-options-container">
                                {currentQuestion.options.map((opt, i) => (
                                    <div key={i} className={`classic-option-item ${showAnswer && opt.isCorrect ? 'option-correct' : ''}`} onClick={() => handleAnswerClick(i)}>
                                        <div className={`classic-option-box ${['option-a', 'option-b', 'option-c'][i]}`}>
                                            {['أ', 'ب', 'ج'][i]}
                                        </div>
                                        <div className="classic-option-text" style={showAnswer && opt.isCorrect ? { color: '#10b981' } : {}}>{opt.text}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="classic-controls-wrapper">
                        <div className="classic-controls">
                            <button className="btn-classic" onClick={() => navigateTo(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0}>
                                السابق
                            </button>
                            
                            {!showAnswer && !isLocked && (
                                <button className="btn-classic" onClick={handleReveal} disabled={selectedAnswer === null} style={{ background: '#3b5998', color: 'white', borderColor: '#3b5998' }}>
                                    تأكيد الإجابة
                                </button>
                            )}

                            <button className="btn-classic" onClick={() => navigateTo(currentQuestionIndex + 1)} disabled={currentQuestionIndex >= visibleCount - 1}>
                                التالي
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
