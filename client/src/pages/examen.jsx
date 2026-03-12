import React, { useState, useEffect } from 'react';
import Navbar from '../comp/navbar';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// 2. مكون البطاقة الفردية (تم تحديثه لإضافة منطق التعطيل)
function CardComponent({ id, category, description, image, isLoggedIn, isSubscribed }) {
    const navigate = useNavigate();
    let isCardDisabled;
    let overlayMessage;

    // --- المنطق الشرطي للتحكم في الوصول (نفس منطق Cours.js) ---
    if (!isLoggedIn) {
        isCardDisabled = true;
        overlayMessage = "سجّل الدخول للمتابعة";
    } else if (!isSubscribed && category !== "B") {
        isCardDisabled = true;
        overlayMessage = "هذا الاختبار متاح للمشتركين فقط";
    } else {
        isCardDisabled = false;
        overlayMessage = "";
    }

    const handleCardClick = async (e) => {
        if (isCardDisabled) {
            e.preventDefault();
            return;
        }

        // Logic to check for topics before navigating
        try {
            const res = await axios.get(`${API_BASE_URL}/topics?category=${encodeURIComponent(category)}`);
            if (res.data.length === 0) {
                // No topics? Go straight to series
                navigate(`/examen/series?category=${encodeURIComponent(category)}`);
            } else {
                // Has topics? Go to topics selection
                navigate(`/examen_question?category=${encodeURIComponent(category)}`);
            }
        } catch (error) {
            console.error("Error checking topics:", error);
            // Default behavior if check fails
            navigate(`/examen_question?category=${encodeURIComponent(category)}`);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={`card-link ${isCardDisabled ? 'card-disabled' : ''}`}
            style={{ cursor: isCardDisabled ? 'not-allowed' : 'pointer' }}
        >
            <div className="license-card">
                <div className="card-image-container">
                    <img
                        src={image}
                        alt={`صورة فئة ${category}`}
                        className="card-image"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/100x100/CCCCCC/000000?text=صورة+غير+متوفرة";
                        }}
                    />
                </div>
                <div className="card-info">
                    <h3 className="card-category">الفئة: {category}</h3>
                    <p className="card-description">{description.replace('دروس', 'اختبارات')}</p>
                </div>
            </div>

            {isCardDisabled && (
                <div className="disabled-overlay">
                    {overlayMessage}
                </div>
            )}
        </div>
    );
}

// 3. المكون الرئيسي
export default function Examen() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const isLoggedIn = localStorage.getItem('login') === 'true';
    const isSubscribed = localStorage.getItem('subscriptions') === 'true';

    useEffect(() => {
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
        fetchCategories();
    }, []);

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>جاري التحميل...</div>;
    }

    return (
        <>
            <Navbar />
            <h2 className="main-title">اختَر فئة رخصة القيادة للاختبار</h2>
            <div className="cards-grid-container">
                {categories.map((item, index) => (
                    <CardComponent
                        key={item._id || index}
                        id={index + 1}
                        category={item.category}
                        description={item.description}
                        image={item.image}
                        isLoggedIn={isLoggedIn}
                        isSubscribed={isSubscribed}
                    />
                ))}
            </div>
        </>
    );
}