import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../comp/navbar';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Lock, ArrowLeft, Trophy, BookOpen } from 'lucide-react';

// ===== كارد الدروس العادية =====
function TopicCard({ id, category, image, isLoggedIn, isSubscribed, mainCategory }) {
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
        <Wrapper {...linkProps} className={`premium-card reveal-anim ${isCardDisabled ? 'disabled' : ''}`}>
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
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>ابدأ الآن</span>
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
    const location = useLocation();

    const urlParams = new URLSearchParams(location.search);
    const mainCategory = urlParams.get('category') || 'B';

    useEffect(() => {
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
        fetchTopics();
    }, [mainCategory]);

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
                    <span className="badge-new">فئة {mainCategory}</span>
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
                                category={item.name}
                                image={item.image}
                                isLoggedIn={isLoggedIn}
                                isSubscribed={isSubscribed}
                                mainCategory={mainCategory}
                            />
                        ))}
                    </div>
                </div>

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
