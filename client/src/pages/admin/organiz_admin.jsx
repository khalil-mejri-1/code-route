import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrganizAdmin.css';

const API_BASE_URL = 'https://code-route-rho.vercel.app/api';

const CATEGORIES = [
    "العلامات و الاشارات",
    "الأولوية",
    "قواعد الجولان",
    "المخالفات و العقوبات",
    "السواق و العربات",
    "الصيانة",
    "المقاطعة و المجاوزة",
    "اسعافات اولية",
    "مواد خطيرة",
    "وقوف و توقف"
];

// ----------------------------------------------------
// NEW: مكون النافذة المنبثقة للأسئلة المخفية (محدَّث)
// ----------------------------------------------------
const HiddenQuestionsModal = ({ hiddenQuestions, onClose, onRestoreAll }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>الأسئلة المخفية مؤقتًا ({hiddenQuestions.length})</h2>
                    <button className="modal-close-button" onClick={onClose}>&times;</button>
                </div>
                
                <div className="modal-actions">
                    <button 
                        className="restore-all-button" 
                        onClick={onRestoreAll}
                        disabled={hiddenQuestions.length === 0}
                    >
                        ↩️ استعادة عرض الكل 
                    </button>
                </div>
                
                <div className="modal-body">
                    {hiddenQuestions.length === 0 ? (
                        <p style={{textAlign: 'center', color: '#666'}}>لا توجد أسئلة مخفية حاليًا.</p>
                    ) : (
                        <div className="hidden-questions-list">
                            {hiddenQuestions.map(q => (
                                <div key={q._id} className="hidden-question-item">
                                    <div className="hidden-question-content">
                                        
                                        {/* الصورة */}
                                        {q.image && (
                                            <div className="hidden-question-image-container">
                                                <img 
                                                    src={q.image} 
                                                    alt={`صورة السؤال: ${q.question}`}
                                                    className="hidden-question-image"
                                                />
                                            </div>
                                        )}

                                        {/* النص */}
                                        <div className="hidden-question-text-details">
                                            <p className="hidden-question-title">
                                                **سلسلة {q.nb_serie}** | {q.question}
                                            </p>
                                            <p className="hidden-question-id">ID: {q._id.substring(0, 8)}...</p>
                                            <p className="hidden-question-category">
                                                الفئة: {q.category2}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// ----------------------------------------------------
// NEW: مكون النافذة المنبثقة للتعديل (Update Modal)
// ----------------------------------------------------
const UpdateQuestionModal = ({ question, onClose, onUpdateQuestion }) => {
    const [formData, setFormData] = useState({
        question: question.question,
        image: question.image,
        category1: question.category1,
        category2: question.category2,
        nb_serie: question.nb_serie,
        options: question.options.map(opt => ({ ...opt }))
    });
    const [status, setStatus] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index].text = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleCorrectToggle = (index) => {
        const newOptions = formData.options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index // تعيين الصحيح الجديد وإلغاء الآخرين
        }));
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: '🔄 جارٍ تحديث السؤال...' });
        
        try {
            await onUpdateQuestion(question._id, formData);
            setStatus({ type: 'success', message: '✅ تم تحديث السؤال بنجاح!' });
            setTimeout(onClose, 1500); // إغلاق بعد التحديث
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'حدث خطأ غير معروف.';
            setStatus({ type: 'error', message: `❌ فشل التحديث: ${errorMsg}` });
        }
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content update-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>تعديل السؤال: {question._id.substring(0, 8)}...</h2>
                    <button className="modal-close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="update-form">
                        
                        {/* نص السؤال */}
                        <label>
                            نص السؤال:
                            <textarea 
                                name="question" 
                                value={formData.question} 
                                onChange={handleChange} 
                                required 
                                dir="rtl"
                            />
                        </label>
                        
                        {/* رابط الصورة */}
                        <label>
                            رابط الصورة (URL):
                            <input 
                                type="text" 
                                name="image" 
                                value={formData.image} 
                                onChange={handleChange} 
                                dir="ltr"
                            />
                        </label>
                        {formData.image && (
                            <div className="image-preview-container">
                                <img src={formData.image} alt="معاينة" className="image-preview"/>
                            </div>
                        )}
                        
                        {/* الفئات والسلسلة */}
                        <div className="form-row">
                            <label>
                                الفئة الأولى (Category1):
                                <input 
                                    type="text" 
                                    name="category1" 
                                    value={formData.category1} 
                                    onChange={handleChange} 
                                    required 
                                    dir="rtl"
                                />
                            </label>
                            <label>
                                الفئة الثانية (Category2):
                                <select 
                                    name="category2" 
                                    value={formData.category2} 
                                    onChange={handleChange} 
                                    required
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                رقم السلسلة:
                                <input 
                                    type="number" 
                                    name="nb_serie" 
                                    value={formData.nb_serie} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </label>
                        </div>

                        {/* الخيارات */}
                        <fieldset>
                            <legend>خيارات الإجابة:</legend>
                            {formData.options.map((option, index) => (
                                <div key={index} className="option-edit-row">
                                    <input 
                                        type="text" 
                                        value={option.text} 
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        required
                                        dir="rtl"
                                        placeholder={`الخيار ${index + 1}`}
                                    />
                                    <button 
                                        type="button"
                                        className={`correct-toggle-button ${option.isCorrect ? 'is-correct' : ''}`}
                                        onClick={() => handleCorrectToggle(index)}
                                    >
                                        {option.isCorrect ? '✅ صحيح' : '❌ اجعل صحيح'}
                                    </button>
                                </div>
                            ))}
                        </fieldset>
                        
                        {status && <p className={`status-message ${status.type}`}>{status.message}</p>}
                        
                        <button type="submit" className="update-submit-button" disabled={status?.type === 'loading'}>
                            {status?.type === 'loading' ? 'جاري الحفظ...' : '💾 حفظ التعديلات'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};


export default function Organiz_admin() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // حالات الفلترة والبحث
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSerie, setSelectedSerie] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // حالة تبديل الصور
    const [selectedQuestionsForSwap, setSelectedQuestionsForSwap] = useState([]);
    const [swapStatus, setSwapStatus] = useState(null);

    // الحالة: ID الأسئلة التي تم تبديل صورها بنجاح وهي جاهزة للإخفاء (سنقوم بتجاهلها الآن في العرض)
    const [swappedAndReadyToHide, setSwappedAndReadyToHide] = useState([]);
    
    // الحالة: ID الأسئلة التي تم إخفاؤها مؤقتاً في الجلسة الحالية
    const [hiddenQuestionIds, setHiddenQuestionIds] = useState([]);
    
    // NEW STATE: حالة نافذة الأسئلة المخفية المنبثقة
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // NEW STATE: حالة نافذة التعديل المنبثقة
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [questionToUpdate, setQuestionToUpdate] = useState(null);


    
    // 1. جلب البيانات عند التحميل (لم يتغير)
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/questions`);
                setQuestions(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load questions. Make sure the backend server is running.');
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    // 2. وظيفة تبديل الصور (لم تتغير)
    const handleSwapImages = async () => {
        if (selectedQuestionsForSwap.length !== 2) {
            setSwapStatus({ type: 'error', message: '⚠️ يجب اختيار سؤالين اثنين فقط للتبديل.' });
            return;
        }

        const [id1, id2] = selectedQuestionsForSwap;
        setSwapStatus({ type: 'loading', message: '🔄 جارٍ تبديل الصور...' });

        try {
            const response = await axios.post(`${API_BASE_URL}/questions/swap-images`, {
                question1Id: id1,
                question2Id: id2
            });

            setQuestions(prevQuestions => prevQuestions.map(q => {
                if (q._id === id1) return { ...q, image: response.data.updatedQ1.image };
                if (q._id === id2) return { ...q, image: response.data.updatedQ2.image };
                return q;
            }));

            // بعد التبديل الناجح
            setSelectedQuestionsForSwap([]);
            setSwapStatus({ type: 'success', message: '✅ تم تبديل الصور بنجاح! أكمل عملك.' });

        } catch (err) {
            setSwapStatus({ type: 'error', message: `❌ فشل في تبديل الصور: ${err.response?.data?.message || err.message}` });
        }
        setTimeout(() => setSwapStatus(null), 8000);
    };

    // 3. وظيفة تغيير الإجابة الصحيحة (لم تتغير)
    const handleSwapCorrectAnswer = async (questionId, newCorrectText, event) => {
        event.stopPropagation();
        
        setSwapStatus({ type: 'loading', message: `🔄 جارٍ تعيين "${newCorrectText}" كإجابة صحيحة...` });

        try {
            const response = await axios.post(`${API_BASE_URL}/questions/swap-answer`, {
                questionId,
                newCorrectText
            });

            setQuestions(prevQuestions => prevQuestions.map(q => {
                if (q._id === questionId) {
                    return { ...q, options: response.data.updatedQuestion.options };
                }
                return q;
            }));

            setSwapStatus({ type: 'success', message: `✅ تم تعيين "${newCorrectText}" كإجابة صحيحة بنجاح!` });

        } catch (err) {
            setSwapStatus({ type: 'error', message: `❌ فشل: ${err.response?.data?.message || err.message}` });
        }
        setTimeout(() => setSwapStatus(null), 5000);
    };

    // 4. وظيفة الإخفاء المؤقت (لم تتغير)
    const handleHideQuestion = (idToHide, event) => {
        event.stopPropagation(); // مهم لمنع تفعيل النقر على الكارد

        // 1. إخفاء العنصر مؤقتاً
        setHiddenQuestionIds(prevIds => [...prevIds, idToHide]);
        
        // 2. إزالة العنصر من قائمة التحديد للتبديل (إذا كان موجوداً)
        setSelectedQuestionsForSwap(prevSelected => prevSelected.filter(id => id !== idToHide));
        
        // 3. مسح حالة "جاهز للإخفاء" في حال كانت نقرة الإخفاء بعد التبديل
        setSwappedAndReadyToHide(prevReady => prevReady.filter(id => id !== idToHide));


        setSwapStatus({ type: 'success', message: '✅ تم إخفاء السؤال مؤقتًا وإزالته من التحديد.' });
        setTimeout(() => setSwapStatus(null), 5000);
    };

    // 5. وظيفة النقر على الكارد (مسؤولة فقط عن التحديد) (لم تتغير)
    const handleCardClick = (id) => {
        
        // منطق التحديد لعملية تبديل الصور
        setSelectedQuestionsForSwap(prevSelected => {
            if (prevSelected.includes(id)) {
                // إلغاء التحديد
                return prevSelected.filter(itemId => itemId !== id);
            } else if (prevSelected.length < 2) {
                // التحديد (إذا لم يصل العدد لـ 2)
                return [...prevSelected, id];
            } else {
                // محاولة اختيار أكثر من 2
                setSwapStatus({ type: 'error', message: '⚠️ لا يمكن اختيار أكثر من سؤالين للتبديل.' });
                setTimeout(() => setSwapStatus(null), 3000);
                return prevSelected;
            }
        });
    };
    
    // MODIFIED: وظيفة مسح التحديد فقط (بدون استعادة المخفي)
    const handleClearSelection = () => {
        setSelectedQuestionsForSwap([]);
        setSwapStatus(null);
        setSwappedAndReadyToHide([]);
    };
    
    // NEW: وظيفة استعادة جميع الأسئلة المخفية
    const handleRestoreAllHidden = () => {
        setHiddenQuestionIds([]);
        setIsModalOpen(false); // إغلاق النافذة المنبثقة بعد الاستعادة
        setSwapStatus({ type: 'success', message: '✅ تم استعادة جميع الأسئلة المخفية وعرضها.' });
        setTimeout(() => setSwapStatus(null), 5000);
    };
    
    // ------------------------------------------------------------------
    // ⭐️⭐️ NEW: وظائف التعديل والحذف ⭐️⭐️
    // ------------------------------------------------------------------
    
    // فتح نافذة التعديل
    const handleEditClick = (question, event) => {
        event.stopPropagation();
        setQuestionToUpdate(question);
        setIsUpdateModalOpen(true);
    };

    // معالج تحديث السؤال
    const handleUpdateQuestion = async (id, updatedData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/questions/${id}`, updatedData);
            
            // تحديث حالة الأسئلة في الواجهة
            setQuestions(prevQuestions => prevQuestions.map(q => 
                q._id === id ? response.data.question : q
            ));
            
        } catch (error) {
            console.error('Update failed:', error);
            throw error;
        }
    };
    
    // معالج حذف السؤال
    const handleDeleteQuestion = async (id, event) => {
        event.stopPropagation();
        if (!window.confirm('⚠️ هل أنت متأكد من حذف هذا السؤال نهائيًا؟')) {
            return;
        }

        setSwapStatus({ type: 'loading', message: '🔄 جارٍ حذف السؤال...' });
        try {
            await axios.delete(`${API_BASE_URL}/questions/${id}`);
            
            // إزالة السؤال من حالة الأسئلة
            setQuestions(prevQuestions => prevQuestions.filter(q => q._id !== id));
            // إزالة من التحديد إذا كان موجودًا
            setSelectedQuestionsForSwap(prevSelected => prevSelected.filter(itemId => itemId !== id));

            setSwapStatus({ type: 'success', message: '🗑️ تم حذف السؤال بنجاح.' });
            
        } catch (err) {
            setSwapStatus({ type: 'error', message: `❌ فشل في الحذف: ${err.response?.data?.message || err.message}` });
        }
        setTimeout(() => setSwapStatus(null), 5000);
    };
    

    // 6. منطق الفلترة والبحث (لم يتغير)
    let currentFilteredQuestions = selectedCategory
        ? questions.filter(q => q.category2 === selectedCategory)
        : questions;

    currentFilteredQuestions = selectedSerie
        ? currentFilteredQuestions.filter(q => q.nb_serie === selectedSerie)
        : currentFilteredQuestions;

    const finalFilteredQuestions = currentFilteredQuestions
        .filter(q => !hiddenQuestionIds.includes(q._id)) 
        .filter(q => {
            if (!searchTerm) return true;
            const lowerCaseSearchTerm = searchTerm.toLowerCase();

            const questionMatch = q.question.toLowerCase().includes(lowerCaseSearchTerm);
            const optionsMatch = q.options.some(option =>
                option.text.toLowerCase().includes(lowerCaseSearchTerm)
            );

            return questionMatch || optionsMatch;
        });

    const hiddenQuestions = questions.filter(q => hiddenQuestionIds.includes(q._id)); // قائمة الأسئلة المخفية للنافذة المنبثقة


    const availableSeries = [...new Set(
        currentFilteredQuestions.map(q => q.nb_serie)
    )].sort((a, b) => a - b);


    // وظائف معالجة النقر للفلترة (لم تتغير)
    const handleCategoryFilterClick = (category) => {
        if (selectedCategory !== category) {
            setSelectedSerie(null);
        }
        setSelectedCategory(selectedCategory === category ? null : category);
    };

    const handleSerieFilterClick = (serie) => {
        setSelectedSerie(selectedSerie === serie ? null : serie);
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>🔄 جارٍ تحميل الأسئلة...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>⚠️ خطأ: {error}</div>;
    }

    // متغيرات مساعدة للعرض
    const isFirstCardSelected = selectedQuestionsForSwap.length === 1;
    const firstSelectedId = isFirstCardSelected ? selectedQuestionsForSwap[0] : null;


    return (
        <div className="admin-dashboard">
            <h1 style={{ textAlign: 'right', padding: '20px' }}>📝 لوحة إدارة الأسئلة</h1>

            {/* منطقة الفلترة والبحث */}
            <div className="filter-and-search-container">
                
                {/* حقل البحث */}
       

                {/* أزرار فلترة الفئة */}
                <div className="filter-buttons-container">
                    <h3 style={{ margin: '0 10px 0 0', color: '#333', fontSize: '1em' }}>الفئات:</h3>
                    <button
                        className={`filter-button ${selectedCategory === null ? 'active' : ''}`}
                        onClick={() => handleCategoryFilterClick(null)}
                    >
                        عرض الكل ({questions.length})
                    </button>
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => handleCategoryFilterClick(category)}
                        >
                            {category}
                            ({questions.filter(q => q.category2 === category).length})
                        </button>
                    ))}
                </div>
            
                {/* أزرار فلترة السلسلة */}
                {currentFilteredQuestions.length > 0 && (
                    <div className="filter-buttons-container" style={{ marginTop: '10px' }}>
                        <h3 style={{ margin: '0 10px 0 0', color: '#333', fontSize: '1em' }}>رقم السلسلة:</h3>
                        <button
                            className={`filter-button ${selectedSerie === null ? 'active' : ''}`}
                            onClick={() => handleSerieFilterClick(null)}
                        >
                            الكل ({currentFilteredQuestions.length})
                        </button>
                        {availableSeries.map((serie) => (
                            <button
                                key={serie}
                                className={`filter-button ${selectedSerie === serie ? 'active' : ''}`}
                                onClick={() => handleSerieFilterClick(serie)}
                            >
                                سلسلة رقم {serie}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <p style={{ textAlign: 'right', padding: '10px 20px 10px 20px', fontWeight: 'bold' }}>
                الأسئلة المعروضة: **{finalFilteredQuestions.length}**
            </p>

            {/* منطقة التبديل (Swap Images) - ثابتة في الأسفل */}
            <div className="swap-actions-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: selectedQuestionsForSwap.length === 2 ? '#28a745' : '#ffc107' }}>
                        الأسئلة المختارة: {selectedQuestionsForSwap.length} / 2
                    </p>
                    <button
                        onClick={handleSwapImages}
                        disabled={selectedQuestionsForSwap.length !== 2 || swapStatus?.type === 'loading'}
                        className="swap-button"
                    >
                        {swapStatus?.type === 'loading' ? 'جاري...' : '🔄 تبديل الصور الآن'}
                    </button>
                    
                    {/* NEW: زر عرض الأسئلة المخفية */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        disabled={hiddenQuestionIds.length === 0}
                        className="show-hidden-button"
                    >
                        👁️‍🗨️ عرض المخفية ({hiddenQuestionIds.length})
                    </button>
                    
                    {/* MODIFIED: زر مسح التحديد فقط */}
                    <button
                        onClick={handleClearSelection}
                        className="clear-button"
                    >
                        مسح التحديد
                    </button>

                             <div className="search-input-container" style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="ابحث في نص السؤال أو الإجابة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        dir="rtl"
                    />
                </div>
                </div>
                {swapStatus && (
                    <p className={`status-message ${swapStatus.type}`}>{swapStatus.message}</p>
                )}
            </div>

            {/* التخطيط المقسم */}
            {finalFilteredQuestions.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '50px' }}>لا توجد أسئلة لعرضها.</p>
            ) : (
                <div className="questions-split-container">
                    {/* ➡️ العمود الأيمن: نص السؤال والخيارات */}
                    <div className="questions-list-column">
                        <h2>نص الأسئلة والخيارات</h2>
                        <div className="questions-text-grid">
                            {finalFilteredQuestions.map((q) => {
                                const isSelected = selectedQuestionsForSwap.includes(q._id);
                                
                                // الشرط لظهور زر الإخفاء: يظهر فقط إذا كان الكارد الأول المختار
                                const showHideButton = (q._id === firstSelectedId);
                                
                                return (
                                    <div
                                        className={`question-text-card ${isSelected ? 'selected-for-swap' : ''}`}
                                        key={q._id}
                                        onClick={() => handleCardClick(q._id)}
                                    >
                                        <div className="card-content">
                                            <div className="card-meta">
                                                {isSelected && (
                                                    <span className="swap-order-badge">
                                                        #{selectedQuestionsForSwap.indexOf(q._id) + 1}
                                                    </span>
                                                )}
                                                <p>ID: {q._id.substring(0, 8)}... | السلسلة: {q.nb_serie}</p>
                                            </div>

                                            <h3 className="card-title">
                                                {q.question}
                                            </h3>

                                            <p className="card-meta">
                                                الفئة: **{q.category1}** / **{q.category2}**
                                            </p>

                                            <ul className="options-list">
                                                {q.options.map((option, index) => (
                                                    <li key={index} className="option-item">
                                                        <span className="correct-status-icon">
                                                            {option.isCorrect ? '✅ (صحيح) ' : '❌ (خاطئ) '}
                                                        </span>
                                                        <span className="option-text">{option.text}</span>

                                                        {/* زر تغيير الإجابة الصحيحة */}
                                                        {!option.isCorrect && (
                                                            <button
                                                                className="action-button set-correct-button"
                                                                title="اجعل هذا الخيار هو الإجابة الصحيحة"
                                                                onClick={(e) => handleSwapCorrectAnswer(q._id, option.text, e)}
                                                            >
                                                                اجعل صحيح
                                                            </button>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                            
                                            {/* أزرار الإجراءات في بطاقة النص */}
                                            <div className="question-actions-footer">
                                                <button
                                                    className="action-button edit-button"
                                                    onClick={(e) => handleEditClick(q, e)}
                                                >
                                                    ✏️ تعديل
                                                </button>
                                                
                                                <button
                                                    className="action-button delete-button"
                                                    onClick={(e) => handleDeleteQuestion(q._id, e)}
                                                >
                                                    🗑️ حذف
                                                </button>

                                                {/* زر الإخفاء المؤقت في بطاقة النص */}
                                                {showHideButton && (
                                                    <button
                                                        className="action-button hide-temp-button"
                                                        onClick={(e) => handleHideQuestion(q._id, e)}
                                                    >
                                                        👁️‍🗨️ إخفاء مؤقت
                                                    </button>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ⬅️ العمود الأيسر: الصور فقط */}
                    <div className="images-list-column">
                        <h2>الصور</h2>
                        <div className="questions-image-grid">
                            {finalFilteredQuestions.map((q) => {
                                const isSelected = selectedQuestionsForSwap.includes(q._id);
                                
                                // الشرط لظهور زر الإخفاء
                                const showHideButton = (q._id === firstSelectedId);
                                
                                return (
                                    <div
                                        className={`image-card ${isSelected ? 'selected-for-swap' : ''}`}
                                        key={`image-${q._id}`}
                                        onClick={() => handleCardClick(q._id)}
                                    >
                                        {isSelected && (
                                            <span className="swap-order-badge">
                                                #{selectedQuestionsForSwap.indexOf(q._id) + 1}
                                            </span>
                                        )}
                                        <span className="status-badge">السلسلة {q.nb_serie}</span>
                                        <img
                                            src={q.image || 'https://via.placeholder.com/400x200?text=No+Image'}
                                            alt={`صورة السؤال: ${q.question}`}
                                            className="card-image-only"
                                        />
                                        <p className="image-card-footer">ID: {q._id.substring(0, 8)}...</p>

                                        {/* زر الإخفاء المؤقت في بطاقة الصورة */}
                                        {showHideButton && (
                                            <button
                                                className="action-button hide-temp-button image-button-overlay"
                                                onClick={(e) => handleHideQuestion(q._id, e)}
                                            >
                                                👁️‍🗨️ إخفاء مؤقت
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
            
            {/* NEW: النافذة المنبثقة للأسئلة المخفية (Modal) */}
            {isModalOpen && (
                <HiddenQuestionsModal 
                    hiddenQuestions={hiddenQuestions}
                    onClose={() => setIsModalOpen(false)}
                    onRestoreAll={handleRestoreAllHidden}
                />
            )}
            
            {/* NEW: النافذة المنبثقة للتعديل (Update Modal) */}
            {isUpdateModalOpen && questionToUpdate && (
                <UpdateQuestionModal
                    question={questionToUpdate}
                    onClose={() => setIsUpdateModalOpen(false)}
                    onUpdateQuestion={handleUpdateQuestion}
                />
            )}
        </div>
    );
}