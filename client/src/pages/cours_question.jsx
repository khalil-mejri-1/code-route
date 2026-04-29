import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../comp/navbar';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Lock, ArrowLeft, Trophy, BookOpen, Settings, Upload, X, Save } from 'lucide-react';
import { IMGBB_API_KEY, IMGBB_UPLOAD_URL } from '../config';

// ===== كارد الدروس العادية =====
function TopicCard({ id, idDoc, category, image, isLoggedIn, isSubscribed, mainCategory, isAdmin, onEditContent }) {
    let isCardDisabled;
    let overlayMessage;

    if (!isLoggedIn) {
        isCardDisabled = true;
        overlayMessage = "سجّل الدخول للمتابعة";
    } else if (!isSubscribed && id !== 1) {
        isCardDisabled = true;
        overlayMessage = "هذا الموضوع متاح للمشتركين فقط";
    } else {
        isCardDisabled = false;
        overlayMessage = "";
    }

    const newCategoryParam = encodeURIComponent(mainCategory.trim()) + ' / ' + encodeURIComponent(category.trim());
    const Wrapper = isCardDisabled ? 'div' : Link;
    const linkProps = !isCardDisabled ? { to: `/cours/series?category=${newCategoryParam}` } : {};

    return (
        <Wrapper {...linkProps} className={`premium-card reveal-anim ${isCardDisabled ? 'disabled' : ''}`} style={{ position: 'relative' }}>
            <div className="card-img-wrapper">
                <img src={image} alt={category} />
                {isCardDisabled && (
                    <div className="overlay-premium">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                            <Lock size={40} color="var(--primary)" />
                            <p style={{ fontSize: '14px', maxWidth: '200px' }}>{overlayMessage}</p>
                            <button className="btn-premium-sm">
                                {!isLoggedIn ? 'سجّل دخول' : 'اشترك الآن'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="card-body-premium" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ padding: '6px', background: 'var(--bg-accent)', borderRadius: '10px', color: 'var(--primary)' }}>
                        <BookOpen size={16} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>درس</span>
                </div>
                <h3 className="card-title-premium" style={{ marginBottom: '8px' }}>{category}</h3>
                <p className="card-desc-premium">استكشف قواعد {category} ضمن صنف {mainCategory} بأسلوب تعليمي متطور.</p>
                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {isAdmin ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onEditContent({ id: idDoc, name: category, image: image });
                            }}
                            className="btn-premium-sm"
                            style={{ padding: '6px 14px', fontSize: '11px', background: 'var(--bg-accent)', color: 'var(--primary)', border: '1px solid var(--primary-glow)', borderRadius: '10px' }}
                        >
                            تعديل
                        </button>
                    ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>ابدأ الآن</span>
                    )}
                    <div className="card-nav-btn"><ArrowLeft size={18} /></div>
                </div>
            </div>
        </Wrapper>
    );
}

// ===== كارد الاختبار الشامل =====
function ExamCard({ mainCategory, isLoggedIn, isSubscribed }) {
    const examLink = `/exams-list?category=${encodeURIComponent(mainCategory)}`;

    const isLocked = !isLoggedIn;
    const Wrapper = isLocked ? 'div' : Link;
    const linkProps = !isLocked ? { to: examLink } : {};

    return (
        <Wrapper {...linkProps} className={`premium-card reveal-anim exam-card-special ${isLocked ? 'disabled' : ''}`}>
            {/* خلفية متوهجة */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1))',
                zIndex: 0
            }}></div>

            {isLocked && (
                <div className="overlay-premium">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                        <Lock size={40} color="var(--primary)" />
                        <p style={{ fontSize: '14px', maxWidth: '200px' }}>سجّل الدخول لبدء الاختبار</p>
                        <button className="btn-premium-sm">سجّل دخول</button>
                    </div>
                </div>
            )}

            <div className="card-body-premium" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '280px', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ padding: '10px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '14px', color: 'white', boxShadow: '0 8px 20px -5px var(--primary-glow)' }}>
                            <Trophy size={22} />
                        </div>
                        <div>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>
                                اختبار شامل
                            </span>
                        </div>
                    </div>

                    <h3 className="card-title-premium" style={{ marginBottom: '12px', fontSize: '26px' }}>
                        الاختبار الشامل للفئة {mainCategory}
                    </h3>
                    <p className="card-desc-premium">
                        اختبار موحد يشمل جميع المحاور والسلاسل — محاكاة كاملة لامتحان الرخصة الرسمي.
                    </p>
                </div>

                {!isSubscribed && (
                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '12px', padding: '12px', marginTop: '16px', fontSize: '12px', color: 'var(--secondary)', textAlign: 'center', fontWeight: 700 }}>
                        ⚡ أول 5 أسئلة مجانية — اشترك للوصول الكامل
                    </div>
                )}

                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>ابدأ الاختبار</span>
                    <div className="card-nav-btn" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', borderColor: 'transparent' }}>
                        <ArrowLeft size={18} />
                    </div>
                </div>
            </div>
        </Wrapper>
    );
}

