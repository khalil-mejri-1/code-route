import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../comp/navbar';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Lock, Play, CircleCheckBig, Trophy, ArrowLeft, X, Save, Settings } from 'lucide-react';
import PremiumModal from '../comp/PremiumModal';

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

// ===== كارد السلسلة =====
function SerieCard({ serieNum, serieName, serieSubName, isLocked, categoryParam, isLoggedIn, isAdmin, onEdit, onLockedClick }) {
    const [isChecked, setIsChecked] = useState(() => {
        const saved = localStorage.getItem(`checked_serie_${categoryParam}_${serieNum}`);
        return saved === 'true';
    });

    const toggleCheck = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newValue = !isChecked;
        setIsChecked(newValue);
        localStorage.setItem(`checked_serie_${categoryParam}_${serieNum}`, newValue);
    };

    return (
        <Link
            to={!isLocked ? `/serie?category=${encodeURIComponent(categoryParam)}&nb_serie=${serieNum}` : '#'}
            className={`premium-card reveal-anim ${isLocked ? 'disabled' : ''}`}
            style={{ position: 'relative' }}
            onClick={(e) => {
                if (isLocked) {
                    e.preventDefault();
                    onLockedClick();
                }
            }}
        >
            {isLocked && (
                <div className="overlay-premium">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <Lock size={32} color="var(--primary)" />
                        <p style={{ fontSize: '14px' }}>محتوى VIP</p>
                    </div>
                </div>
            )}
            
            <div className="card-body-premium" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: '220px', justifyContent: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: 'var(--bg-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '20px' }}>
                    <Play size={24} fill="currentColor" />
                </div>
                <h3 className="card-title-premium" style={{ fontSize: '28px', marginBottom: '4px' }}>{serieName}</h3>
                {serieSubName && (
                    <p style={{ color: 'var(--primary)', fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>{serieSubName}</p>
                )}
                <p style={{ color: 'var(--text-gray)', fontSize: '14px' }}>انقر للبدء في دراسة هذه السلسلة</p>
                
                <div style={{ marginTop: '20px', width: '100%' }}>
                    {isAdmin && (
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onEdit({ num: serieNum, name: serieName, subName: serieSubName });
                            }}
                            className="btn-premium-sm"
                            style={{ 
                                background: 'rgba(255,255,255,0.1)', 
                                border: '1px solid rgba(255,255,255,0.2)', 
                                color: 'white',
                                fontSize: '12px',
                                padding: '6px 15px',
                                borderRadius: '10px'
                            }}
                        >
                            تعديل السلسلة
                        </button>
                    )}
                </div>

                {isAdmin && (
                    <div 
                        onClick={toggleCheck}
                        style={{ 
                            position: 'absolute', 
                            top: '18px', 
                            left: '18px', 
                            cursor: 'pointer', 
                            color: isChecked ? '#10b981' : 'rgba(255,255,255,0.15)',
                            transition: 'all 0.3s ease',
                            zIndex: 10
                        }}
                        title="تحديد"
                    >
                        <CircleCheckBig 
                            size={24} 
                            strokeWidth={isChecked ? 2.5 : 1.5} 
                        />
                    </div>
                )}
            </div>
        </Link>
    );
}

