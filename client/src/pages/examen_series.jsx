import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../comp/navbar';
import axios from 'axios';

// دالة مساعدة لتجزئة الباراميتر
const parseCategoryParam = (param) => {
    if (!param) return { category1: '', category2: '' };
    const parts = param.split(' / ').map(p => p.trim());

    let category1 = '';
    let category2 = '';

    if (parts.length >= 3) {
        // حالة: A / A1 / العلامات (مثال افتراضي)
        // قد نحتاج لتكييف هذا حسب بنية بياناتك الفعلية
        category1 = parts.slice(0, 2).join(' / ');
        category2 = parts.slice(2).join(' / ');
    } else if (parts.length === 2) {
        category1 = parts[0];
        category2 = parts[1];
    } else {
        category1 = parts[0] || '';
        // إذا كان هناك جزء واحد فقط، قد يكون هو الفئة الرئيسية أو الفرعية حسب السياق
        // هنا سنفترض أنه الفئة الرئيسية مؤقتاً
    }
    return { category1, category2 };
};

export default function ExamenSeries() {
    const location = useLocation();
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // استخراج الباراميترات من URL
    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    const { category1, category2 } = parseCategoryParam(categoryParam);

    const isLoggedIn = localStorage.getItem('login') === 'true';
    const isSubscribed = localStorage.getItem('subscriptions') === 'true';

    useEffect(() => {
        const fetchSeries = async () => {
            if (!category1 || !category2) {
                setError('فئة غير صحيحة.');
                setLoading(false);
                return;
            }

            try {
                // استدعاء الـ API الجديد لجلب السلاسل
                const response = await axios.get('http://localhost:3000/api/quiz/series', {
                    params: { category1, category2 }
                });

                // المتوقع: مصفوفة من الأرقام [1, 2, 3, 4]
                setSeries(response.data);
            } catch (err) {
                console.error("Error fetching series:", err);
                setError('فشل في جلب السلاسل. يرجى المحاولة لاحقاً.');
            } finally {
                setLoading(false);
            }
        };

        fetchSeries();
    }, [category1, category2]);

    return (
        <>
            <Navbar />

            <div className="subscriptions-container" /* Using existing container class for consistent spacing */>
                <header className="payment-header">
                    <h1>سلاسل الاختبار: {category2}</h1>
                    <p style={{ marginTop: '10px' }}>{category1}</p>
                </header>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <h2>جاري التحميل... 🔄</h2>
                    </div>
                )}

                {error && (
                    <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
                        <h2>{error}</h2>
                    </div>
                )}

                {!loading && !error && series.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <h2>لا توجد سلاسل متاحة لهذه الفئة حالياً.</h2>
                    </div>
                )}

                <div className="cards-grid-container">
                    {series.map((serieNum) => {
                        // منطق الحجب:
                        // السلسلة 1 دائمًا مفتوحة للمستخدم المسجل.
                        // السلاسل الأخرى تتطلب اشتراكًا.

                        // ملاحظة: المستخدم غير المسجل لا يجب أن يصل هنا عادة، ولكن للاحتياط:
                        // السلسلة 1 متاحة للتجربة (المحدودة بـ3 أسئلة في صفحة الاختبار)
                        // لكن الوصول لصفحة "Serie X" نفسها:

                        // هل نحجب الزر نفسه؟
                        // المستخدم يريد أن يرى السلاسل "يوجد 4 Serie".
                        // لنعرضهم جميعاً، وعند النقر، صفحة الاختبار ستعالج الحجب (التجربة المجانية)
                        // أو يمكننا وضع قفل هنا.

                        const isLocked = !isSubscribed && serieNum > 1; // مثال: السلسلة 2 و 3 و 4 مغلقة لغير المشتركين

                        return (
                            <Link
                                key={serieNum}
                                to={!isLocked ? `/Examen?category=${encodeURIComponent(categoryParam)}&nb_serie=${serieNum}` : '#'}
                                className="card-link"
                                style={isLocked ? { cursor: 'not-allowed', opacity: 0.7 } : {}}
                                onClick={(e) => {
                                    if (isLocked && isLoggedIn) {
                                        e.preventDefault();
                                        alert("هذه السلسلة متاحة للمشتركين فقط. يرجى الاشتراك لفتح جميع السلاسل.");
                                    } else if (!isLoggedIn) {
                                        // إذا لم يكن مسجلاً، ربما نوجهه لتسجيل الدخول، لكن صفحة الاختبار تعالج ذلك
                                    }
                                }}
                            >
                                <div className="license-card" style={{ justifyContent: 'center', height: '180px' }}>
                                    <div className="card-info" style={{ alignItems: 'center' }}>
                                        <h3 className="card-category" style={{ fontSize: '2em', marginBottom: '10px' }}>
                                            السلسلة {serieNum}
                                        </h3>
                                        {isLocked ? (
                                            <span style={{ fontSize: '1.5em' }}>🔒</span>
                                        ) : (
                                            <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>مفتوح ✅</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
