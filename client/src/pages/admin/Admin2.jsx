import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../../comp/navbar.jsx';
import axios from 'axios';

// Constants from QuestionForm
const IMGBB_API_KEY = '4a45d9a01860c9fdd4642c1d51b46995';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://code-route-rho.vercel.app/api';
const API_URL_BATCH = `${API_BASE_URL}/quiz/questions/batch`;

const LICENSE_TYPES = [
    "B", "A / A1", "A1 / AM", "B+E", "C / C1", "C+E / C1+E", "D", "D1", "D+E / D1+E"
];

const TOPIC_CATEGORIES = [
    "العلامات و الاشارات", "الأولوية", "قواعد الجولان", "المخالفات و العقوبات",
    "السواق و العربات", "الصيانة", "المقاطعة و المجاوزة", "اسعافات اولية",
    "مواد خطيرة", "وقوف و توقف"
];

export default function Admin2() {
    // Extraction State
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    // Ref for file input to clear it manually
    const fileInputRef = useRef(null);

    // Submission State
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [imageQueue, setImageQueue] = useState([]);
    const [totalImages, setTotalImages] = useState(0);

    // Effect to generate object URL for preview
    useEffect(() => {
        if (!selectedImage) {
            setPreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(selectedImage);
        setPreviewUrl(objectUrl);

        // Free memory when component unmounts or image changes
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedImage]);

    // --- NEW: Stop/Clear Queue with Escape (Echap) ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (imageQueue.length > 0 || selectedImage) {
                    setImageQueue([]);
                    setSelectedImage(null);
                    setTotalImages(0);
                    if (fileInputRef.current) fileInputRef.current.value = '';

                    setSubmitMessage('تم إيقاف القائمة (Queue Stopped) 🛑');
                    setTimeout(() => setSubmitMessage(''), 2000);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [imageQueue, selectedImage]);

    const [metaData, setMetaData] = useState({
        nbSerie: '1',
        category1: LICENSE_TYPES[0],
        category2: TOPIC_CATEGORIES[7], // Default to what user asked (First Aid is index 7)
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitError, setSubmitError] = useState('');

    // Deletion State
    const [deleteCategory, setDeleteCategory] = useState(TOPIC_CATEGORIES[7]);
    const [deleteSerie, setDeleteSerie] = useState('1');
    const [deleting, setDeleting] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState('');

    // --- Text Extraction Logic (Preserved) ---
    const processText = () => {
        const lines = inputText.split('\n');

        // 1. Initial Cleanup
        const cleaned = lines.filter(line => {
            const trimmed = line.trim();
            if (trimmed === '') return false;
            if (trimmed.length === 1) return false;

            // --- Junk Filters ---
            if (/dell/i.test(trimmed)) return false; // Remove "Dell", "DELL", "DeLL", etc.
            if (trimmed.includes('codedelaroute') || trimmed.includes('Code de la route')) return false;
            if (trimmed.includes('الاجابات الخاطلة')) return false;
            if (trimmed.includes('اجابتك هى') || trimmed.includes('Votre réponse')) return false;
            if (trimmed.includes('الاستغبال') || trimmed.includes('إشارات الطريق')) return false;
            if (/Serie\s+\d+/i.test(trimmed)) return false;

            return true;
        });

        let result = [];
        let method = '';

        const trainingRegex = /تكوين|تكوبن/;
        const trainingIndex = cleaned.findIndex(l => trainingRegex.test(l));

        // Define keywordIndex to search for Serie/onse keywords
        const keywordIndex = cleaned.findIndex(l => /Serie|onse/i.test(l));

        // Rule 1: Search for Colon (:)
        // We search from the bottom up to find the "Question" colon and avoid "Header" colons.
        // We also ensure there are at least 2 lines after the colon line (answers), 
        // to avoid picking a colon inside one of the last answer options.
        let colonIndex = -1;
        for (let i = cleaned.length - 1; i >= 0; i--) {
            if (cleaned[i].includes(':')) {
                // Check if there are at least 1 line below it (User usually has Question + Opt1 + Opt2)
                // Let's stick to >= 1 to be safe (One True/False question?), but user examples imply multiple lines.
                // If we prioritize "Last valid question colon", this works.
                // Let's try >= 1 (so index < length - 1)
                if (cleaned.length - 1 - i >= 1) {
                    colonIndex = i;
                    break;
                }
            }
        }

        if (colonIndex !== -1) {
            result = cleaned.slice(colonIndex);
            method = 'تم العثور على (:) - الطريقة 1 (تحسين: النقطتين الأقرب للأسفل)';
        }
        else if (keywordIndex !== -1) {
            if (keywordIndex + 3 < cleaned.length) {
                result = cleaned.slice(keywordIndex + 3);
            } else {
                result = [];
            }
            method = 'تم العثور على كلمة مفتاحية (Serie/onse) - الطريقة 2';
        }
        else if (trainingIndex !== -1) {
            result = cleaned.slice(trainingIndex + 1);
            method = 'تم العثور على تكوين/تكوبن - الطريقة 3';
        }
        else {
            const len = cleaned.length;
            const idx4 = len - 4;
            const idx5 = len - 5;
            let matchedRule4 = false;

            if (idx4 >= 0 && !cleaned[idx4].trim().includes(' ')) {
                result = cleaned.slice(idx4 + 1);
                method = 'القاعدة 4: الكلمة الوحيدة في السطر الرابع من الأسفل';
                matchedRule4 = true;
            }
            if (!matchedRule4 && idx5 >= 0 && !cleaned[idx5].trim().includes(' ')) {
                result = cleaned.slice(idx5 + 1);
                method = 'القاعدة 4: الكلمة الوحيدة في السطر الخامس من الأسفل';
                matchedRule4 = true;
            }
            if (!matchedRule4) {
                result = cleaned;
                method = 'لم تنطبق أي قاعدة محددة - تم عرض النص المنظف فقط';
            }
        }

        // --- NEW: Remove prefixes (e.g. "ج ", "بـ ", "أ ", "A ") ---
        // Matches: Start of line -> (Any Letter [Arabic/Latin] + optional Tatweel + Space) repeated.
        // We exclude standard ASCII digits and Arabic-Indic digits (\u0660-\u0669) from "Letters" to avoid stripping numbers.
        // Range \u0600-\u06FF covers Arabic. We roughly exclude digits.
        // Logic: [Char] followed optionally by [Tatweel], then [Space].
        // This ensures "في " (2 chars) is NOT matched (no space after first char), but "بـ " (char+tatweel) IS matched.
        result = result.map(line => line.replace(/^([a-zA-Z\u0600-\u065F\u066A-\u06FF]\u0640?\s+)+/, ''));

        setOutputText(result.join('\n'));
        setStatusMessage(method);
    };

    // --- Submission Logic ---
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            // Sort numerically: 1.jpg, 2.jpg, 10.jpg
            files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

            setImageQueue(files);
            setTotalImages(files.length);
            // Automatically select the first one
            setSelectedImage(files[0]);
        }
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await axios.post(`${IMGBB_UPLOAD_URL}?key=${IMGBB_API_KEY}`, formData);
        return res.data.data.url;
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setSubmitMessage('');
        setSubmitError('');

        try {
            // 1. Validate Text
            const lines = outputText.split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length < 2) {
                setSubmitError("النص المستخرج قصير جداً. يجب أن يحتوي على الأقل على سؤال وإجابة واحدة.");
                setTimeout(() => {
                    setSubmitError('');
                }, 2000);
                return;
            }

            // 2. Validate Image
            if (!selectedImage) {
                throw new Error("الرجاء اختيار صورة.");
            }

            // 3. Upload Image
            const imageUrl = await uploadImage(selectedImage);

            // 4. Construct Question Object
            const questionText = lines[0];
            const optionLines = lines.slice(1);

            // First option is correct
            const options = optionLines.map((opt, idx) => ({
                text: opt,
                isCorrect: idx === 0
            }));

            const payload = [{
                question: questionText,
                image: imageUrl,
                category1: metaData.category1,
                category2: metaData.category2,
                nb_serie: parseInt(metaData.nbSerie),
                options: options
            }];

            // 5. Send to API
            await axios.post(API_URL_BATCH, payload);

            setSubmitMessage('تم إضافة السؤال بنجاح!');
            setTimeout(() => {
                setSubmitMessage('');
            }, 2000);

            // Reset fields for next
            setInputText('');
            setOutputText('');

            // Advance image queue
            if (imageQueue.length > 0) {
                const newQueue = imageQueue.filter(img => img !== selectedImage);
                setImageQueue(newQueue);
                if (newQueue.length > 0) {
                    setSelectedImage(newQueue[0]);
                } else {
                    setSelectedImage(null);
                }
            } else {
                setSelectedImage(null);
            }

            setStatusMessage('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            // We keep metadata as user likely wants to add more to same series

            // Scroll to the top of the page
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            console.error(err);
            setSubmitError(err.message || 'حدث خطأ أثناء الإرسال');
        } finally {
            setSubmitting(false);
        }
    };

    // --- Batch Delete Logic ---
    const handleDeleteBatch = async () => {
        if (!window.confirm(`هل أنت متأكد من حذف جميع الأسئلة في الفئة "${deleteCategory}" والسلسلة "${deleteSerie}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
            return;
        }

        setDeleting(true);
        setDeleteStatus('جاري جلب الأسئلة...');

        try {
            // 1. Fetch all questions
            const res = await axios.get(`${API_BASE_URL}/questions`);
            const allQuestions = res.data;

            // 2. Filter
            const toDelete = allQuestions.filter(q =>
                q.category2 === deleteCategory &&
                q.nb_serie.toString() === deleteSerie.toString()
            );

            if (toDelete.length === 0) {
                setDeleteStatus('لا توجد أسئلة تطابق المعايير المحددة.');
                setDeleting(false);
                return;
            }

            setDeleteStatus(`وجدت ${toDelete.length} سؤال. جاري الحذف...`);

            // 3. Delete one by one
            let deletedCount = 0;
            for (const q of toDelete) {
                await axios.delete(`${API_BASE_URL}/questions/${q._id}`);
                deletedCount++;
                setDeleteStatus(`تم حذف ${deletedCount} من ${toDelete.length}...`);
            }

            setDeleteStatus(`تمت العملية بنجاح! تم حذف ${deletedCount} سؤال.`);

        } catch (err) {
            console.error(err);
            setDeleteStatus('حدث خطأ أثناء الحذف: ' + (err.message || 'Unknown error'));
        } finally {
            setDeleting(false);
        }
    };
    // --- Delete All Data Logic ---
    const handleClearAllData = async () => {
        if (!window.confirm("⚠️ هل أنت متأكد من حذف جميع داتا الأسئلة نهائياً؟ لا يمكن التراجع عن هذا الإجراء!")) {
            return;
        }

        const confirmAgain = window.confirm("هل أنت متأكد حقاً؟ سيتم مسح كل شيء!");
        if (!confirmAgain) return;

        setDeleting(true);
        setDeleteStatus('جاري حذف كل البيانات...');

        try {
            const res = await axios.delete(`${API_BASE_URL}/questions/all`);
            setDeleteStatus(res.data.message);
            alert(res.data.message);
        } catch (err) {
            console.error(err);
            setDeleteStatus('حدث خطأ أثناء حذف البيانات: ' + (err.message || 'Unknown error'));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <Navbar />
            <div style={styles.container}>
                <h1 style={styles.header}>Admin 2 - Smart Extractor & Upload</h1>

                <div style={styles.grid}>
                    {/* --- Left Column: Extraction & Upload --- */}
                    <div style={styles.column}>
                        <div style={styles.section}>
                            <h3>1. استخراج النص (Extract)</h3>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                rows={8}
                                style={styles.textarea}
                                placeholder="ضع النص الخام هنا..."
                            />
                            <button onClick={processText} style={styles.button}>استخراج / Clean</button>
                            {statusMessage && <div style={{ color: 'blue', marginTop: '5px' }}>{statusMessage}</div>}
                        </div>

                        <div style={styles.section}>
                            <h3>2. النص المستخرج (Output)</h3>
                            <p style={{ fontSize: '0.8em', color: '#666' }}>السطر الأول سيكون السؤال. السطر الثاني الإجابة الصحيحة. والباقي خطأ.</p>
                            <textarea
                                value={outputText}
                                onChange={(e) => setOutputText(e.target.value)}
                                rows={8}
                                style={{ ...styles.textarea, backgroundColor: '#f0f0f0' }}
                            />
                        </div>

                        <div style={styles.section}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0 }}>3. الصورة (Image)</h3>
                                {selectedImage && imageQueue.length > 0 && (
                                    <span style={{ fontSize: '1.1em', color: '#28a745', fontWeight: 'bold' }}>
                                        {totalImages - imageQueue.length + 1} / {totalImages}
                                    </span>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                style={{ ...styles.input, marginBottom: '5px' }}
                                ref={fileInputRef}
                            />
                            {selectedImage && (
                                <div style={{ marginTop: '0px' }}>
                                    {/* Removed: الصورة المختارة حالياً */}

                                    {/* Image Preview Card */}
                                    {previewUrl && (
                                        <div style={{ ...styles.previewCard, marginTop: '0px' }}>
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                style={styles.previewImage}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- Right Column: Metadata & Actions --- */}
                    <div style={styles.column}>
                        <div style={styles.section}>
                            <h3>4. بيانات مشتركة (Common Data)</h3>

                            <label style={styles.label}>رقم السلسلة (Series):</label>
                            <input
                                type="number"
                                value={metaData.nbSerie}
                                onChange={e => setMetaData({ ...metaData, nbSerie: e.target.value })}
                                style={styles.input}
                            />

                            <label style={styles.label}>الفئة 1 (Vehicle):</label>
                            <select
                                value={metaData.category1}
                                onChange={e => setMetaData({ ...metaData, category1: e.target.value })}
                                style={styles.input}
                            >
                                {LICENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>

                            <label style={styles.label}>الفئة 2 (Topic):</label>
                            <select
                                value={metaData.category2}
                                onChange={e => setMetaData({ ...metaData, category2: e.target.value })}
                                style={styles.input}
                            >
                                {TOPIC_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div style={styles.section}>
                            <h3>5. إرسال (Submit)</h3>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                style={{ ...styles.button, backgroundColor: submitting ? '#ccc' : '#28a745' }}
                            >
                                {submitting ? 'جاري الإرسال...' : 'حفظ في قاعدة البيانات'}
                            </button>
                            {/* Toast Notification for Success */}
                            {submitMessage && (
                                <div style={styles.toast}>
                                    ✅ {submitMessage}
                                </div>
                            )}
                            {submitError && (
                                <div style={styles.toastError}>
                                    ❌ {submitError}
                                </div>
                            )}
                        </div>

                        <hr style={{ margin: '30px 0' }} />

                        <div style={{ ...styles.section, border: '1px solid #dc3545', backgroundColor: '#fff5f5' }}>
                            <h3 style={{ color: '#dc3545' }}>🗑️ حذف دفعة (Batch Delete)</h3>

                            <label style={styles.label}>الفئة للحذف:</label>
                            <select
                                value={deleteCategory}
                                onChange={e => setDeleteCategory(e.target.value)}
                                style={styles.input}
                            >
                                {TOPIC_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>

                            <label style={styles.label}>رقم السلسلة للحذف:</label>
                            <input
                                type="number"
                                value={deleteSerie}
                                onChange={e => setDeleteSerie(e.target.value)}
                                style={styles.input}
                            />

                            <button
                                onClick={handleDeleteBatch}
                                disabled={deleting}
                                style={{ ...styles.button, backgroundColor: '#dc3545', marginTop: '10px' }}
                            >
                                {deleting ? 'جاري الحذف...' : 'حذف جميع الأسئلة المطابقة'}
                            </button>

                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px dashed #dc3545' }}>
                                <h4 style={{ color: '#dc3545', marginBottom: '10px' }}>⚠️ منطقة الخطر القصوى</h4>
                                <button
                                    onClick={handleClearAllData}
                                    disabled={deleting}
                                    style={{ ...styles.button, backgroundColor: '#000', color: '#ff0000', border: '2px solid #ff0000' }}
                                >
                                    {deleting ? 'جاري المسح...' : '🔥 حذف كل داتا الأسئلة'}
                                </button>
                            </div>

                            {deleteStatus && <div style={{ marginTop: '10px', fontWeight: 'bold' }}>{deleteStatus}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        direction: 'rtl',
        fontFamily: 'Arial, sans-serif'
    },
    header: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '30px'
    },
    grid: {
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap'
    },
    column: {
        flex: 1,
        minWidth: '300px'
    },
    section: {
        background: '#fff',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    textarea: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '10px',
        fontFamily: 'inherit'
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '15px'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold'
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1em',
        fontWeight: 'bold',
        width: '100%'
    },
    success: {
        background: '#d4edda',
        color: '#155724',
        padding: '10px',
        borderRadius: '4px',
        marginTop: '10px',
        textAlign: 'center'
    },
    error: {
        background: '#f8d7da',
        color: '#721c24',
        padding: '10px',
        borderRadius: '4px',
        marginTop: '10px',
        textAlign: 'center'
    },
    toast: {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#28a745', // Green
        color: 'white',
        padding: '15px 40px',
        borderRadius: '50px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        fontSize: '1.2em',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'fadeInOut 2s ease-in-out'
    },
    toastError: {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#dc3545', // Red
        color: 'white',
        padding: '15px 40px',
        borderRadius: '50px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        fontSize: '1.2em',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'fadeInOut 2s ease-in-out'
    },
    previewCard: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        textAlign: 'center'
    },
    previewImage: {
        maxWidth: '100%',
        maxHeight: '200px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
};