// ===== كارد الاختبار الشامل للموضوع =====
function TopicExamCard({ category1, category2, isSubscribed, isLoggedIn }) {
    const navigate = useNavigate();

    // بناء رابط الاختبار:
    // للفئة B: /full-exam?category=B (كل الأسئلة)
    // لغيرها: /Examen?category=X / Y&nb_serie=... لكن هنا نريد اختبار الموضوع الفرعي كاملاً
    // نستخدم examen_series للموضوع الفرعي
    const encodedCategory = category2
        ? `${encodeURIComponent(category1)} / ${encodeURIComponent(category2)}`
        : encodeURIComponent(category1);

    // توجيه إلى نافذة الـ 24 اختبار
    const examLink = `/exams-list?category=${encodedCategory}`;

    const isLocked = !isLoggedIn;

    return (
        <Link
            to={!isLocked ? examLink : '#'}
            className="premium-card reveal-anim exam-card-special"
            onClick={(e) => {
                if (isLocked) {
                    e.preventDefault();
                    alert("سجّل الدخول لبدء الاختبار.");
                }
            }}
        >
            {/* خلفية متوهجة */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(59, 130, 246, 0.08))',
                zIndex: 0
            }}></div>

            {isLocked && (
                <div className="overlay-premium">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <Lock size={32} color="var(--primary)" />
                        <p style={{ fontSize: '14px' }}>سجّل الدخول أولاً</p>
                    </div>
                </div>
            )}

            <div style={{ 
                background: 'var(--bg-accent)', borderRadius: '24px', overflow: 'hidden', 
                height: '100%', display: 'flex', flexDirection: 'column',
                border: '1px solid var(--glass-border)', boxShadow: '0 15px 35px -10px rgba(0,0,0,0.3)'
            }}>
                {/* الجزء العلوي: الصورة */}
                <div style={{ width: '100%', height: '160px', position: 'relative' }}>
                    <img 
                        src="https://i.ibb.co/7xmxRRMm/e0905461a321.jpg" 
                        alt="Exam" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ 
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px',
                        background: 'linear-gradient(to top, var(--bg-accent), transparent)'
                    }}></div>
                </div>

                {/* الجزء السفلي: النصوص والأزرار */}
                <div className="card-body-premium" style={{ 
                    padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', 
                    alignItems: 'center', textAlign: 'center', justifyContent: 'space-between', gap: '15px'
                }}>
                    <div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '5px' }}>
                            اختبار الموضوع
                        </span>
                        <h3 className="card-title-premium" style={{ fontSize: '22px', marginBottom: '5px' }}>
                            اختبر مستواك 🏆
                        </h3>
                        <p style={{ color: 'var(--text-gray)', fontSize: '14px', lineHeight: '1.4' }}>
                            خض اختبار تقييمي شامل لجميع سلاسل هذا الموضوع
                        </p>
                    </div>

                    {!isSubscribed && (
                        <div style={{
                            background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: '10px', padding: '6px 12px', fontSize: '11px', color: 'var(--secondary)', fontWeight: 700
                        }}>
                            ⚡ أول 5 أسئلة مجانية
                        </div>
                    )}

                    <div className="card-nav-btn" style={{
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        color: 'white', border: 'none', width: '45px', height: '45px',
                        boxShadow: '0 8px 15px -5px var(--primary-glow)', alignSelf: 'center'
                    }}>
                        <ArrowLeft size={18} />
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ===== الصفحة الرئيسية =====
export default function CoursSeries() {
    const location = useLocation();
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedSerieNum, setSelectedSerieNum] = useState(null);
    const [newSerieNum, setNewSerieNum] = useState('');
    const [serieName, setSerieName] = useState('');
    const [serieSubName, setSerieSubName] = useState('');
    const [targetCategory, setTargetCategory] = useState('');
    const [updating, setUpdating] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    const [isAdmin, setIsAdmin] = useState(localStorage.getItem('role') === 'admin');

    const LICENSE_TYPES = ["B", "A", "AA", "Z", "D", "CE", "C", "امتحانات"];

    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    const { category1, category2 } = parseCategoryParam(categoryParam);

    const isLoggedIn = localStorage.getItem('login') === 'true';
    const isSubscribed = localStorage.getItem('subscriptions') === 'true';

    const fetchUserStatus = async () => {
        const email = localStorage.getItem('userEmail');
        if (isLoggedIn && email) {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/status?email=${email}`);
                const { isFrozen, role, subscriptions } = response.data;
                
                if (isFrozen) {
                    localStorage.removeItem('login');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userFullName');
                    localStorage.removeItem('role');
                    localStorage.removeItem('subscriptions');
                    window.location.href = '/login';
                    return;
                }

                if (role) {
                    localStorage.setItem('role', role);
                    setIsAdmin(role === 'admin');
                }

                if (subscriptions !== undefined) {
                    localStorage.setItem('subscriptions', subscriptions.toString());
                    window.dispatchEvent(new Event('storage'));
                }
            } catch (error) {
                console.error('Error fetching user status:', error);
            }
        }
    };

    const fetchSeries = async () => {
        if (!category1) {
            setError('فئة غير صحيحة.');
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(`${API_BASE_URL}/quiz/series`, {
                params: { category1, category2 }
            });
            setSeries(response.data);
        } catch (err) {
            console.error("Error fetching series:", err);
            setError('فشل في جلب السلاسل.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeries();
        fetchUserStatus();
    }, [category1, category2]);

    const openEditModal = (serie) => {
        setSelectedSerieNum(serie.num);
        setNewSerieNum(serie.num);
        setSerieName(serie.name);
        setSerieSubName(serie.subName || '');
        setTargetCategory(category1); // الافتراضي هو الصنف الحالي
        setShowModal(true);
    };

    const handleUpdateSeries = async () => {
        if (!newSerieNum || isNaN(newSerieNum)) return alert("يرجى إدخال رقم صحيح.");
        
        setUpdating(true);
        try {
            await axios.put(`${API_BASE_URL}/quiz/series/rename`, {
                category1,
                category2,
                oldSerieNum: selectedSerieNum,
                newSerieNum: parseInt(newSerieNum),
                serieName: serieName,
                serieSubName: serieSubName,
                newCategory1: targetCategory !== category1 ? targetCategory : undefined
            });
            setShowModal(false);
            fetchSeries();
            alert("✅ تم تحديث بيانات السلسلة بنجاح!");
        } catch (err) {
            console.error(err);
            alert("❌ فشل تحديث السلسلة.");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
            <Navbar />
            <div className="page-container">
                <header className="page-header reveal-anim">
                    <span className="badge-new">{category1} {category2 && `- ${category2}`}</span>
                    <h1 className="page-title">اختيار <span className="accent">السلسلة</span></h1>
                    <p className="hero-desc">المواضيع مقسمة إلى سلاسل، كل سلسلة تحتوي على مجموعة من الدروس المركزة لتسهيل عملية المراجعة.</p>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px', color: 'var(--primary)', fontWeight: 800 }}>جاري التحميل...</div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '100px', color: '#f43f5e' }}>{error}</div>
                ) : (
                    <>
                        {/* سلاسل الدروس */}
                        <div className="cards-grid">
                            {series.map((s) => (
                                <SerieCard
                                    key={s.nb_serie}
                                    serieNum={s.nb_serie}
                                    serieName={s.serieName}
                                    serieSubName={s.serieSubName}
                                    isLocked={!isSubscribed && s.nb_serie > 1}
                                    categoryParam={categoryParam}
                                    isLoggedIn={isLoggedIn}
                                    isAdmin={isAdmin}
                                    onEdit={openEditModal}
                                    onLockedClick={() => setShowPremiumModal(true)}
                                />
                            ))}
                        </div>

                        {/* --- فاصل وكارد الاختبار --- */}
                        {category1 !== 'B' && (
                            <div style={{ marginTop: '60px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', direction: 'rtl' }}>
                                    <div style={{ width: '4px', height: '28px', background: 'var(--secondary)', borderRadius: '4px' }}></div>
                                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-white)' }}>اختبر مستواك في هذا الموضوع</h2>
                                </div>
                                <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                                    <TopicExamCard
                                        category1={category1}
                                        category2={category2}
                                        isSubscribed={isSubscribed}
                                        isLoggedIn={isLoggedIn}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* MODAL للتعديل */}
                {showModal && (
                    <div className="overlay-premium" style={{ opacity: 1, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
                        <div className="reveal-anim" style={{ background: 'white', width: '95%', maxWidth: '400px', borderRadius: '24px', padding: '35px', position: 'relative', textAlign: 'center' }}>
                            <button 
                                onClick={() => setShowModal(false)}
                                style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                            
                            <div style={{ marginBottom: '25px' }}>
                                <div style={{ width: '60px', height: '60px', background: 'var(--bg-accent)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', margin: '0 auto 15px' }}>
                                    <Settings size={30} />
                                </div>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a202c', marginBottom: '8px' }}>تعديل السلسلة</h2>
                                <p style={{ color: '#718096', fontSize: '14px' }}>أنت الآن تقوم بتعديل السلسلة: {serieName}</p>
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4a5568' }}>نقل إلى فئة أخرى:</label>
                                <select 
                                    value={targetCategory}
                                    onChange={(e) => setTargetCategory(e.target.value)}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', background: 'white' }}
                                >
                                    {LICENSE_TYPES.map(type => (
                                        <option key={type} value={type}>صنف {type}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4a5568' }}>اسم السلسلة:</label>
                                <input 
                                    type="text" 
                                    value={serieName}
                                    onChange={(e) => setSerieName(e.target.value)}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px' }}
                                    placeholder="مثال: السلسلة 1"
                                />
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4a5568' }}>الاسم الفرعي (مثل AA):</label>
                                <input 
                                    type="text" 
                                    value={serieSubName}
                                    onChange={(e) => setSerieSubName(e.target.value)}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px' }}
                                    placeholder="مثال: AA"
                                />
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '25px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4a5568' }}>رقم السلسلة (للترتيب):</label>
                                <input 
                                    type="number" 
                                    value={newSerieNum}
                                    onChange={(e) => setNewSerieNum(e.target.value)}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '16px', textAlign: 'center' }}
                                />
                            </div>

                            <button 
                                onClick={handleUpdateSeries}
                                disabled={updating}
                                style={{ 
                                    width: '100%', 
                                    padding: '16px', 
                                    borderRadius: '16px', 
                                    background: updating ? '#cbd5e0' : 'var(--primary)', 
                                    color: 'white', 
                                    border: 'none', 
                                    fontWeight: 800, 
                                    fontSize: '16px', 
                                    cursor: updating ? 'not-allowed' : 'pointer',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '10px'
                                }}
                            >
                                <Save size={20} />
                                {updating ? 'جاري التحديث...' : 'حفظ التغييرات'}
                            </button>
                        </div>
                    </div>
                )}

                <PremiumModal 
                    isOpen={showPremiumModal} 
                    onClose={() => setShowPremiumModal(false)} 
                />
            </div>
        </div>
    );
}
