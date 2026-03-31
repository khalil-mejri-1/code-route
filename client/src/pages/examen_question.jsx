import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../comp/navbar';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Lock, ArrowLeft } from 'lucide-react';

function CardComponent({ id, category, image, isLoggedIn, isSubscribed, mainCategory }) {
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
    const linkProps = !isCardDisabled ? { to: `/examen/series?category=${newCategoryParam}` } : {};

    return (
        <Wrapper {...linkProps} className={`premium-card reveal-anim ${isCardDisabled ? 'disabled' : ''}`}>
            <div className="card-img-wrapper">
                <img src={image} alt={category} />
                {isCardDisabled && (
                    <div className="overlay-premium">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                            <Lock size={40} color="var(--primary)" />
                            <p style={{ fontSize: '14px', maxWidth: '200px' }}>{overlayMessage}</p>
                            {!isLoggedIn ? (
                                <button className="btn-premium-sm">سجّل دخول</button>
                            ) : (
                                <button className="btn-premium-sm">اشترك الآن</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="card-body-premium">

                <h3 className="card-title-premium">{category}</h3>
                <p className="card-desc-premium">قيّم مستواك في قواعد {category} ضمن صنف {mainCategory} بأسلوب محاكاة واقعي.</p>

                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600 }}>بدأ الاختبار</span>
                    <div className="card-nav-btn">
                        <ArrowLeft size={18} />
                    </div>
                </div>
            </div>
        </Wrapper>
    );
}

export default function Examen_question() {
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
                <div className="reveal-anim" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '24px' }}>جاري تحميل الاختبارات... ✍️</div>
            </div>
        );
    }

    return (
        <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
            <Navbar />
            <div className="page-container">
                <div className="page-header reveal-anim">
                    <span className="badge-new">محاور اختبارات فئة {mainCategory}</span>
                    <h1 className="page-title">مركز <span className="accent">الاختبارات</span></h1>
                    <p className="hero-desc" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        اختر المحور الذي تريد اختباره وتأكد من جاهزيتك الكاملة للامتحان الرسمي من خلال أسئلة محاكاة واقعية.
                    </p>
                </div>

                <div className="cards-grid">
                    {topics.map((item, index) => (
                        <CardComponent
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
        </div>
    );
}
