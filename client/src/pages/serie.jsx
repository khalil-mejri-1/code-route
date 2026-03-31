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
  Trash2, 
  Edit3, 
  Trophy,
  ArrowRight,
  FileText,
  UploadCloud,
  Check,
  X
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

export default function Serie() {
    const location = useLocation();
    const navigate = useNavigate();
    const scrollRef = useRef(null);

    const [quizData, setQuizData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showEditModal, setShowEditModal] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const [deleteMode, setDeleteMode] = useState(false);
    const [selectedIndices, setSelectedIndices] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    const [editInputText, setEditInputText] = useState('');
    const [editOutputText, setEditOutputText] = useState('');
    const [editImageFile, setEditImageFile] = useState(null);
    const [editPreviewUrl, setEditPreviewUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const statusMessage = '';

    const isSubscribed = localStorage.getItem('subscriptions') === 'true';
    const currentQuestion = quizData[currentQuestionIndex];
    const totalQuestions = quizData.length;
    const visibleLessonCount = isSubscribed ? totalQuestions : FREE_TRIAL_LIMIT;

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
                    setImageLoading(true);
                    setDeleteMode(false);
                    setSelectedIndices([]);
                } else {
                    setQuizData([]);
                    setError(`لم يتم العثور على دروس للفئة المحددة.`);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setError('فشل جلب البيانات. تأكد من اتصال الخادم.');
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [location.search]);

    const handleNext = () => {
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
        if (deleteMode) {
            if (selectedIndices.includes(index)) {
                setSelectedIndices(selectedIndices.filter(i => i !== index));
            } else {
                setSelectedIndices([...selectedIndices, index]);
            }
        } else {
            if (index >= 0 && index < visibleLessonCount) {
                setImageLoading(true);
                setCurrentQuestionIndex(index);
            }
        }
    };

    const handleBatchDelete = async () => {
        if (selectedIndices.length === 0) return alert('يرجى اختيار درس للحذف.');
        if (!window.confirm(`⚠️ هل أنت متأكد من حذف ${selectedIndices.length} درس؟`)) return;

        setIsDeleting(true);
        try {
            const idsToDelete = selectedIndices.map(idx => quizData[idx]._id);
            await axios.post(`${API_BASE_URL}/questions/batch-delete`, { ids: idsToDelete });
            alert(`✅ تم الحذف بنجاح!`);
            const updatedData = quizData.filter((_, idx) => !selectedIndices.includes(idx));
            setQuizData(updatedData);
            setSelectedIndices([]);
            setDeleteMode(false);
            if (currentQuestionIndex >= updatedData.length) {
                setCurrentQuestionIndex(Math.max(0, updatedData.length - 1));
            }
        } catch (err) {
            console.error('Batch Delete Error:', err);
            alert('❌ فشل الحذف الجماعي.');
        } finally {
            setIsDeleting(false);
        }
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
        const lines = editOutputText.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 2) return alert('برجاء تزويد السؤال وإجابة واحدة على الأقل.');

        setIsSaving(true);
        try {
            let imageUrl = currentQuestion.image;
            if (editImageFile) imageUrl = await uploadToImgBB(editImageFile);
            const questionText = lines[0];
            const options = lines.slice(1).map((text, idx) => ({ text, isCorrect: idx === 0 }));

            await axios.put(`${API_BASE_URL}/questions/${currentQuestion._id}`, {
                question: questionText,
                options: options,
                image: imageUrl
            });

            const updatedData = [...quizData];
            updatedData[currentQuestionIndex] = { ...currentQuestion, question: questionText, options: options, image: imageUrl };
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

    if (loading) {
        return (
            <div className='serie-page-wrapper' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="reveal-anim" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>جاري تحميل الدروس... ✨</div>
            </div>
        );
    }

    if (error || totalQuestions === 0) {
        return (
            <div className='serie-page-wrapper' style={{ textAlign: 'center', color: '#f43f5e', padding: '100px' }}>
                <XCircle size={60} style={{ marginBottom: '20px' }} />
                <h2>{error || 'لا توجد دروس متاحة.'}</h2>
                <button className='btn-premium-sm' onClick={() => navigate('/cours')} style={{ marginTop: '20px' }}>العودة للدروس</button>
            </div>
        );
    }

    const { category1: mainCategory, category2: currentTopic } = parseCategoryParam(new URLSearchParams(location.search).get('category') || '');
    const isCurrentLessonLocked = !isSubscribed && currentQuestionIndex >= FREE_TRIAL_LIMIT;

    return (
        <div className="serie-page-wrapper">
            <Navbar />
            
            {showEditModal && (
                <div className="overlay-premium" style={{ opacity: 1, zIndex: 2000, overflowY: 'auto', padding: '20px' }}>
                    <div className="reveal-anim" style={{ background: 'var(--bg-darker)', width: '90%', maxWidth: '800px', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-2xl)', padding: '50px', position: 'relative' }}>
                        <button style={{ position: 'absolute', top: '30px', left: '30px', background: 'none', border: 'none', color: 'white' }} onClick={() => setShowEditModal(false)}>
                            <X size={32} />
                        </button>
                        <h2 style={{ fontSize: '32px', marginBottom: '40px' }}>🛠️ تعديل الدرس</h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 700 }}>محتوى الدرس (السؤال ثم الإجابة الصحيحة ثم الخاطئة)</label>
                                <textarea 
                                    value={editOutputText} 
                                    onChange={(e) => setEditOutputText(e.target.value)}
                                    rows="8"
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px', padding: '20px', fontSize: '16px', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 700 }}>تعديل الصورة</label>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                                    <UploadCloud size={24} color="var(--primary)" />
                                    <span>{editImageFile ? editImageFile.name : 'اختر صورة جديدة...'}</span>
                                    <input type="file" hidden onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setEditImageFile(e.target.files[0]);
                                            setEditPreviewUrl(URL.createObjectURL(e.target.files[0]));
                                        }
                                    }} />
                                </label>
                            </div>

                            <button className="btn-premium" onClick={handleSaveEdit} disabled={isSaving}>
                                {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات ✅'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="serie-layout">
                {/* Sidebar */}
                <aside className="serie-sidebar reveal-anim">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 800 }}>قائمة الدروس</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setDeleteMode(!deleteMode)} style={{ background: 'none', border: 'none', color: deleteMode ? '#f43f5e' : 'var(--text-gray)', cursor: 'pointer' }}>
                                <Trash2 size={18} />
                            </button>
                            <button onClick={() => {
                                const correctOpt = currentQuestion.options.find(o => o.isCorrect);
                                const incorrectOpts = currentQuestion.options.filter(o => !o.isCorrect);
                                setEditOutputText([currentQuestion.question, correctOpt?.text || '', ...incorrectOpts.map(o => o.text)].join('\n'));
                                setEditImageFile(null);
                                setEditPreviewUrl(currentQuestion.image);
                                setShowEditModal(true);
                            }} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}>
                                <Edit3 size={18} />
                            </button>
                        </div>
                    </div>

                    {deleteMode && (
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                             <button className="btn-premium-sm" onClick={handleBatchDelete} style={{ flex: 1, background: '#f43f5e', fontSize: '12px' }}>حذف المختار ({selectedIndices.length})</button>
                             <button className="signup-button" onClick={() => setDeleteMode(false)} style={{ flex: 1, fontSize: '12px' }}>إلغاء</button>
                        </div>
                    )}

                    <div className="lesson-grid-premium" ref={scrollRef}>
                        {quizData.map((_, i) => {
                            const isLocked = !isSubscribed && i >= FREE_TRIAL_LIMIT;
                            return (
                                <button
                                    key={i}
                                    className={`lesson-btn-premium ${i === currentQuestionIndex ? 'active' : ''} ${isLocked ? 'locked' : ''} ${selectedIndices.includes(i) ? 'selected' : ''}`}
                                    onClick={() => handleJumpToQuestion(i)}
                                    disabled={!deleteMode && isLocked}
                                >
                                    {isLocked ? <Lock size={12} /> : i + 1}
                                </button>
                            )
                        })}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-gray)', fontSize: '14px' }}>
                            <Trophy size={20} color="var(--primary)" />
                            <span>سلسلة: {new URLSearchParams(location.search).get('nb_serie') || '1'}</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="question-content-premium reveal-anim" style={{ animationDelay: '0.1s' }}>
                    <div className="question-container-premium">
                        {isCurrentLessonLocked ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                                <div style={{ width: '100px', height: '100px', background: 'var(--bg-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <Lock size={48} />
                                </div>
                                <h2 style={{ fontSize: '32px' }}>الدرس محجوب</h2>
                                <p className="hero-desc">لقد وصلت للحد الأقصى للدروس المجانية. اشترك لتفتح هذا الدرس وأكثر من 1000 درس آخر.</p>
                                <button className="btn-premium" onClick={() => navigate('/subscriptions')}>اشترك واستمتع بالكامل</button>
                            </div>
                        ) : (
                            <>
                                <div className="q-image-wrapper">
                                    <img src={currentQuestion.image} alt="Question" />
                                    {imageLoading && <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-darker)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>جاري التحميل...</div>}
                                </div>

                                <h1 className="q-text-premium">{currentQuestion.question}</h1>

                                <div className="options-stack">
                                    {currentQuestion.options.map((opt, i) => (
                                        <div key={i} className={`option-card-premium ${opt.isCorrect ? 'correct' : 'incorrect'}`}>
                                            <div className="opt-letter-premium">{['أ', 'ب', 'ج'][i]}</div>
                                            <div style={{ flexGrow: 1, fontSize: '20px', fontWeight: 600 }}>{opt.text}</div>
                                            {opt.isCorrect ? <CheckCircle color="#10b981" /> : <XCircle color="#f43f5e" opacity={0.5} />}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="quiz-nav-premium">
                        <button className="signup-button" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', padding: '16px 32px' }} onClick={handlePrev} disabled={currentQuestionIndex === 0}>
                            <ChevronRight /> الدرس السابق
                        </button>
                        <button className="btn-premium" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', padding: '16px 32px' }} onClick={handleNext} disabled={currentQuestionIndex >= visibleLessonCount - 1}>
                            التالي <ChevronLeft />
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}