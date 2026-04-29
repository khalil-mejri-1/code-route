import React, { useState, useEffect } from 'react';
import Navbar from '../comp/navbar';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Trophy, Lock, ChevronLeft, Settings, X, Save, Upload } from 'lucide-react';
import { IMGBB_API_KEY, IMGBB_UPLOAD_URL } from '../config';

function CardComponent({ id, category, description, image, isLoggedIn, isSubscribed, isAdmin, isApproved, onEditContent }) {
    const navigate = useNavigate();
    let isCardDisabled;
    let overlayMessage;

    if (!isLoggedIn) {
        isCardDisabled = true;
        overlayMessage = "سجّل الدخول للمتابعة";
    } else if (!isApproved && !isAdmin) {
        isCardDisabled = true;
        overlayMessage = "في انتظار موافقة الإدارة...";
    } else if (!isSubscribed && category !== "B" && !isAdmin) {
        isCardDisabled = true;
        overlayMessage = "هذا الاختبار متاح للمشتركين فقط";
    } else {
        isCardDisabled = false;
        overlayMessage = "";
    }

    const handleCardClick = async () => {
        if (isCardDisabled) return;

        try {
            const res = await axios.get(`${API_BASE_URL}/topics?category=${encodeURIComponent(category)}`);
            if (res.data.length === 0) {
                navigate(`/examen/series?category=${encodeURIComponent(category)}`);
            } else {
                navigate(`/examen_question?category=${encodeURIComponent(category)}`);
            }
        } catch (error) {
            console.error("Error checking topics:", error);
            navigate(`/examen_question?category=${encodeURIComponent(category)}`);
        }
    };

    return (
        <div 
            className={`premium-card reveal-anim ${isCardDisabled ? 'disabled' : ''}`}
            style={{ position: 'relative' }}
        >
            <div className="card-img-wrapper" onClick={handleCardClick}>
                <img src={image} alt={category} />
                {isCardDisabled && (
                    <div className="overlay-premium">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                            <Lock size={40} color="var(--primary)" />
                            <p>{overlayMessage}</p>
                            {!isLoggedIn ? (
                                <button className="btn-premium-sm" onClick={() => navigate('/login')}>تسجيل الدخول</button>
                            ) : (
                                <button className="btn-premium-sm" onClick={() => navigate('/subscriptions')}>اشترك الآن</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="card-body-premium">
                <div className="badge-float" style={{ background: category === 'B' ? 'var(--secondary)' : 'var(--primary)' }}>
                    {category === 'B' ? 'تجريبي' : 'اختبار VIP'}
                </div>
                <h3 className="card-title-premium">اختبارات صنف {category}</h3>
                <p className="card-desc-premium">{description.replace('دروس', 'اختبارات')}</p>
                
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {isAdmin ? (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditContent({ id, category, description, image });
                            }}
                            className="btn-premium-sm"
                            style={{ padding: '8px 16px', fontSize: '12px', background: 'var(--bg-accent)', color: 'var(--primary)', border: '1px solid var(--primary-glow)' }}
                        >
                            تعديل المحتوى
                        </button>
                    ) : (
                        <div></div>
                    )}
                    <div className="card-nav-btn">
                        <ChevronLeft size={24} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Examen() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isApproved, setIsApproved] = useState(localStorage.getItem('isApproved') === 'true');

    const isLoggedIn = localStorage.getItem('login') === 'true';
    const isSubscribed = localStorage.getItem('subscriptions') === 'true';
    const isAdmin = localStorage.getItem('role') === 'admin';

    const fetchUserStatus = async () => {
        const email = localStorage.getItem('userEmail');
        if (isLoggedIn && email) {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/status?email=${email}`);
                const { isApproved: approvedStatus, isFrozen, role } = response.data;

                if (isFrozen) {
                    localStorage.removeItem('login');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userFullName');
                    localStorage.removeItem('role');
                    window.location.href = '/login';
                    return;
                }

                setIsApproved(approvedStatus);
                localStorage.setItem('isApproved', approvedStatus.toString());
                if (role) localStorage.setItem('role', role);
            } catch (error) {
                console.error('Error fetching user status:', error);
            }
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchUserStatus();
    }, []);

    const openEditModal = (cat) => {
        setSelectedCategory(cat);
        setPreviewUrl(cat.image);
        setEditCategoryName(cat.category);
        setEditDescription(cat.description);
        setNewImageFile(null);
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
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

    const handleSaveCategory = async () => {
        setUploading(true);
        try {
            let uploadedUrl = selectedCategory.image;
            if (newImageFile) {
                uploadedUrl = await uploadToImgBB(newImageFile);
            }
            
            await axios.put(`${API_BASE_URL}/categories/${selectedCategory.id}`, {
                category: editCategoryName,
                description: editDescription,
                image: uploadedUrl
            });
            setShowModal(false);
            fetchCategories();
            alert("✅ تم تحديث بيانات الفئة بنجاح!");
        } catch (err) {
            console.error(err);
            alert("❌ فشل تحديث البيانات.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="reveal-anim" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '24px' }}>جاري التحميل...</div>
            </div>
        );
    }

    return (
        <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
            <Navbar />
            <div className="page-container">
                <div className="page-header reveal-anim">
                     <span className="badge-new">مركز الاختبارات</span>
                     <h1 className="page-title">مستعد <span className="accent">للتحدي؟</span></h1>
                     <p className="hero-desc" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        اختر فئتك وابدأ اختبارات تحاكي الواقع تماماً. قيم مستواك الآن واضمن نجاحك في الامتحان الرسمي.
                     </p>
                </div>

                <div className="cards-grid">
                    {categories.map((item, index) => (
                        <CardComponent
                            key={index}
                            id={item._id}
                            category={item.category}
                            description={item.description}
                            image={item.image}
                            isLoggedIn={isLoggedIn}
                            isSubscribed={isSubscribed}
                            isAdmin={isAdmin}
                            isApproved={isApproved}
                            onEditContent={openEditModal}
                        />
                    ))}
                </div>

                {showModal && (
                    <div className="overlay-premium" style={{ opacity: 1, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
                        <div className="reveal-anim" style={{ background: 'white', width: '95%', maxWidth: '500px', borderRadius: '24px', padding: '35px', position: 'relative', textAlign: 'center', maxHeight: '90vh', overflowY: 'auto' }}>
                            <button 
                                onClick={() => setShowModal(false)}
                                style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
                            >
                                <X size={24} color="#000" />
                            </button>
                            
                            <div style={{ marginBottom: '25px' }}>
                                <div style={{ width: '60px', height: '60px', background: 'var(--primary-glow)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', margin: '0 auto 15px' }}>
                                    <Trophy size={30} />
                                </div>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a202c', marginBottom: '8px' }}>تعديل بيانات الاختبار</h2>
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4a5568' }}>اسم الفئة:</label>
                                <input 
                                    type="text" 
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px' }}
                                />
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4a5568' }}>الوصف:</label>
                                <textarea 
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows="3"
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', fontFamily: 'inherit' }}
                                ></textarea>
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '25px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4a5568' }}>صورة الاختبار:</label>
                                <div style={{ width: '100%', height: '150px', background: '#f7fafc', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e2e8f0', position: 'relative' }}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <span style={{ color: '#a0aec0' }}>لم يتم اختيار صورة</span>
                                    )}
                                    <label style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'var(--primary)', color: 'white', padding: '6px 12px', borderRadius: '30px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                                        تغيير الرابط
                                        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>

                            <button 
                                onClick={handleSaveCategory}
                                disabled={uploading}
                                style={{ 
                                    width: '100%', 
                                    padding: '16px', 
                                    borderRadius: '16px', 
                                    background: uploading ? '#cbd5e0' : 'var(--primary)', 
                                    color: 'white', 
                                    border: 'none', 
                                    fontWeight: 800, 
                                    fontSize: '16px', 
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '10px'
                                }}
                            >
                                {uploading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}