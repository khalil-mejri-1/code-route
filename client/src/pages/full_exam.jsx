import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../comp/navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
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
import './Serie.css';

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
            <div className='serie-page-wrapper' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className='reveal-anim' style={{ fontSize: '24px', fontWeight: 800, color: 'var(--secondary)', textAlign: 'center' }}>
                    <Trophy size={48} style={{ marginBottom: '20px', display: 'block', margin: '0 auto 20px' }} />
                    جاري تجهيز الاختبار الشامل...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='serie-page-wrapper' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#f43f5e' }}>{error}</div>
            </div>
        );
    }

    return (
        <div className="serie-page-wrapper">
            <Navbar />
            <div className="serie-layout">
                {/* Sidebar */}
                <aside className="serie-sidebar reveal-anim">
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{ display: 'inline-flex', padding: '15px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', marginBottom: '15px' }}>
                            <Trophy size={32} />
                        </div>
                        <h3 style={{ fontSize: '22px', fontWeight: 800 }}>الاختبار الشامل</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '6px' }}>
                            فئة {category1} {category2 ? ` — ${category2}` : ''} <br/> ({totalQuestions} سؤال)
                            {examSerieParam && (
                                <>
                                    <br />
                                    <span style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '8px', display: 'inline-block' }}>
                                        السلسلة المدمجة: {examSerieParam} من امتحانات
                                    </span>
                                </>
                            )}
                            {currentQuestion && currentQuestion.category1 !== 'امتحانات' && examSerieParam && (
                                <>
                                    <br />
                                    <span style={{ color: '#10b981', fontWeight: 700, marginTop: '8px', display: 'inline-block' }}>
                                        هذا السؤال من فئة: {currentQuestion.category1} (سلسلة {currentQuestion.nb_serie})
                                    </span>
                                </>
                            )}
                        </p>
                    </div>

                    {/* Progress */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>الصحيحة</span>
                            <span style={{ fontWeight: 800, color: '#10b981' }}>{correctCount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>تمت الإجابة</span>
                            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{answeredCount} / {totalQuestions}</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--bg-darker)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(answeredCount / totalQuestions) * 100}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))', transition: 'width 0.5s ease' }}></div>
                        </div>
                    </div>

                    {/* Question Grid */}
                    <div className="lesson-grid-premium" ref={scrollRef}>
                        {quizData.map((_, i) => {
                            const locked = !isSubscribed && i >= FREE_TRIAL_LIMIT;
                            const h = userAnswersHistory[i];
                            return (
                                <button
                                    key={i}
                                    className={`lesson-btn-premium ${i === currentQuestionIndex ? 'active' : ''} ${locked ? 'locked' : ''}`}
                                    onClick={() => navigateTo(i)}
                                    disabled={locked}
                                    style={h !== null ? {
                                        background: h ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                                        color: h ? '#10b981' : '#f43f5e',
                                        borderColor: h ? '#10b981' : '#f43f5e'
                                    } : {}}
                                >
                                    {locked ? <Lock size={12} /> : i + 1}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="question-content-premium reveal-anim">
                    <div className="question-container-premium">
                        {isLocked ? (
                            <div style={{ textAlign: 'center', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                                <Lock size={64} color="var(--primary)" />
                                <h1 style={{ fontSize: '36px' }}>نهاية العرض التجريبي</h1>
                                <p className='hero-desc'>لقد أجبت على {FREE_TRIAL_LIMIT} أسئلة مجانية من الاختبار الشامل. اشترك الآن للوصول إلى كامل الأسئلة.</p>
                                <button className='btn-premium' onClick={() => navigate('/subscriptions')}>إشترك الآن</button>
                            </div>
                        ) : (
                            <>
                                {/* Category tag */}
                                {currentQuestion.category2 && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <span className="badge-new" style={{ fontSize: '12px', padding: '6px 14px' }}>
                                            {currentQuestion.category2}
                                        </span>
                                    </div>
                                )}

                                <div className="q-image-wrapper">
                                    <img src={currentQuestion.image} alt="Exam" />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <Target size={24} color="var(--secondary)" />
                                    <h1 className="q-text-premium" style={{ marginBottom: 0 }}>{currentQuestion.question}</h1>
                                </div>

                                <div className="options-stack">
                                    {currentQuestion.options.map((opt, i) => (
                                        <div
                                            key={i}
                                            className={`option-card-premium 
                                                ${showAnswer && opt.isCorrect ? 'correct' : ''} 
                                                ${showAnswer && !opt.isCorrect && selectedAnswer === i ? 'incorrect' : ''} 
                                                ${!showAnswer && selectedAnswer === i ? 'selected' : ''}`}
                                            onClick={() => handleAnswerClick(i)}
                                            style={{ cursor: showAnswer ? 'default' : 'pointer' }}
                                        >
                                            <div className="opt-letter-premium">{['أ', 'ب', 'ج'][i]}</div>
                                            <div style={{ flexGrow: 1, fontSize: '18px', fontWeight: 600 }}>{opt.text}</div>
                                            {showAnswer && opt.isCorrect && <CheckCircle color="#10b981" />}
                                            {showAnswer && !opt.isCorrect && selectedAnswer === i && <XCircle color="#f43f5e" />}
                                        </div>
                                    ))}
                                </div>

                                {!showAnswer && (
                                    <button
                                        className="btn-premium"
                                        onClick={handleReveal}
                                        disabled={selectedAnswer === null}
                                        style={{ width: '100%', marginTop: '20px' }}
                                    >
                                        تأكيد الإجابة
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <div className="quiz-nav-premium">
                        <button className="signup-button" onClick={() => navigateTo(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0}>
                            <ChevronRight /> السابق
                        </button>
                        <span style={{ color: 'var(--text-gray)', fontSize: '14px', fontWeight: 700 }}>
                            {currentQuestionIndex + 1} / {visibleCount}
                        </span>
                        <button className="btn-premium" onClick={() => navigateTo(currentQuestionIndex + 1)} disabled={currentQuestionIndex >= visibleCount - 1}>
                            التالي <ChevronLeft />
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
