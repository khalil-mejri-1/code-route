// src/pages/examen_question.js (الموضوعات الخاصة بالاختبار)

import React from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import Navbar from '../comp/navbar'; 

// 1. البيانات
const licenseCategories = [
    { id: 1, category: "العلامات و الاشارات", image: "https://i.pinimg.com/originals/54/83/72/5483725409b8436c9256c141723999da.gif" }, // ⭐️ هذه هي الفئة المسموح بها دائماً (ID: 1)
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

    // --- منطق التعطيل (المنطق الذي يضمن أن ID=1 مسموح به) ---
    if (!isLoggedIn) {
        // 1. غير مسجل دخول: ممنوع (لأنه لا يمكننا تحديد ما إذا كان مشتركاً)
        isCardDisabled = true;
        overlayMessage = "سجّل الدخول للمتابعة";
    } else if (!isSubscribed && id !== 1) { 
        // 2. مسجل وغير مشترك: ممنوع على الجميع باستثناء ID=1
        isCardDisabled = true;
        overlayMessage = "هذا الاختبار متاح للمشتركين فقط";
    } else {
        // 3. مسجل ومشترك، أو مسجل ويحاول الوصول لـ ID=1
        isCardDisabled = false;
        overlayMessage = "";
    }
    // --------------------------------------------------------

    const cardClassName = `card-link ${isCardDisabled ? 'card-disabled' : ''}`;
    const Wrapper = isCardDisabled ? 'div' : Link;
    
    const mainCategoryClean = mainCategory.trim();
    const categoryClean = category.trim();

    // بناء رابط URL المدمج
    const newCategoryParam = encodeURIComponent(mainCategoryClean) + ' / ' + encodeURIComponent(categoryClean);
    
    const linkProps = !isCardDisabled
        // ⭐️ التوجيه لصفحة الاختبار التفاعلي مع تمرير الفئة ورقم السلسلة الافتراضي
        ? { to: `/examen?category=${newCategoryParam}&nb_serie=1` } 
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
                    <h3 className="card-category" > {category} في {mainCategory}</h3> 
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

// 3. المكون الرئيسي (examen_question)
export default function Examen_question() {
    const isLoggedIn = localStorage.getItem('login') === 'true';
    const isSubscribed = localStorage.getItem('subscriptions') === 'true'; 
    const location = useLocation(); 

    const urlParams = new URLSearchParams(location.search);
    const mainCategory = urlParams.get('category') || 'B';
    
    return (
        <>
            <Navbar />
            <h2 className="main-title" >
                 ({mainCategory}) اختَر الموضوع الذي تريد الاختبار فيه 
            </h2>
            <div className="cards-grid-container">
                
                {licenseCategories.map((item) => (
                    <CardComponent
                        key={item.id}
                        id={item.id}
                        category={item.category}
                        image={item.image}
                        isLoggedIn={isLoggedIn} 
                        isSubscribed={isSubscribed}
                        mainCategory={mainCategory} 
                    />
                ))}
                
                {/* رسالة للتذكير بالاشتراك */}
                {isLoggedIn && !isSubscribed && (
                    <p style={{textAlign: 'center', width: '100%', marginTop: '30px', color: '#3498db', fontWeight: 'bold'}}>
                        لفتح جميع المواضيع ({licenseCategories.length - 1} مواضيع أخرى)، يرجى الاشتراك في باقاتنا!
                    </p>
                )}
            </div>
        </>
    );
}

