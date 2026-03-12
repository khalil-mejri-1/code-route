import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../comp/navbar';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// دالة مساعدة لتجزئة الباراميتر
const parseCategoryParam = (param) => {
    if (!param) return { category1: '', category2: '' };

    // Check if it contains a separator
    if (!param.includes(' / ')) {
        return { category1: param.trim(), category2: '' };
    }

    const parts = param.split(' / ').map(p => p.trim());

    let category1 = '';
    let category2 = '';

    if (parts.length >= 3) {
        // حالة: A / A1 / العلامات
        category1 = parts.slice(0, 2).join(' / ');
        category2 = parts.slice(2).join(' / ');
    } else if (parts.length === 2) {
        category1 = parts[0];
        category2 = parts[1];
    } else {
        category1 = parts[0] || '';
    }
    return { category1, category2 };
};

// مكون البطاقة لتسهيل حالة الـ checkmark
function SerieCard({ serieNum, isLocked, categoryParam, isLoggedIn }) {
    const [isChecked, setIsChecked] = useState(() => {
        const saved = localStorage.getItem(`checked_serie_${categoryParam}_${serieNum}`);
        return saved === 'true';
    });

    const toggleCheck = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newValue = !isChecked;
        setIsChecked(newValue);
        localStorage.setItem(`checked_serie_${categoryParam}_${serieNum}`, newValue);
    };

    return (
        <Link
            key={serieNum}
            to={!isLocked ? `/serie?category=${encodeURIComponent(categoryParam)}&nb_serie=${serieNum}` : '#'}
            className={`card-link ${isChecked ? 'card-checked' : ''}`}
            style={isLocked ? { cursor: 'not-allowed', opacity: 0.7 } : {}}
            onClick={(e) => {
                if (isLocked && isLoggedIn) {
                    e.preventDefault();
                    alert("هذه السلسلة متاحة للمشتركين فقط. يرجى الاشتراك لفتح جميع السلاسل.");
                }
            }}
        >
            <div
                className={`checkmark-btn ${isChecked ? 'checked' : ''}`}
                onClick={toggleCheck}
                title="حدد كمكتمل"
            >
                <span className="checkmark-icon">{isChecked ? '✓' : '✓'}</span>
            </div>
            <div className="license-card" style={{ justifyContent: 'center', height: '180px' }}>
                <div className="card-info" style={{ alignItems: 'center' }}>
                    <h3 className="card-category" style={{ fontSize: '2em', marginBottom: '10px' }}>
                        السلسلة {serieNum}
                    </h3>
                    {isLocked ? (
                        <span style={{ fontSize: '1.5em' }}>🔒</span>
                    ) : (
                        <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}></span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default function CoursSeries() {
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
            if (!category1) {
                setError('فئة غير صحيحة.');
                setLoading(false);
                return;
            }

            try {
                // استدعاء الـ API لجلب السلاسل (نفس API الامتحانات)
                const response = await axios.get(`${API_BASE_URL}/quiz/series`, {
                    params: { category1, category2 }
                });
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

            <div className="subscriptions-container">
                <header className="payment-header">
                    <h1>سلاسل الدروس: {category2}</h1>
                    <p style={{ marginTop: '10px' }}> الفئة : ( {category1} )</p>
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
                        // منطق الحجب: السلسلة 1 مفتوحة، الباقي للمشتركين فقط
                        const isLocked = !isSubscribed && serieNum > 1;

                        return (
                            <SerieCard
                                key={serieNum}
                                serieNum={serieNum}
                                isLocked={isLocked}
                                categoryParam={categoryParam}
                                isLoggedIn={isLoggedIn}
                            />
                        );
                    })}
                </div>
            </div>
        </>
    );
}
