import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../comp/navbar';
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
  Trophy,
  Activity,
  Award,
  UploadCloud,
  X,
  Target
} from 'lucide-react';
import './Serie.css';

const API_URL = `${API_BASE_URL}/quiz/questions`;
const FREE_TRIAL_LIMIT = 3;

const parseCategoryParam = (param) => {
    if (!param) return { category1: '', category2: '' };
    const parts = param.split(' / ').map(p => p.trim()).filter(p => p.length > 0);
    let category1 = '', category2 = '';
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

    const [quizData, setQuizData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [userAnswersHistory, setUserAnswersHistory] = useState([]);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editQuestionText, setEditQuestionText] = useState('');
    const [editOptions, setEditOptions] = useState([]);
    const [editImageFile, setEditImageFile] = useState(null);
    const [editPreviewUrl, setEditPreviewUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const isSubscribed = localStorage.getItem('subscriptions') === 'true';

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
                    setUserAnswersHistory(Array(response.data.length).fill(null));
                } else {
                    setQuizData([]);
                    setError(`لم يتم العثور على أسئلة لهذا الاختبار.`);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setError('فشل جلب البيانات.');
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [location.search]);

    const totalQuestions = quizData.length;
    const visibleQuestionCount = isSubscribed ? totalQuestions : Math.min(totalQuestions, FREE_TRIAL_LIMIT);
    const isCurrentQuestionLocked = !isSubscribed && currentQuestionIndex >= FREE_TRIAL_LIMIT;
    const currentQuestion = quizData[currentQuestionIndex];

    const handleAnswerClick = (idx) => {
        if (!showAnswer && !isCurrentQuestionLocked) setSelectedAnswer(idx);
    };

    const handleRevealAnswer = () => {
        if (selectedAnswer === null || showAnswer || isCurrentQuestionLocked) return;
        const isCorrect = currentQuestion.options[selectedAnswer].isCorrect;
        const newHistory = [...userAnswersHistory];
        newHistory[currentQuestionIndex] = isCorrect;
        setUserAnswersHistory(newHistory);
        setShowAnswer(true);
    };

    const navigateToQuestion = (idx) => {
        if (idx >= 0 && idx < totalQuestions) {
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
        }
    };

    const uploadToImgBB = async (file) => {
        const base64 = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result.split(',')[1]);
            r.onerror = (e) => rej(e);
            r.readAsDataURL(file);
        });
        const p = new URLSearchParams(); p.append('image', base64);
        const res = await fetch(`${IMGBB_UPLOAD_URL}?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: p.toString()
        });
        const d = await res.json();
        if (d.success) return d.data.url;
        throw new Error('Upload failed');
    };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            let img = currentQuestion.image;
            if (editImageFile) img = await uploadToImgBB(editImageFile);
            await axios.put(`${API_BASE_URL}/questions/${currentQuestion._id}`, {
                question: editQuestionText,
                options: editOptions,
                image: img
            });
            const updated = [...quizData];
            updated[currentQuestionIndex] = { ...currentQuestion, question: editQuestionText, options: editOptions, image: img };
            setQuizData(updated);
            setShowEditModal(false);
        } catch (e) { console.error(e); alert('Error saving'); }
        finally { setIsSaving(false); }
    };

    if (loading) return <div className='serie-page-wrapper' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className='reveal-anim' style={{ fontSize: '24px', fontWeight: 800, color: 'var(--secondary)' }}>جاري تجهيز الاختبار المحاكي... 🏁</div></div>;
    
    const { category1: mainCategory, category2: currentTopic } = parseCategoryParam(new URLSearchParams(location.search).get('category') || '');
    const correctCount = userAnswersHistory.filter(h => h === true).length;

    return (
        <div className="serie-page-wrapper">
             <Navbar />
             {showEditModal && (
                <div className="overlay-premium" style={{ opacity: 1, zIndex: 2000 }}>
                    <div className="reveal-anim" style={{ background: 'var(--bg-darker)', width: '90%', maxWidth: '800px', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-2xl)', padding: '50px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                         <button style={{ position: 'absolute', top: '30px', left: '30px', background: 'none', border: 'none', color: 'white' }} onClick={() => setShowEditModal(false)}><X size={32} /></button>
                         <h2 style={{ fontSize: '32px', marginBottom: '32px' }}>🛠️ تعديل السؤال</h2>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                             <textarea value={editQuestionText} onChange={(e) => setEditQuestionText(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px', padding: '15px' }} rows="3" />
                             {editOptions.map((opt, i) => (
                                 <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                     <input type="radio" checked={opt.isCorrect} onChange={() => setEditOptions(editOptions.map((o, idx) => ({ ...o, isCorrect: idx === i })))} />
                                     <input value={opt.text} onChange={(e) => setEditOptions(editOptions.map((o, idx) => idx === i ? { ...o, text: e.target.value } : o))} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px', borderRadius: '8px' }} />
                                 </div>
                             ))}
                             <button className="btn-premium" onClick={handleSaveEdit} disabled={isSaving}>{isSaving ? 'جاري الحفظ...' : 'تحديث السؤال'}</button>
                         </div>
                    </div>
                </div>
             )}

             <div className="serie-layout">
                <aside className="serie-sidebar reveal-anim">
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{ display: 'inline-flex', padding: '15px', borderRadius: '50%', background: 'var(--bg-accent)', color: 'var(--primary)', marginBottom: '15px' }}>
                            <Award size={32} />
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: 800 }}>محاكي الاختبار</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>{mainCategory} - {currentTopic}</p>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text-gray)' }}>النتيجة الحالية</span>
                            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{correctCount} / {totalQuestions}</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--bg-darker)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(correctCount/totalQuestions)*100}%`, background: 'var(--primary)', transition: 'width 0.5s ease' }}></div>
                        </div>
                    </div>

                    <div className="lesson-grid-premium" ref={scrollRef}>
                        {quizData.map((_, i) => {
                            const isLocked = !isSubscribed && i >= FREE_TRIAL_LIMIT;
                            const h = userAnswersHistory[i];
                            return (
                                <button
                                    key={i}
                                    className={`lesson-btn-premium ${i === currentQuestionIndex ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                                    onClick={() => navigateToQuestion(i)}
                                    disabled={isLocked}
                                    style={h !== null ? { background: h ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)', color: h ? '#10b981' : '#f43f5e', borderColor: h ? '#10b981' : '#f43f5e' } : {}}
                                >
                                    {isLocked ? <Lock size={12} /> : i + 1}
                                </button>
                            );
                        })}
                    </div>

                    <button onClick={() => {
                        setEditQuestionText(currentQuestion.question);
                        setEditOptions(currentQuestion.options.map(o => ({ ...o })));
                        setEditPreviewUrl(currentQuestion.image);
                        setShowEditModal(true);
                    }} style={{ marginTop: 'auto', background: 'none', border: '1px solid var(--glass-border)', color: 'white', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
                        <Settings size={18} /> إعدادات السؤال
                    </button>
                </aside>

                <main className="question-content-premium reveal-anim">
                    <div className="question-container-premium">
                        {isCurrentQuestionLocked ? (
                            <div style={{ textAlign: 'center', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                                <Lock size={64} color="var(--primary)" />
                                <h1 style={{ fontSize: '36px' }}>نهاية العرض التجريبي</h1>
                                <p className='hero-desc'>لقد أكملت {FREE_TRIAL_LIMIT} أسئلة مجانية. اشترك الآن لفتح الاختبار كاملاً (40 سؤالاً) والحصول على تقييم شامل.</p>
                                <button className='btn-premium' onClick={() => navigate('/subscriptions')}>إشترك الآن للمتابعة</button>
                            </div>
                        ) : (
                            <>
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
                                            className={`option-card-premium ${showAnswer && opt.isCorrect ? 'correct' : ''} ${showAnswer && !opt.isCorrect && selectedAnswer === i ? 'incorrect' : ''} ${!showAnswer && selectedAnswer === i ? 'selected' : ''}`}
                                            onClick={() => handleAnswerClick(i)}
                                            style={{ cursor: showAnswer ? 'default' : 'pointer' }}
                                        >
                                            <div className="opt-letter-premium">{['أ', 'ب', 'ج'][i]}</div>
                                            <div style={{ flexGrow: 1, fontSize: '20px', fontWeight: 600 }}>{opt.text}</div>
                                            {showAnswer && opt.isCorrect && <CheckCircle color="#10b981" />}
                                            {showAnswer && !opt.isCorrect && selectedAnswer === i && <XCircle color="#f43f5e" />}
                                        </div>
                                    ))}
                                </div>
                                {!showAnswer && (
                                    <button className="btn-premium" onClick={handleRevealAnswer} disabled={selectedAnswer === null} style={{ width: '100%', marginTop: '20px' }}>تأكيد الإجابة</button>
                                )}
                            </>
                        )}
                    </div>
                    <div className="quiz-nav-premium">
                        <button className="signup-button" onClick={() => navigateToQuestion(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0}><ChevronRight /> السابق</button>
                        <button className="btn-premium" onClick={() => navigateToQuestion(currentQuestionIndex + 1)} disabled={currentQuestionIndex >= visibleQuestionCount - 1}>التالي <ChevronLeft /></button>
                    </div>
                </main>
             </div>
        </div>
    );
}