import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../comp/navbar';
import { Lock, Play, Trophy } from 'lucide-react';

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

const cachedExamMappings = {};

export default function ExamsList() {
    const location = useLocation();
    const [examMappings, setExamMappings] = useState([]);

    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    const { category1, category2 } = parseCategoryParam(categoryParam);

    const isLoggedIn = localStorage.getItem('login') === 'true';
    const isSubscribed = localStorage.getItem('subscriptions') === 'true';

    useEffect(() => {
        const cacheKey = `${category1}_${category2}`;
        
        if (cachedExamMappings[cacheKey]) {
            setExamMappings(cachedExamMappings[cacheKey]);
            return;
        }

        // Generate 24 unique random series numbers between 1 and 28
        const availableSeries = Array.from({ length: 28 }, (_, i) => i + 1);
        
        // Shuffle the available series
        for (let i = availableSeries.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableSeries[i], availableSeries[j]] = [availableSeries[j], availableSeries[i]];
        }
        
        // Pick the first 24
        const selectedSeries = availableSeries.slice(0, 24);
        
        // Create mappings: examIndex -> mappedSerieNum
        const mappings = selectedSeries.map((mappedSerieNum, index) => ({
            examNum: index + 1,
            mappedSerieNum: mappedSerieNum
        }));
        
        cachedExamMappings[cacheKey] = mappings;
        setExamMappings(mappings);
    }, [category1, category2]);

    if (!category1) {
        return (
            <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#f43f5e', fontWeight: 800, fontSize: '20px' }}>فئة غير صحيحة.</div>
            </div>
        );
    }

    return (
        <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
            <Navbar />
            <div className="page-container">
                <header className="page-header reveal-anim">
                    <span className="badge-new">الاختبارات الشاملة للفئة {category1}</span>
                    <h1 className="page-title">اختر <span className="accent">الامتحان</span></h1>
                    <p className="hero-desc">امتحانات محاكية للواقع: 5 أسئلة من تخصص {category1} مدمجة مع 25 سؤال من سلسلة عشوائية.</p>
                </header>

                <div className="cards-grid">
                    {examMappings.map((mapping) => {
                        // First exam is free if logged in, remaining are locked if not subscribed. Or all 24 are exams.
                        const isLocked = !isSubscribed && mapping.examNum > 1;
                        
                        return (
                            <Link
                                key={mapping.examNum}
                                to={!isLocked ? `/full-exam?category=${encodeURIComponent(categoryParam)}&examSerie=${mapping.mappedSerieNum}` : '#'}
                                className={`premium-card reveal-anim ${isLocked ? 'disabled' : ''}`}
                                onClick={(e) => {
                                    if (isLocked) {
                                        e.preventDefault();
                                        alert(!isLoggedIn ? "الرجاء تسجيل الدخول أولاً." : "هذا الاختبار متاح للمشتركين فقط.");
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
                                    <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '20px', boxShadow: '0 8px 20px -5px var(--primary-glow)' }}>
                                        <Trophy size={24} />
                                    </div>
                                    <h3 className="card-title-premium" style={{ fontSize: '28px' }}>اختبار {mapping.examNum}</h3>
                                    <p style={{ color: 'var(--text-gray)', fontSize: '13px', marginTop: '10px' }}>
                                        السلسلة المدمجة: {mapping.mappedSerieNum}
                                    </p>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '12px', marginTop: '4px' }}>
                                        (يحتوي على 30 سؤال مختلط)
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