// ===== الصفحة الرئيسية =====
export default function Cours_question() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const isLoggedIn = localStorage.getItem('login') === 'true';
    const isSubscribed = localStorage.getItem('subscriptions') === 'true';
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem('role') === 'admin');

    const [showModal, setShowModal] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [newImageFile, setNewImageFile] = useState(null);
    const [editTopicName, setEditTopicName] = useState('');

    const location = useLocation();

    const urlParams = new URLSearchParams(location.search);
    const mainCategory = urlParams.get('category') || 'B';

    const fetchUserStatus = async () => {
        const email = localStorage.getItem('userEmail');
        if (isLoggedIn && email) {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/status?email=${email}`);
                const { isFrozen, role } = response.data;

                if (isFrozen) {
                    localStorage.removeItem('login');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userFullName');
                    localStorage.removeItem('role');
                    window.location.href = '/login';
                    return;
                }

                if (role) {
                    localStorage.setItem('role', role);
                    setIsAdmin(role === 'admin');
                }
            } catch (error) {
                console.error('Error fetching user status:', error);
            }
        }
    };

    const fetchTopics = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/topics?category=${encodeURIComponent(mainCategory)}`);
            setTopics(response.data);
        } catch (error) {
            console.error('Error fetching topics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopics();
        fetchUserStatus();
    }, [mainCategory]);

    const openEditModal = (topic) => {
        setSelectedTopic(topic);
        setPreviewUrl(topic.image);
        setEditTopicName(topic.name);
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

    const handleSaveTopic = async () => {
        setUploading(true);
        try {
            let uploadedUrl = selectedTopic.image;
            if (newImageFile) {
                uploadedUrl = await uploadToImgBB(newImageFile);
            }

            await axios.put(`${API_BASE_URL}/topics/${selectedTopic.id}`, {
                name: editTopicName,
                image: uploadedUrl
            });
            setShowModal(false);
            fetchTopics();
            alert("✅ تم تحديث بيانات الموضوع بنجاح!");
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
                <div className="reveal-anim" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '24px' }}>جاري تحميل المواضيع... 📚</div>
            </div>
        );
    }

    return (
        <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
            <Navbar />
            <div className="page-container">
                <div className="page-header reveal-anim">
                    <span className="badge-new"> {mainCategory}</span>
                    <h1 className="page-title">الدروس و <span className="accent">الاختبارات</span></h1>
                    <p className="hero-desc" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        اختر موضوعاً للتعلم التفاعلي، أو انطلق مباشرة في الاختبار الشامل لتقييم مستواك الكلي.
                    </p>
                </div>

                {/* قسم الدروس */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', direction: 'rtl' }}>
                        <div style={{ width: '4px', height: '28px', background: 'var(--primary)', borderRadius: '4px' }}></div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-white)' }}>مواضيع الدروس</h2>
                    </div>
                    <div className="cards-grid">
                        {topics.map((item, index) => (
                            <TopicCard
                                key={index}
                                id={index + 1}
                                idDoc={item._id}
                                category={item.name}
                                image={item.image}
                                isLoggedIn={isLoggedIn}
                                isSubscribed={isSubscribed}
                                mainCategory={mainCategory}
                                isAdmin={isAdmin}
                                onEditContent={openEditModal}
                            />
                        ))}
                    </div>
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
                                <div style={{ width: '60px', height: '60px', background: 'var(--secondary-glow)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', margin: '0 auto 15px' }}>
                                    <Settings size={30} />
                                </div>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a202c', marginBottom: '8px' }}>تعديل موضوع الدرس</h2>
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4a5568' }}>اسم الموضوع:</label>
                                <input
                                    type="text"
                                    value={editTopicName}
                                    onChange={(e) => setEditTopicName(e.target.value)}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px' }}
                                />
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '25px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4a5568' }}>صورة الموضوع:</label>
                                <div style={{ width: '100%', height: '180px', background: '#f7fafc', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e2e8f0', position: 'relative' }}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <span style={{ color: '#a0aec0' }}>لم يتم اختيار صورة</span>
                                    )}
                                    <label style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'var(--secondary)', color: 'white', padding: '8px 15px', borderRadius: '30px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                                        تغيير الصورة
                                        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveTopic}
                                disabled={uploading}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    background: uploading ? '#cbd5e0' : 'var(--secondary)',
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
                                {uploading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                        </div>
                    </div>
                )}

                {/* قسم الاختبارات */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', direction: 'rtl' }}>
                        <div style={{ width: '4px', height: '28px', background: 'var(--secondary)', borderRadius: '4px' }}></div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-white)' }}>الاختبارات</h2>
                    </div>
                    <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
                        <ExamCard
                            mainCategory={mainCategory}
                            isLoggedIn={isLoggedIn}
                            isSubscribed={isSubscribed}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
