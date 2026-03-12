import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../comp/navbar';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// 2. مكون البطاقة الفردية (CardComponent)
function CardComponent({ id, category, description, image, isLoggedIn, isSubscribed }) {
    const navigate = useNavigate();
    let isCardDisabled;
    let overlayMessage;

    // --- المنطق المصحح الجديد (يعتمد على حالة الاشتراك) ---

    if (!isLoggedIn) {
        // الحالة 1: غير مسجل للدخول
        isCardDisabled = true;
        overlayMessage = "سجّل الدخول للمتابعة";
    } else if (!isSubscribed && category !== "B") {
        // الحالة 2: مسجل، ولكنه غير مشترك، والصنف ليس مجانياً
        isCardDisabled = true;
        overlayMessage = "هذا الصنف متاح للمشتركين فقط";
    } else {
        // الحالة 3: مسموح بالوصول
        isCardDisabled = false;
        overlayMessage = "";
    }

    const [isChecked, setIsChecked] = useState(() => {
        const saved = localStorage.getItem(`checked_course_${category}`);
        return saved === 'true';
    });

    const toggleCheck = (e) => {
        e.stopPropagation();
        const newValue = !isChecked;
        setIsChecked(newValue);
        localStorage.setItem(`checked_course_${category}`, newValue);
    };

    const handleCardClick = async (e) => {
        if (isCardDisabled) {
            e.preventDefault();
            return;
        }

        try {
            // Check if there are sub-topics for this category
            const response = await axios.get(`${API_BASE_URL}/topics?category=${encodeURIComponent(category)}`);
            const topics = response.data;

            if (topics.length === 0) {
                // No sub-topics? Go directly to series selection
                navigate(`/cours/series?category=${encodeURIComponent(category)}`);
            } else {
                // Has sub-topics? Go to topics selection page
                navigate(`/Cours_question?category=${encodeURIComponent(category)}`);
            }
        } catch (error) {
            console.error("Error checking topics:", error);
            // Default to topics page if check fails
            navigate(`/Cours_question?category=${encodeURIComponent(category)}`);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={`card-link ${isCardDisabled ? 'card-disabled' : ''} ${isChecked ? 'card-checked' : ''}`}
            style={{ cursor: isCardDisabled ? 'not-allowed' : 'pointer' }}
        >
            <div
                className={`checkmark-btn ${isChecked ? 'checked' : ''}`}
                onClick={toggleCheck}
                title="حدد كمكتمل"
            >
                <span className="checkmark-icon">{isChecked ? '✓' : '✓'}</span>
            </div>
            <div className="license-card">
                <div className="card-image-container">
                    <img
                        src={image}
                        alt={`صورة فئة ${category}`}
                        className="card-image"
                    />
                </div>
                <div className="card-info">
                    <h3 className="card-category">الفئة: {category}</h3>
                    <p className="card-description">{description}</p>
                </div>
            </div>

            {/* تراكب رسالة التعطيل */}
            {isCardDisabled && (
                <div className="disabled-overlay">
                    {overlayMessage}
                </div>
            )}
        </div>
    );
}

// 3. المكون الرئيسي (Cours)
export default function Cours() {
    const [licenseCategories, setLicenseCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // ⭐️ قراءة حالتي login و subscriptions
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
        return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>جاري التحميل...</div>;
    }

    return (
        <>
            <Navbar />
            <h2 className="main-title">اختَر فئة رخصة القيادة للدراسة</h2>
            <div className="cards-grid-container">
                {licenseCategories.map((item, index) => (
                    <CardComponent
                        key={item._id || index}
                        id={index + 1} // للتبسيط في معالجة الفئة B كمجانية
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
