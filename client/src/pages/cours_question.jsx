// src/pages/cours_question.jsx (ملف الدروس - المواضيع)

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../comp/navbar';
import axios from 'axios';

// 2. مكون البطاقة الفردية (CardComponent)
function CardComponent({ id, category, image, isLoggedIn, isSubscribed, mainCategory }) {

    let isCardDisabled;
    let overlayMessage;

    // المنطق: إذا كان غير مشترك، عطّل الكل باستثناء الفئة التجريبية (ID: 1)
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

    const cardClassName = `card-link ${isCardDisabled ? 'card-disabled' : ''}`;
    const Wrapper = isCardDisabled ? 'div' : Link;

    // ⭐️ بناء رابط URL المدمج (ليرسله الخادم كـ category1 و category2)
    const newCategoryParam = encodeURIComponent(mainCategory.trim()) + ' / ' + encodeURIComponent(category.trim());

    const linkProps = !isCardDisabled
        // ⭐️ التوجيه لصفحة اختيار السلسلة بدلاً من الدرس مباشرة
        ? { to: `/cours/series?category=${newCategoryParam}` }
        : {};

    return (
        <Wrapper {...linkProps} className={cardClassName}>
            <div className="license-card">
                <div className="card-image-container">
                    <img
                        src={image}
                        alt={`صورة فئة ${category}`}
                        className="card-image-cours-category"
                    />
                </div>
                <div className="card-info">
                    {/* عرض الفئة الرئيسية والفئة الفرعية */}
                    <h3 className="card-category"> {category} في {mainCategory}</h3>
                </div>
            </div>

            {isCardDisabled && (
                <div className="disabled-overlay">
                    {overlayMessage}
                </div>
            )}
        </Wrapper>
    );
}

// 3. المكون الرئيسي (Cours_question)
export default function Cours_question() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const isLoggedIn = localStorage.getItem('login') === 'true';
    const isSubscribed = localStorage.getItem('subscriptions') === 'true';
    const location = useLocation();

    // ⭐️ استخراج الفئة الرئيسية (مثلاً: B أو A / A1)
    const urlParams = new URLSearchParams(location.search);
    const mainCategory = urlParams.get('category') || 'B';

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await axios.get(`https://code-route-rho.vercel.app//api/topics?category=${encodeURIComponent(mainCategory)}`);
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
        return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>جاري التحميل...</div>;
    }

    return (
        <>
            <Navbar />
            <h2 className="main-title" >
                ({mainCategory}) اختَر الموضوع الذي تريد دراسته
            </h2>
            <div className="cards-grid-container">
                {topics.map((item, index) => (
                    <CardComponent
                        key={item._id || index}
                        id={index + 1}
                        category={item.name}
                        image={item.image}
                        isLoggedIn={isLoggedIn}
                        isSubscribed={isSubscribed}
                        mainCategory={mainCategory}
                    />
                ))}
            </div>
        </>
    );
}
