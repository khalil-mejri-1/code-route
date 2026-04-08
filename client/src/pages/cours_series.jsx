import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../comp/navbar';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Lock, Play, CircleCheckBig, Trophy, ArrowLeft } from 'lucide-react';

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
function SerieCard({ serieNum, isLocked, categoryParam, isLoggedIn }) {
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
            onClick={(e) => {
                if (isLocked) {
                    e.preventDefault();
                    alert("هذه السلسلة متاحة للمشتركين فقط. يرجى الاشتراك لفتح جميع السلاسل.");
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
                <h3 className="card-title-premium" style={{ fontSize: '28px', marginBottom: '8px' }}>السلسلة {serieNum}</h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '14px' }}>انقر للبدء في دراسة هذه السلسلة</p>
                
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

            <div className="card-body-premium" style={{
                position: 'relative', zIndex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', minHeight: '220px', justifyContent: 'center', gap: '16px'
            }}>
                <div style={{
                    width: '64px', height: '64px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', boxShadow: '0 10px 25px -5px var(--secondary-glow)'
                }}>
                    <Trophy size={28} />
                </div>

                <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '8px' }}>
                        اختبار الموضوع
                    </span>
                    <h3 className="card-title-premium" style={{ fontSize: '24px', marginBottom: '8px' }}>
                        اختبر مستواك 🏆
                    </h3>
                    <p style={{ color: 'var(--text-gray)', fontSize: '14px', lineHeight: '1.6', maxWidth: '260px' }}>
                        خض اختبار تقييمي شامل لجميع سلاسل هذا الموضوع
                    </p>
                </div>

                {!isSubscribed && (
                    <div style={{
                        background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)',
                        borderRadius: '10px', padding: '8px 16px', fontSize: '12px', color: 'var(--secondary)', fontWeight: 700
                    }}>
                        ⚡ أول 5 أسئلة مجانية
                    </div>
                )}

                <div className="card-nav-btn" style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: 'white', borderColor: 'transparent',
                    boxShadow: '0 8px 20px -5px var(--primary-glow)'
                }}>
                    <ArrowLeft size={18} />
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

    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    const { category1, category2 } = parseCategoryParam(categoryParam);

    const isLoggedIn = localStorage.getItem('login') === 'true';
    const isSubscribed = localStorage.getItem('subscriptions') === 'true';

    useEffect(() => {
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
        fetchSeries();
    }, [category1, category2]);

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
                            {series.map((serieNum) => (
                                <SerieCard
                                    key={serieNum}
                                    serieNum={serieNum}
                                    isLocked={!isSubscribed && serieNum > 1}
                                    categoryParam={categoryParam}
                                    isLoggedIn={isLoggedIn}
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
            </div>
        </div>
    );
}
