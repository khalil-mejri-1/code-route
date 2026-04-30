import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../comp/navbar';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { ChevronLeft, Lock, Save, Settings, X, Trash2 } from 'lucide-react';
import { IMGBB_API_KEY, IMGBB_UPLOAD_URL } from '../config';

const CardComponent = ({ id, category, description, image, order, visible, isFree, isLoggedIn, isSubscribed, isAdmin, isApproved, userAllowedCategories, topicCount, onEditContent, onDelete }) => {
    const navigate = useNavigate();
    
    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (window.confirm(`هل أنت متأكد من حذف صنف ${category}؟ سيعتبر هذا الإجراء نهائياً.`)) {
            onDelete(id);
        }
    };

    let isCardDisabled;
    let overlayMessage;

    if (isAdmin || isFree) {
        isCardDisabled = false;
        overlayMessage = "";
    } else if (!isLoggedIn) {
        isCardDisabled = true;
        overlayMessage = "سجّل الدخول للمتابعة";
    } else if (!isApproved) {
        isCardDisabled = true;
        overlayMessage = "في انتظار موافقة الإدارة...";
    } else if (userAllowedCategories && userAllowedCategories.length > 0 && !userAllowedCategories.includes(category)) {
        isCardDisabled = true;
        overlayMessage = "غير مسموح لك بدخول هذا الصنف";
    } else if (!isSubscribed) {
        isCardDisabled = true;
        overlayMessage = "هذا الصنف متاح للمشتركين فقط";
    } else {
        isCardDisabled = false;
        overlayMessage = "";
    }

    const handleCardClick = () => {
        if (isCardDisabled) return;

        // "Root Fix": Use topicCount from the API for instant navigation
        if (!order && order !== 0) { /* placeholder for future logic if needed */ }
        
        // Use props directly for zero-latency switching
        const currentTopicCount = topicCount || 0;

        if (currentTopicCount === 0) {
            navigate(`/cours/series?category=${encodeURIComponent(category)}`);
        } else {
            navigate(`/Cours_question?category=${encodeURIComponent(category)}`);
        }
    };

    return (
        <div 
            className={`premium-card reveal-anim ${isCardDisabled ? 'disabled' : ''}`}
            style={{ position: 'relative', cursor: isCardDisabled ? 'default' : 'pointer' }}
            onClick={handleCardClick}
        >
            {/* Settings button removed from here, moved to card-body-premium */}
            <div className="card-img-wrapper">
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
                <div className="badge-float" style={{ background: (category === 'B' || isFree) ? 'var(--secondary)' : 'var(--primary)' }}>
                    {(category === 'B' || isFree) ? 'مجاني' : 'دروس VIP'}
                </div>
                <h3 className="card-title-premium">صنف {category}</h3>
                <p className="card-desc-premium">{description}</p>
                
                {visible === false && isAdmin && (
                    <div style={{ background: '#f43f5e', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block', marginTop: '10px' }}>
                        مخفية عن الطلاب 🚫
                    </div>
                )}
                
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {isAdmin ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditContent({ _id: id, category, description, image, order, visible, isFree });
                                }}
                                className="btn-premium-sm"
                                style={{ padding: '8px 16px', fontSize: '12px', background: 'var(--bg-accent)', color: 'var(--primary)', border: '1px solid var(--primary-glow)' }}
                            >
                                تعديل المحتوى
                            </button>
                            <button 
                                onClick={handleDeleteClick}
                                style={{ 
                                    background: 'rgba(239, 68, 68, 0.1)', 
                                    border: '1px solid rgba(239, 68, 68, 0.2)', 
                                    color: '#ef4444', 
                                    padding: '8px', 
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                title="حذف الفئة"
                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
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

export default function Cours() {
    const [licenseCategories, setLicenseCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isApproved, setIsApproved] = useState(localStorage.getItem('isApproved') === 'true');
    const [userAllowedCategories, setUserAllowedCategories] = useState([]);

    const isLoggedIn = localStorage.getItem('login') === 'true';
    const isSubscribed = localStorage.getItem('subscriptions') === 'true';
    const isAdmin = localStorage.getItem('role') === 'admin';

    const fetchUserStatus = async () => {
        const email = localStorage.getItem('userEmail');
        if (isLoggedIn && email) {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/status?email=${email}`);
                const { isApproved: approvedStatus, isFrozen, role, allowedCategories } = response.data;
                
                if (isFrozen) {
                    // الحساب مجمد، تسجيل الخروج فوراً
                    localStorage.removeItem('login');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userFullName');
                    localStorage.removeItem('role');
                    window.location.href = '/login';
                    return;
                }

                setIsApproved(approvedStatus);
                setUserAllowedCategories(allowedCategories || []);
                localStorage.setItem('isApproved', approvedStatus.toString());
                if (role) localStorage.setItem('role', role);
            } catch (error) {
                console.error('Error fetching user status:', error);
            }
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [newImageFile, setNewImageFile] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editOrder, setEditOrder] = useState(0);
    const [editVisible, setEditVisible] = useState(true);
    const [editIsFree, setEditIsFree] = useState(false);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/categories`);
            setLicenseCategories(response.data);
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
        setEditOrder(cat.order || 0);
        setEditVisible(cat.visible !== undefined ? cat.visible : true);
        setEditIsFree(cat.isFree !== undefined ? cat.isFree : false);
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

    const handleDeleteCategory = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/categories/${id}`);
            fetchCategories();
            alert("✅ تم حذف الفئة بنجاح!");
        } catch (err) {
            console.error(err);
            alert("❌ فشل حذف الفئة.");
        }
    };

    const handleSaveCategory = async () => {
        setUploading(true);
        try {
            let uploadedUrl = selectedCategory.image;
            if (newImageFile) {
                uploadedUrl = await uploadToImgBB(newImageFile);
            }
            
            await axios.put(`${API_BASE_URL}/categories/${selectedCategory._id}`, {
                category: editCategoryName,
                description: editDescription,
                image: uploadedUrl,
                order: parseInt(editOrder),
                visible: editVisible,
                isFree: editIsFree
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
                     <span className="badge-new">المكتبة التعليمية</span>
                     <h1 className="page-title">اختر فئة <span className="accent">رخصة القيادة</span></h1>
                     <p className="hero-desc" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        نقدم لك محتوى تعليمي متخصص لكل فئة، مصمم لمساعدتك على النجاح من المرة الأولى.
                     </p>
                </div>

                <div className="cards-grid">
                    {licenseCategories
                        .filter(item => isAdmin || item.visible !== false)
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((item, index) => (
                        <CardComponent
                            key={index}
                            id={item._id}
                            category={item.category}
                            description={item.description}
                            image={item.image}
                            order={item.order}
                            visible={item.visible}
                            isFree={item.isFree}
                            isLoggedIn={isLoggedIn}
                            isSubscribed={isSubscribed}
                            isAdmin={isAdmin}
                            isApproved={isApproved}
                            userAllowedCategories={userAllowedCategories}
                            topicCount={item.topicCount}
                            onEditContent={openEditModal}
                            onDelete={handleDeleteCategory}
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
                                <X size={24} />
                            </button>
                            
                            <div style={{ marginBottom: '25px' }}>
                                <div style={{ width: '60px', height: '60px', background: 'var(--primary-glow)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', margin: '0 auto 15px' }}>
                                    <Settings size={30} />
                                </div>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a202c', marginBottom: '8px' }}>تعديل بيانات الفئة</h2>
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

                            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4a5568' }}>الترتيب (Order):</label>
                                <input 
                                    type="number" 
                                    value={editOrder}
                                    onChange={(e) => setEditOrder(e.target.value)}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px' }}
                                />
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 700, color: '#4a5568', margin: 0 }}>الحالة (إظهار الفئة):</label>
                                <button 
                                    onClick={() => setEditVisible(!editVisible)}
                                    style={{ 
                                        padding: '8px 20px', 
                                        borderRadius: '20px', 
                                        border: 'none', 
                                        background: editVisible ? '#10b981' : '#f43f5e', 
                                        color: 'white', 
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {editVisible ? 'ظاهرة ✅' : 'مخفية ❌'}
                                </button>
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 700, color: '#4a5568', margin: 0 }}>نوع الدرس (مجاني أم مدفوع):</label>
                                <button 
                                    onClick={() => setEditIsFree(!editIsFree)}
                                    style={{ 
                                        padding: '8px 20px', 
                                        borderRadius: '20px', 
                                        border: 'none', 
                                        background: editIsFree ? '#10b981' : '#f59e0b', 
                                        color: 'white', 
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {editIsFree ? 'مجاني 🎁' : 'مدفوع 💰'}
                                </button>
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '25px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4a5568' }}>صورة الفئة:</label>
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
                                    gap: '10px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Save size={20} />
                                {uploading ? 'جاري الحفظ...' : 'حفظ جميع التغييرات'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
