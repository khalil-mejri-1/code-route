// src/pages/Cours_question.js (ملف الدروس - المواضيع)

import React from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import Navbar from '../comp/navbar'; 

// 1. البيانات
const licenseCategories = [
    { id: 1, category: "العلامات و الاشارات", image: "https://i.pinimg.com/originals/54/83/72/5483725409b8436c9256c141723999da.gif" },
    { id: 2, category: "الأولوية", image: "https://www.codepermis.net/upload/images/image.jpg" },
    { id: 3, category: "قواعد الجولان",  image: "https://www.codepermis.net/upload/images/en1g5vqv.jpg" },
    { id: 4, category: "المخالفات و العقوبات",  image: "https://www.almuraba.net/wp-content/uploads/2024/05/%D9%83%D9%85-%D9%85%D8%AE%D8%A7%D9%84%D9%81%D8%A9-%D8%A7%D9%84%D8%AC%D9%88%D8%A7%D9%84.jpg" },
    { id: 5, category: "الصيانة",  image: "https://elsafacarservice.com/wp-content/uploads/2024/08/%D9%85%D8%A7-%D9%87%D9%8A-%D8%A3%D9%86%D9%88%D8%A7%D8%B9-%D8%B5%D9%8A%D8%A7%D9%86%D8%A9-%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA.webp" },
    { id: 6, category: "المقاطعة و المجاوزة",  image: "https://www.codepermis.net/upload/images/s7300318.gif" },
];

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
        // ⭐️ التوجيه لصفحة السلسلة مع تمرير القيمة المدمجة
        ? { to: `/serie?category=${newCategoryParam}&nb_serie=1` } 
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
    const isLoggedIn = localStorage.getItem('login') === 'true';
    const isSubscribed = localStorage.getItem('subscriptions') === 'true';
    const location = useLocation(); 

    // ⭐️ استخراج الفئة الرئيسية (مثلاً: B أو A / A1)
    const urlParams = new URLSearchParams(location.search);
    const mainCategory = urlParams.get('category') || 'B'; // نفترض أن الصفحة السابقة أرسلت الفئة الرئيسية في 'category'
    
    return (
        <>
            <Navbar />
            <h2 className="main-title" >
                ({mainCategory}) اختَر الموضوع الذي تريد دراسته
            </h2>
            <div className="cards-grid-container">
                {licenseCategories.map((item) => (
                    <CardComponent
                        key={item.id}
                        id={item.id}
                        category={item.category}
                        image={item.image}
                        isLoggedIn={isLoggedIn} 
                        isSubscribed={isSubscribed} // تمرير حالة الاشتراك
                        mainCategory={mainCategory} // الفئة الرئيسية المقتبسة من الـ URL
                    />
                ))}
            </div>
        </>
    );
}