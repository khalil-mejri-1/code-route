// src/pages/cours.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../comp/navbar';
import axios from 'axios';

// 2. مكون البطاقة الفردية (CardComponent)
function CardComponent({ id, category, description, image, isLoggedIn, isSubscribed }) {

    let isCardDisabled;
    let overlayMessage;

    // --- المنطق المصحح الجديد (يعتمد على حالة الاشتراك) ---

    if (!isLoggedIn) {
        // الحالة 1: غير مسجل للدخول
        isCardDisabled = true;
        overlayMessage = "سجّل الدخول للمتابعة";
    } else if (!isSubscribed && id !== 1 && category !== "B") {
        // الحالة 2: مسجل، ولكنه غير مشترك، والصنف ليس مجانياً (id != 1)
        // أضفت فحص category !== "B" كحالة احتياطية إذا تغيرت الـ id
        isCardDisabled = true;
        overlayMessage = "هذا الصنف متاح للمشتركين فقط";
    } else {
        // الحالة 3: مسموح بالوصول
        isCardDisabled = false;
        overlayMessage = "";
    }


    const cardClassName = `card-link ${isCardDisabled ? 'card-disabled' : ''}`;

    // استخدام المكون Link فقط إذا لم تكن البطاقة معطلة
    const Wrapper = isCardDisabled ? 'div' : Link;

    // إعداد خصائص الرابط
    const linkProps = !isCardDisabled
        ? { to: `/Cours_question?category=${encodeURIComponent(category)}` }
        : {};

    return (
        <Wrapper {...linkProps} className={cardClassName}>
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
        </Wrapper>
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
                const response = await axios.get('http://localhost:3000/api/categories');
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
