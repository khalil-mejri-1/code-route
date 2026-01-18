// src/pages/examen.jsx

import React from 'react';
import Navbar from '../comp/navbar';
import { Link } from 'react-router-dom';

// import '../styles/LicenseCategories.css'; // تأكد من استيراد الأنماط

// 1. البيانات
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

// 2. مكون البطاقة الفردية (تم تحديثه لإضافة منطق التعطيل)
function CardComponent({ id, category, description, image, isLoggedIn, isSubscribed }) {

    let isCardDisabled;
    let overlayMessage;

    // --- المنطق الشرطي للتحكم في الوصول (نفس منطق Cours.js) ---
    if (!isLoggedIn) {
        // الحالة 1: غير مسجل للدخول
        isCardDisabled = true;
        overlayMessage = "سجّل الدخول للمتابعة";
    } else if (!isSubscribed && id !== 1) {
        // الحالة 2: مسجل، ولكنه غير مشترك، والصنف ليس مجانياً (id != 1)
        isCardDisabled = true;
        overlayMessage = "هذا الاختبار متاح للمشتركين فقط"; // تغيير الرسالة لتناسب الاختبارات
    } else {
        // الحالة 3: مسموح بالوصول (مشترك، أو غير مشترك + فئة تجريبية)
        isCardDisabled = false;
        overlayMessage = "";
    }


    const cardClassName = `card-link ${isCardDisabled ? 'card-disabled' : ''}`;

    // استخدام المكون Link فقط إذا لم تكن البطاقة معطلة
    const Wrapper = isCardDisabled ? 'div' : Link;

    // التوجيه إلى /examen_question وإرسال الفئة
    const linkProps = !isCardDisabled
        ? { to: `/examen_question?category=${encodeURIComponent(category)}` }
        : {};

    return (
        <Wrapper {...linkProps} className={cardClassName}>
            <div className="license-card">
                <div className="card-image-container">
                    {/*  */}
                    <img
                        src={image}
                        alt={`صورة فئة ${category}`}
                        className="card-image"
                        // إضافة خاصية لضمان عرض صور placeholder في حالة فشل تحميل الصورة
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/100x100/CCCCCC/000000?text=صورة+غير+متوفرة";
                        }}
                    />
                </div>
                <div className="card-info">
                    <h3 className="card-category">الفئة: {category}</h3>
                    {/* تغيير كلمة "دروس" إلى "اختبارات" في الوصف */}
                    <p className="card-description">{description.replace('دروس', 'اختبارات')}</p>
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

// 3. المكون الرئيسي
export default function Examen() {
    // ⭐️ قراءة حالتي login و subscriptions
    const isLoggedIn = localStorage.getItem('login') === 'true';
    const isSubscribed = localStorage.getItem('subscriptions') === 'true'; // قراءة حالة الاشتراك

    return (
        <>
            <Navbar />
            <h2 className="main-title">اختَر فئة رخصة القيادة للاختبار</h2>
            <div className="cards-grid-container">
                {/*  */}
                {licenseCategories.map((item) => (
                    <CardComponent
                        key={item.id}
                        id={item.id} // تمرير الـ id
                        category={item.category}
                        description={item.description}
                        image={item.image}
                        isLoggedIn={isLoggedIn} // تمرير حالة تسجيل الدخول
                        isSubscribed={isSubscribed} // تمرير حالة الاشتراك
                    />
                ))}
            </div>
        </>
    );
}