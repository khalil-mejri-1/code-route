// src/pages/cours.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../comp/navbar'; 
// import '../styles/LicenseCategories.css'; 

// 1. البيانات (بقيت كما هي)
const licenseCategories = [
    { id: 1, category: "B", description: "دروس في B", image: "https://www.codedelaroute.tn/images/b.png" }, // الفئة التجريبية/المجانية
    { id: 2, category: "A / A1", description: "دروس في A / A1", image: "https://www.codedelaroute.tn/images/a.png" },
    { id: 3, category: "A1 / AM", description: "دروس في A1 / AM", image: "https://www.codedelaroute.tn/images/a1.png" },
    { id: 4, category: "B+E", description: "دروس في B+E", image: "https://www.codedelaroute.tn/images/b+e.png" },
    { id: 5, category: "C / C1", description: "دروس في C / C1", image: "https://www.codedelaroute.tn/images/c.png" },
    { id: 6, category: "C+E / C1+E", description: "دروس في C+E / C1+E", image: "https://www.codedelaroute.tn/images/c+e.png" },
    { id: 7, category: "D", description: "دروس في D", image: "https://www.codedelaroute.tn/images/d.png" },
    { id: 8, category: "D1", description: "دروس في D1", image: "https://www.codedelaroute.tn/images/d1.png" },
    { id: 9, category: "D+E / D1+E", description: "دروس في D+E / D1+E", image: "https://www.codedelaroute.tn/images/d+e.png" },
];

// 2. مكون البطاقة الفردية (CardComponent)
function CardComponent({ id, category, description, image, isLoggedIn, isSubscribed }) {
    
    let isCardDisabled;
    let overlayMessage;

    // --- المنطق المصحح الجديد (يعتمد على حالة الاشتراك) ---

    if (!isLoggedIn) {
        // الحالة 1: غير مسجل للدخول
        isCardDisabled = true;
        overlayMessage = "سجّل الدخول للمتابعة";
    } else if (!isSubscribed && id !== 1) {
        // الحالة 2: مسجل، ولكنه غير مشترك، والصنف ليس مجانياً (id != 1)
        isCardDisabled = true;
        overlayMessage = "هذا الصنف متاح للمشتركين فقط";
    } else {
        // الحالة 3: مسموح بالوصول (سواء كان مشتركاً، أو غير مشترك ولكنه يحاول الوصول للفئة التجريبية 1)
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
    // ⭐️ قراءة حالتي login و subscriptions
    const isLoggedIn = localStorage.getItem('login') === 'true';
    const isSubscribed = localStorage.getItem('subscriptions') === 'true';

    return (
        <>
            <Navbar />
            <h2 className="main-title">اختَر فئة رخصة القيادة للدراسة</h2>
            <div className="cards-grid-container">
                {/*  */}
                {licenseCategories.map((item) => (
                    <CardComponent
                        key={item.id}
                        id={item.id} 
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