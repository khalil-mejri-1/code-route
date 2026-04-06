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
import './SerieClassic.css';

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

    const [selectedLetter, setSelectedLetter] = useState('?');
    const [deleteMode, setDeleteMode] = useState(false);
    const [selectedIndices, setSelectedIndices] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    const [editQuestion, setEditQuestion] = useState('');
    const [editOptions, setEditOptions] = useState(['', '', '']);
    const [editImageFile, setEditImageFile] = useState(null);
    const [editPreviewUrl, setEditPreviewUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

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
                    setSelectedLetter('?');
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

    useEffect(() => {
        if (quizData.length > 0) {
            quizData.forEach(q => {
                const img = new Image();
                img.src = q.image;
            });
        }
    }, [quizData]);

    useEffect(() => {
        if (currentQuestion) {
            const img = new Image();
            img.src = currentQuestion.image;
            if (img.complete) {
                setImageLoading(false);
            } else {
                setImageLoading(true);
                // Fallback: don't stay stuck forever
                const timer = setTimeout(() => setImageLoading(false), 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [currentQuestionIndex]);

    const handleNext = () => {
        if (currentQuestionIndex < visibleLessonCount - 1) {
            setImageLoading(true);
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedLetter('?');
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setImageLoading(true);
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setSelectedLetter('?');
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
                setSelectedLetter('?');
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

    if (loading) {
        return (
            <div className='serie-classic-wrapper' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#3b5998' }}>جاري تحميل الدروس... ✨</div>
            </div>
        );
    }

    if (error || totalQuestions === 0) {
        return (
            <div className='serie-classic-wrapper' style={{ textAlign: 'center', color: '#f43f5e', padding: '100px' }}>
                <XCircle size={60} style={{ marginBottom: '20px' }} />
                <h2>{error || 'لا توجد دروس متاحة.'}</h2>
                <button className='btn-classic' onClick={() => navigate('/cours')} style={{ marginTop: '20px' }}>العودة للدروس</button>
            </div>
        );
    }

    const { category1: mainCategory, category2: currentTopic } = parseCategoryParam(new URLSearchParams(location.search).get('category') || '');
    const isCurrentLessonLocked = !isSubscribed && currentQuestionIndex >= FREE_TRIAL_LIMIT;

    return (
        <div className="serie-classic-wrapper">
            {/* Top Bar matching image */}
            <div className="classic-top-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button className="btn-classic-back" onClick={() => navigate(-1)}>
                        <ChevronRight size={18} /> رجوع
                    </button>
                    <span>{mainCategory} - {currentTopic}</span>
                </div>
                <span style={{ fontWeight: 'bold' }}>codedelaroute.tn</span>
                <span>سلسلة {new URLSearchParams(location.search).get('nb_serie') || '1'}</span>
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
                    {/* Right side (Numbers) - Moved from Right to Left visually by being last in RTL code */}
                    <div className="classic-numbers-sidebar">
                        <div className="classic-numbers-header">الاجابات الخاطئة</div>
                        <div className="classic-numbers-grid" ref={scrollRef}>
                            {quizData.map((_, i) => (
                                <div
                                    key={i}
                                    className={`classic-number-row ${i === currentQuestionIndex ? 'active' : ''}`}
                                    onClick={() => handleJumpToQuestion(i)}
                                >
                                    <span>{i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Middle (Image) */}
                    <div className="classic-image-container">
                        {isCurrentLessonLocked ? (
                            <div style={{ textAlign: 'center', color: '#3b5998' }}>
                                <Lock size={80} />
                                <h3 style={{ marginTop: '20px' }}>محتوى مقفل</h3>
                                <button className="btn-classic" onClick={() => navigate('/subscriptions')} style={{ marginTop: '20px' }}>إشترك لفتح الدرس</button>
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
                                    alt="Lesson" 
                                />
                            </div>
                        )}
                    </div>

                    {/* Left side (Answer box) - Moved from Left to Right visually by being first in RTL code */}
                    <div className="classic-answer-sidebar">
                        <h4>اجابتك هي</h4>
                        <p style={{ margin: '0 0 10px' }}>Votre réponse</p>
                        <div className="classic-answer-box">
                            {selectedLetter}
                        </div>
                        <div className="classic-metadata">
                            <p className="category-label">{currentTopic}</p>
                            <p>Serie {new URLSearchParams(location.search).get('nb_serie') || '1'}</p>
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
                    {!isCurrentLessonLocked && (
                        <div className="classic-question-area">
                            <h1 className="classic-question-text">{currentQuestion.question}</h1>

                            <div className="classic-options-container">
                                {currentQuestion.options.slice(0, 3).map((opt, i) => (
                                    <div key={i} className="classic-option-item" onClick={() => setSelectedLetter(['أ', 'ب', 'ج'][i])}>
                                        <div className={`classic-option-box ${['option-a', 'option-b', 'option-c'][i]}`}>
                                            {['أ', 'ب', 'ج'][i]}
                                        </div>
                                        <div className="classic-option-text">{opt.text}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="classic-controls-wrapper">
                        <div className="classic-controls">
                            <button className="btn-classic" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
                                السابق
                            </button>
                            <button className="btn-classic" onClick={handleNext} disabled={currentQuestionIndex >= visibleLessonCount - 1}>
                                التالي
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}