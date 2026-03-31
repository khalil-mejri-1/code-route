import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../comp/navbar';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { ChevronLeft, Lock } from 'lucide-react';

function CardComponent({ category, description, image, isLoggedIn, isSubscribed }) {
    const navigate = useNavigate();
    let isCardDisabled;
    let overlayMessage;

    if (!isLoggedIn) {
        isCardDisabled = true;
        overlayMessage = "سجّل الدخول للمتابعة";
    } else if (!isSubscribed && category !== "B") {
        isCardDisabled = true;
        overlayMessage = "هذا الصنف متاح للمشتركين فقط";
    } else {
        isCardDisabled = false;
        overlayMessage = "";
    }

    const handleCardClick = async () => {
        if (isCardDisabled) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/topics?category=${encodeURIComponent(category)}`);
            const topics = response.data;

            if (topics.length === 0) {
                navigate(`/cours/series?category=${encodeURIComponent(category)}`);
            } else {
                navigate(`/Cours_question?category=${encodeURIComponent(category)}`);
            }
        } catch (error) {
            console.error("Error checking topics:", error);
            navigate(`/Cours_question?category=${encodeURIComponent(category)}`);
        }
    };

    return (
        <div 
            onClick={handleCardClick} 
            className={`premium-card reveal-anim ${isCardDisabled ? 'disabled' : ''}`}
        >
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
                <div className="badge-float" style={{ background: category === 'B' ? 'var(--secondary)' : 'var(--primary)' }}>
                    {category === 'B' ? 'مجاني' : 'دروس VIP'}
                </div>
                <h3 className="card-title-premium">صنف {category}</h3>
                <p className="card-desc-premium">{description}</p>
                
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ padding: '8px', border: '1px solid var(--glass-border)', borderRadius: '50%' }}>
                        <ChevronLeft size={20} color="var(--primary)" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Cours() {
    const [licenseCategories, setLicenseCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const isLoggedIn = localStorage.getItem('login') === 'true';
    const isSubscribed = localStorage.getItem('subscriptions') === 'true';

    useEffect(() => {
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
        fetchCategories();
    }, []);

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
                    {licenseCategories.map((item, index) => (
                        <CardComponent
                            key={index}
                            category={item.category}
                            description={item.description}
                            image={item.image}
                            isLoggedIn={isLoggedIn}
                            isSubscribed={isSubscribed}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
