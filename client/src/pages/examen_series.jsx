import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../comp/navbar';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Lock, Play, Trophy, CircleCheckBig } from 'lucide-react';

const parseCategoryParam = (param) => {
    if (!param) return { category1: '', category2: '' };
    if (!param.includes(' / ')) return { category1: param.trim(), category2: '' };
    const parts = param.split(' / ').map(p => p.trim());
    let category1 = '', category2 = '';
    if (parts.length >= 3) {
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

export default function ExamenSeries() {
    const location = useLocation();
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    const { category1, category2 } = parseCategoryParam(categoryParam);

    const isLoggedIn = localStorage.getItem('login') === 'true';
    const isSubscribed = localStorage.getItem('subscriptions') === 'true';

    const [checkedSeries, setCheckedSeries] = useState({});

    useEffect(() => {
        // Load checked state from localStorage
        const saved = localStorage.getItem(`checked_examen_series_${categoryParam}`);
        if (saved) {
            setCheckedSeries(JSON.parse(saved));
        }
    }, [categoryParam]);

    const toggleCheck = (e, serieNum) => {
        e.preventDefault();
        e.stopPropagation();
        const nextState = { ...checkedSeries, [serieNum]: !checkedSeries[serieNum] };
        setCheckedSeries(nextState);
        localStorage.setItem(`checked_examen_series_${categoryParam}`, JSON.stringify(nextState));
    };

    useEffect(() => {
        const fetchSeries = async () => {
            if (!category1) {
                setError('فئة غير صحيحة.');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${API_BASE_URL}/quiz/series`, {
                    params: { category1, category2 }
                });
                setSeries(response.data);
            } catch (err) {
                console.error("Error fetching series:", err);
                setError('فشل في جلب السلاسل.');
            } finally {
                setLoading(false);
            }
        };
        fetchSeries();
    }, [category1, category2]);

    return (
        <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
            <Navbar />
            <div className="page-container">
                <header className="page-header reveal-anim">
                    <span className="badge-new">سلسلة الاختبارات: {category1}</span>
                    <h1 className="page-title">مستعد <span className="accent">للاختبار؟</span></h1>
                    <p className="hero-desc">المحور: {category2}. اختر سلسلة الاختبار وابدأ التقييم الحقيقي لمستواك في هذا المجال.</p>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px', color: 'var(--primary)', fontWeight: 800 }}>جاري التحميل...</div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '100px', color: '#f43f5e' }}>{error}</div>
                ) : (
                    <div className="cards-grid">
                        {series.map((serieNum) => {
                            const isLocked = !isSubscribed && serieNum > 1;
                            return (
                                <Link
                                    key={serieNum}
                                    to={!isLocked ? `/Examen?category=${encodeURIComponent(categoryParam)}&nb_serie=${serieNum}` : '#'}
                                    className={`premium-card reveal-anim ${isLocked ? 'disabled' : ''}`}
                                    onClick={(e) => {
                                        if (isLocked) {
                                            e.preventDefault();
                                            alert("هذه السلسلة متاحة للمشتركين فقط.");
                                        }
                                    }}
                                >
                                    {isLocked && (
                                        <div className="overlay-premium">
                                             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                                <Lock size={32} color="var(--primary)" />
                                                <p style={{ fontSize: '14px' }}>محتوى VIP</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="card-body-premium" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: '220px', justifyContent: 'center' }}>
                                        {/* زر التحديد (بنمط الأيقونة في الزاوية) */}
                                        <div 
                                            onClick={(e) => toggleCheck(e, serieNum)}
                                            style={{ 
                                                position: 'absolute', 
                                                top: '18px', 
                                                left: '18px', 
                                                cursor: 'pointer', 
                                                color: checkedSeries[serieNum] ? '#10b981' : 'rgba(255,255,255,0.15)',
                                                transition: 'all 0.3s ease',
                                                zIndex: 10
                                            }}
                                            title="تحديد"
                                        >
                                            <CircleCheckBig 
                                                size={24} 
                                                strokeWidth={checkedSeries[serieNum] ? 2.5 : 1.5}
                                            />
                                        </div>

                                        <div style={{ width: '60px', height: '60px', background: 'var(--bg-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', marginBottom: '20px' }}>
                                            <Trophy size={24} />
                                        </div>
                                        <h3 className="card-title-premium" style={{ fontSize: '28px' }}>السلسلة {serieNum}</h3>
                                        <p style={{ color: 'var(--text-gray)', fontSize: '14px' }}>اختبار تجريبي للمحور</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
