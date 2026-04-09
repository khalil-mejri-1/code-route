import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../comp/navbar';
import axios from 'axios';
import { API_BASE_URL, IMGBB_API_KEY, IMGBB_UPLOAD_URL } from '../config';
import { ChevronRight, ChevronLeft, Image as ImageIcon, Plus, Trash2, Save, X, UploadCloud, Smartphone } from 'lucide-react';

export default function FormationView() {
    const location = useLocation();
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [isSaving, setIsSaving] = useState(false);
    
    // Carousel state
    const [currentIndex, setCurrentIndex] = useState(0);

    const urlParams = new URLSearchParams(location.search);
    const category = urlParams.get('category') || '';
    const isAdmin = localStorage.getItem('role') === 'admin' || localStorage.getItem('login') === 'true';

    useEffect(() => {
        if (category) {
            fetchFormation();
        } else {
            setLoading(false);
        }
    }, [category]);

    const fetchFormation = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/formation/${encodeURIComponent(category)}`);
            setImages(res.data.images || []);
        } catch (err) {
            console.error("Error fetching formation", err);
        } finally {
            setLoading(false);
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

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        setUploadProgress({ current: 0, total: files.length });
        
        const newUploadedUrls = [];
        let successCount = 0;

        for (let i = 0; i < files.length; i++) {
            setUploadProgress({ current: i + 1, total: files.length });
            try {
                const url = await uploadToImgBB(files[i]);
                newUploadedUrls.push(url);
                successCount++;
            } catch (err) {
                console.error(`Error uploading file ${i + 1}:`, err);
            }
        }

        if (newUploadedUrls.length > 0) {
            setImages(prev => [...prev, ...newUploadedUrls]);
            // Jump to the first newly added image
            setCurrentIndex(images.length);
        }
        
        setIsUploading(false);
        alert(`✅ تم رفع ${successCount} صور بنجاح.`);
    };

    const removeImage = (index) => {
        if (window.confirm("هل أنت متأكد من حذف هذه الصورة؟")) {
            const newImages = images.filter((_, i) => i !== index);
            setImages(newImages);
            if (currentIndex >= newImages.length && newImages.length > 0) {
                setCurrentIndex(newImages.length - 1);
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.post(`${API_BASE_URL}/formation`, {
                category,
                images
            });
            alert("✅ تم حفظ قائمة الصور بنجاح!");
        } catch (err) {
            console.error(err);
            alert("❌ فشل حفظ التغييرات.");
        } finally {
            setIsSaving(false);
        }
    };

    const nextSlide = () => {
        if (currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
            <Navbar />
            <div className="page-container" style={{ maxWidth: '1000px' }}>
                <header className="page-header reveal-anim" style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '15px' }}>
                        <button 
                            className="btn-premium-sm" 
                            onClick={() => navigate(-1)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            <ChevronRight size={18} /> رجوع
                        </button>
                        <span className="badge-new">تكوين الفئة {category}</span>
                    </div>
                    <h1 className="page-title">صور <span className="accent">التكوين</span></h1>
                </header>

                {isAdmin && (
                    <div 
                        className="reveal-anim" 
                        style={{ 
                            background: 'rgba(255,255,255,0.03)', 
                            padding: '20px', 
                            borderRadius: '20px', 
                            marginBottom: '30px',
                            border: '1px dashed rgba(255,255,255,0.1)',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>
                            <label 
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '10px', 
                                    padding: '10px 20px', 
                                    background: 'rgba(0,0,0,0.3)', 
                                    borderRadius: '12px', 
                                    border: '1px dashed var(--primary)', 
                                    color: 'var(--primary)',
                                    cursor: isUploading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    opacity: isUploading ? 0.6 : 1,
                                    fontSize: '14px'
                                }}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="spinner-sm"></div>
                                        <span>جاري الرفع ({uploadProgress.current}/{uploadProgress.total})...</span>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={18} />
                                        <span style={{ fontWeight: 700 }}>إضافة صور جديدة</span>
                                    </>
                                )}
                                <input type="file" multiple onChange={handleFileChange} disabled={isUploading} style={{ display: 'none' }} />
                            </label>

                            <button 
                                onClick={handleSave}
                                disabled={isSaving || isUploading || images.length === 0}
                                className="btn-premium-sm"
                                style={{ background: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '14px' }}
                            >
                                <Save size={18} /> {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--primary)', fontWeight: 800, fontSize: '24px', padding: '50px' }}>جاري التحميل...</div>
                ) : images.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#999', padding: '100px' }}>
                        <ImageIcon size={60} style={{ marginBottom: '20px', opacity: 0.5 }} />
                        <h3>لا توجد صور تكوين متاحة لهذه الفئة حالياً.</h3>
                    </div>
                ) : (
                    <div className="reveal-anim">
                        {/* Numbering Header */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            gap: '15px', 
                            marginBottom: '20px',
                            color: 'white'
                        }}>
                             <div style={{ 
                                background: 'rgba(255,255,255,0.1)', 
                                padding: '8px 20px', 
                                borderRadius: '30px', 
                                fontSize: '18px', 
                                fontWeight: 800,
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'var(--bg-card)'
                             }}>
                                {currentIndex + 1} <span style={{ color: 'var(--primary)', margin: '0 5px' }}>/</span> {images.length}
                             </div>
                        </div>

                        {/* Mobile Rotate Message */}
                        <div className="hide-on-desktop" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '10px 20px',
                            borderRadius: '12px', marginBottom: '15px', fontWeight: 'bold'
                        }}>
                            <Smartphone size={20} style={{ transform: 'rotate(90deg)' }} />
                            يرجى تدوير الهاتف يميناً لتحسين جودة القراءة
                        </div>

                        {/* Carousel Container */}
                        <div className="formation-carousel-container" style={{ 
                            position: 'relative', 
                            background: 'var(--bg-card)', 
                            borderRadius: '30px', 
                            overflow: 'hidden', 
                            border: '1px solid var(--glass-border)',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
                            height: '75vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {/* Controls */}
                            <button 
                                className="formation-nav-btn left"
                                onClick={nextSlide} 
                                disabled={currentIndex === images.length - 1}
                                style={{ 
                                    position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%',
                                    width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: currentIndex === images.length - 1 ? 'not-allowed' : 'pointer', zIndex: 5, opacity: currentIndex === images.length - 1 ? 0.2 : 1,
                                    transition: 'all 0.3s'
                                }}
                            >
                                <ChevronLeft size={30} />
                            </button>

                            <button 
                                className="formation-nav-btn right"
                                onClick={prevSlide} 
                                disabled={currentIndex === 0}
                                style={{ 
                                    position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%',
                                    width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', zIndex: 5, opacity: currentIndex === 0 ? 0.2 : 1,
                                    transition: 'all 0.3s'
                                }}
                            >
                                <ChevronRight size={30} />
                            </button>

                            {/* Image Wrapper */}
                            {/* Image Wrapper */}
                            <div className="formation-image-wrapper" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'stretch', justifyContent: 'stretch', padding: '20px' }}>
                                <img 
                                    key={currentIndex}
                                    src={images[currentIndex]} 
                                    alt={`Formation ${currentIndex + 1}`} 
                                    className="reveal-anim formation-image"
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'fill',
                                        borderRadius: '15px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                        border: '3px solid #000',
                                        boxSizing: 'border-box'
                                    }} 
                                />
                            </div>

                            {/* Admin Delete Action */}
                            {isAdmin && (
                                <button 
                                    onClick={() => removeImage(currentIndex)}
                                    style={{ 
                                        position: 'absolute', bottom: '20px', left: '20px',
                                        background: '#f43f5e', color: 'white', border: 'none', borderRadius: '12px',
                                        padding: '10px 20px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px',
                                        fontWeight: 'bold', boxShadow: '0 5px 15px rgba(244,63,94,0.4)'
                                    }}
                                >
                                    <Trash2 size={18} /> حذف هذه الصورة
                                </button>
                            )}
                        </div>

                        {/* Dots Indicator */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: '8px', 
                            marginTop: '25px', 
                            flexWrap: 'wrap',
                            padding: '0 20px'
                        }}>
                            {images.map((_, i) => (
                                <div 
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    style={{ 
                                        width: i === currentIndex ? '30px' : '10px', 
                                        height: '10px', 
                                        borderRadius: '5px', 
                                        background: i === currentIndex ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .spinner-sm {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: var(--primary);
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .hide-on-desktop {
                    display: none !important;
                }

                @media (max-width: 768px) {
                    .hide-on-desktop {
                        display: flex !important;
                    }
                    .formation-carousel-container {
                        border-radius: 0 !important;
                        border-left: none !important;
                        border-right: none !important;
                        margin-left: -20px !important;
                        margin-right: -20px !important;
                        width: calc(100% + 40px) !important;
                        height: 90vh !important;
                    }
                    .formation-image-wrapper {
                        padding: 0 !important;
                        position: relative;
                        overflow: hidden;
                    }
                    .formation-image {
                        border-radius: 0 !important;
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 90vh !important;
                        height: 100vw !important;
                        object-fit: fill !important;
                        transform: translate(-50%, -50%) rotate(90deg) !important;
                        transform-origin: center center;
                    }
                    .formation-nav-btn {
                        width: 45px !important;
                        height: 45px !important;
                        border-radius: 50% !important;
                    }
                    .formation-nav-btn.left {
                        top: 15px !important;
                        left: 50% !important;
                        transform: translateX(-50%) rotate(90deg) !important;
                    }
                    .formation-nav-btn.right {
                        bottom: 15px !important;
                        top: auto !important;
                        right: auto !important;
                        left: 50% !important;
                        transform: translateX(-50%) rotate(90deg) !important;
                    }
                }
            `}</style>
        </div>
    );
}
