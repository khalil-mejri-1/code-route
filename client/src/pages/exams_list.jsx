import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../comp/navbar';
import { Lock, Play, Trophy, Settings, Plus, Trash2, X, Save } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

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
    const isAdmin = localStorage.getItem('role') === 'admin' || localStorage.getItem('login') === 'true'; // Assuming login implies some level of control or check

    const [showConfigModal, setShowConfigModal] = useState(false);
    const [allCategories, setAllCategories] = useState([]);
    const [rules, setRules] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (showConfigModal) {
            fetchCategories();
            fetchCurrentStructure();
        }
    }, [showConfigModal, category1]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/categories`);
            setAllCategories(res.data);
        } catch (err) {
            console.error("Error fetching categories", err);
        }
    };

    const fetchCurrentStructure = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/exam-structure/${category1}`);
            if (res.data && res.data.rules) {
                setRules(res.data.rules);
            } else {
                setRules([{ categorySource: category1, count: 30 }]);
            }
        } catch (err) {
            console.error("Error fetching structure", err);
        }
    };

    const addRule = () => {
        setRules([...rules, { categorySource: allCategories[0]?.category || '', count: 5 }]);
    };

    const removeRule = (index) => {
        setRules(rules.filter((_, i) => i !== index));
    };

    const updateRule = (index, field, value) => {
        const newRules = [...rules];
        newRules[index][field] = field === 'count' ? parseInt(value) : value;
        setRules(newRules);
    };

    const handleSaveConfig = async () => {
        setIsSaving(true);
        try {
            await axios.post(`${API_BASE_URL}/exam-structure`, {
                category: category1,
                rules: rules
            });
            setShowConfigModal(false);
            alert("✅ تم حفظ بنية الامتحان بنجاح!");
        } catch (err) {
            console.error(err);
            alert("❌ فشل حفظ بنية الامتحان.");
        } finally {
            setIsSaving(false);
        }
    };

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
                <header className="page-header reveal-anim" style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        <button 
                            onClick={() => setShowConfigModal(true)}
                            style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                            title="تكوين بنية الامتحان"
                        >
                            <Settings size={24} />
                        </button>
                    </div>
                    <span className="badge-new">الاختبارات الشاملة للفئة {category1}</span>
                    <h1 className="page-title">اختر <span className="accent">الامتحان</span></h1>
                    <p className="hero-desc">امتحانات محاكية للواقع: 5 أسئلة من تخصص {category1} مدمجة مع 25 سؤال من سلسلة عشوائية.</p>
                </header>

                {showConfigModal && (
                    <div className="overlay-premium" style={{ opacity: 1, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }}>
                        <div className="reveal-anim" style={{ background: 'white', width: '95%', maxWidth: '600px', borderRadius: '20px', padding: '30px', position: 'relative', color: '#333', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                            <button 
                                onClick={() => setShowConfigModal(false)}
                                style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                            
                            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                                <div style={{ width: '60px', height: '60px', background: 'var(--primary-glow)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', margin: '0 auto 15px' }}>
                                    <Settings size={30} />
                                </div>
                                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a202c' }}>تكوين بنية الامتحان</h2>
                                <p style={{ color: '#718096', fontSize: '14px' }}>حدد عدد الأسئلة من كل فئة لتكوين الامتحان الشامل</p>
                            </div>

                            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '5px' }}>
                                {rules.map((rule, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center', background: '#f7fafc', padding: '15px', borderRadius: '12px', border: '1px solid #edf2f7' }}>
                                        <div style={{ flex: 2 }}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4a5568', marginBottom: '5px' }}>الفئة</label>
                                            <select 
                                                value={rule.categorySource} 
                                                onChange={(e) => updateRule(idx, 'categorySource', e.target.value)}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px' }}
                                            >
                                                {allCategories.map(cat => (
                                                    <option key={cat._id} value={cat.category}>{cat.category}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4a5568', marginBottom: '5px' }}>العدد</label>
                                            <input 
                                                type="number" 
                                                value={rule.count} 
                                                onChange={(e) => updateRule(idx, 'count', e.target.value)}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px' }}
                                            />
                                        </div>
                                        <button 
                                            onClick={() => removeRule(idx)}
                                            style={{ marginTop: '20px', background: '#ffebeb', color: '#f56565', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={addRule}
                                style={{ width: '100%', padding: '12px', marginTop: '10px', border: '2px dashed #cbd5e0', borderRadius: '12px', background: 'none', color: '#718096', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                            >
                                <Plus size={18} /> إضافة فئة أخرى
                            </button>

                            <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                                <button 
                                    onClick={handleSaveConfig}
                                    disabled={isSaving}
                                    style={{ flex: 1, padding: '15px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <Save size={20} /> {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                </button>
                            </div>
                            
                            <div style={{ textAlign: 'center', marginTop: '15px', color: '#a0aec0', fontSize: '13px' }}>
                                مجموع الأسئلة: {rules.reduce((acc, r) => acc + (r.count || 0), 0)}
                            </div>
                        </div>
                    </div>
                )}

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
                                    <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '20px', boxShadow: '0 8px 20px -5px var(--primary-glow)', position: 'relative' }}>
                                        <Trophy size={24} />
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowConfigModal(true);
                                            }}
                                            style={{ position: 'absolute', top: '-5px', left: '-5px', background: 'white', border: '1px solid var(--primary)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5 }}
                                        >
                                            <Settings size={12} color="var(--primary)" />
                                        </button>
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
