import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../comp/navbar';
import { Lock, Play, Trophy, Settings, Plus, Trash2, X, Save, CircleCheckBig } from 'lucide-react';
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
    const [selectedExams, setSelectedExams] = useState({});

    useEffect(() => {
        const saved = localStorage.getItem(`selected_exams_${category1}`);
        if (saved) {
            setSelectedExams(JSON.parse(saved));
        }
    }, [category1]);

    const toggleSelect = (examNum) => {
        const nextState = { ...selectedExams, [examNum]: !selectedExams[examNum] };
        setSelectedExams(nextState);
        localStorage.setItem(`selected_exams_${category1}`, JSON.stringify(nextState));
    };

    const [availableSeriesByRule, setAvailableSeriesByRule] = useState({});

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

    const fetchSeriesForCategory = async (category, ruleIdx) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/quiz/series?category1=${encodeURIComponent(category)}`);
            setAvailableSeriesByRule(prev => ({ ...prev, [ruleIdx]: res.data }));
        } catch (err) {
            console.error("Error fetching series", err);
        }
    };

    const fetchCurrentStructure = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/exam-structure/${category1}`);
            if (res.data && res.data.rules) {
                const fetchedRules = res.data.rules.map(r => ({
                    categorySource: r.categorySource,
                    count: r.count,
                    selectionMode: r.selectionMode || 'all',
                    series: r.series || []
                }));
                setRules(fetchedRules);
                // Fetch series for each rule
                fetchedRules.forEach((rule, idx) => {
                    fetchSeriesForCategory(rule.categorySource, idx);
                });
            } else {
                setRules([{ categorySource: category1, count: 30, selectionMode: 'all', series: [] }]);
                fetchSeriesForCategory(category1, 0);
            }
        } catch (err) {
            console.error("Error fetching structure", err);
        }
    };

    const addRule = () => {
        const newIdx = rules.length;
        const newCat = allCategories[0]?.category || '';
        setRules([...rules, { categorySource: newCat, count: 5, selectionMode: 'all', series: [] }]);
        if (newCat) fetchSeriesForCategory(newCat, newIdx);
    };

    const removeRule = (index) => {
        setRules(rules.filter((_, i) => i !== index));
        // Also cleanup available series state
        const nextAvailable = { ...availableSeriesByRule };
        delete nextAvailable[index];
        setAvailableSeriesByRule(nextAvailable);
    };

    const updateRule = (index, field, value) => {
        const newRules = [...rules];
        if (field === 'categorySource') {
            newRules[index][field] = value;
            fetchSeriesForCategory(value, index);
        } else if (field === 'count') {
            newRules[index][field] = parseInt(value) || 0;
        } else if (field === 'selectionMode') {
            newRules[index][field] = value;
            if (value === 'all') newRules[index].series = [];
        } else if (field === 'series') {
            // value is the series number to toggle
            const currentSeries = [...newRules[index].series];
            const serieNum = parseInt(value);
            if (currentSeries.includes(serieNum)) {
                newRules[index].series = currentSeries.filter(s => s !== serieNum);
            } else {
                newRules[index].series = [...currentSeries, serieNum];
            }
        }
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

        // Determine number of exams based on category
        const numberOfExams = category1 === 'A' ? 15 : category1 === 'B' ? 28 : 24;

        // Generate unique random series numbers between 1 and 28
        const availableSeries = Array.from({ length: 28 }, (_, i) => i + 1);
        
        // Shuffle the available series
        for (let i = availableSeries.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableSeries[i], availableSeries[j]] = [availableSeries[j], availableSeries[i]];
        }
        
        // Pick the needed number of exams
        const selectedSeries = availableSeries.slice(0, numberOfExams);
        
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

                            <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '5px' }}>
                                {rules.map((rule, idx) => (
                                    <div key={idx} style={{ background: '#f7fafc', padding: '20px', borderRadius: '15px', border: '1px solid #edf2f7', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '15px' }}>
                                            <div style={{ flex: 2 }}>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#a0aec0', marginBottom: '8px', textTransform: 'uppercase' }}>الفئة المصدر</label>
                                                <select 
                                                    value={rule.categorySource} 
                                                    onChange={(e) => updateRule(idx, 'categorySource', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, background: 'white' }}
                                                >
                                                    {allCategories.map(cat => (
                                                        <option key={cat._id} value={cat.category}>{cat.category}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#a0aec0', marginBottom: '8px', textTransform: 'uppercase' }}>العدد</label>
                                                <input 
                                                    type="number" 
                                                    value={rule.count} 
                                                    onChange={(e) => updateRule(idx, 'count', e.target.value)}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 700, textAlign: 'center' }}
                                                />
                                            </div>
                                            <button 
                                                onClick={() => removeRule(idx)}
                                                style={{ background: '#fff1f2', color: '#f43f5e', border: 'none', borderRadius: '10px', width: '45px', height: '45px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                            <button 
                                                onClick={() => updateRule(idx, 'selectionMode', 'all')}
                                                style={{ 
                                                    flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                                                    background: rule.selectionMode === 'all' ? 'var(--primary)' : 'white',
                                                    color: rule.selectionMode === 'all' ? 'white' : '#718096',
                                                    border: rule.selectionMode === 'all' ? 'none' : '1px solid #e2e8f0'
                                                }}
                                            >
                                                جميع السلاسل
                                            </button>
                                            <button 
                                                onClick={() => updateRule(idx, 'selectionMode', 'specific')}
                                                style={{ 
                                                    flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                                                    background: rule.selectionMode === 'specific' ? 'var(--primary)' : 'white',
                                                    color: rule.selectionMode === 'specific' ? 'white' : '#718096',
                                                    border: rule.selectionMode === 'specific' ? 'none' : '1px solid #e2e8f0'
                                                }}
                                            >
                                                تحديد سلاسل معينة
                                            </button>
                                        </div>

                                        {rule.selectionMode === 'specific' && (
                                            <div style={{ background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#a0aec0', marginBottom: '10px' }}>اختر السلاسل:</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(45px, 1fr))', gap: '8px' }}>
                                                    {availableSeriesByRule[idx] ? (
                                                        availableSeriesByRule[idx].map(s => (
                                                            <div 
                                                                key={s} 
                                                                onClick={() => updateRule(idx, 'series', s)}
                                                                style={{
                                                                    padding: '8px 4px', borderRadius: '6px', textAlign: 'center', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
                                                                    background: rule.series.includes(s) ? 'var(--primary)' : '#f8fafc',
                                                                    color: rule.series.includes(s) ? 'white' : '#64748b',
                                                                    border: '1px solid',
                                                                    borderColor: rule.series.includes(s) ? 'transparent' : '#e2e8f0',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                {s}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div style={{ fontSize: '11px', color: '#cbd5e0', gridColumn: '1/-1' }}>جاري تحميل السلاسل...</div>
                                                    )}
                                                </div>
                                                {rule.series.length === 0 && (
                                                    <p style={{ color: '#f56565', fontSize: '11px', marginTop: '10px', fontWeight: 600 }}>⚠️ يرجى اختيار سلسلة واحدة على الأقل</p>
                                                )}
                                            </div>
                                        )}
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
                                        {/* زر التحديد (بنمط الأيقونة في الزاوية) */}
                                        <div 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleSelect(mapping.examNum);
                                            }}
                                            style={{ 
                                                position: 'absolute', 
                                                top: '18px', 
                                                left: '18px', 
                                                cursor: 'pointer', 
                                                color: selectedExams[mapping.examNum] ? '#10b981' : 'rgba(255,255,255,0.15)',
                                                transition: 'all 0.3s ease',
                                                zIndex: 10
                                            }}
                                            title="تحديد"
                                        >
                                            <CircleCheckBig 
                                                size={24} 
                                                strokeWidth={selectedExams[mapping.examNum] ? 2.5 : 1.5}
                                            />
                                        </div>

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

                                    {/* ✅ زر ابدأ الاختبار */}
                                    <div
                                        style={{
                                            marginTop: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '11px 28px',
                                            borderRadius: '50px',
                                            background: isLocked
                                                ? 'rgba(255,255,255,0.07)'
                                                : 'linear-gradient(135deg, #10b981, #059669)',
                                            color: isLocked ? 'rgba(255,255,255,0.3)' : 'white',
                                            fontWeight: 700,
                                            fontSize: '14px',
                                            cursor: isLocked ? 'not-allowed' : 'pointer',
                                            boxShadow: isLocked ? 'none' : '0 4px 15px rgba(16,185,129,0.4)',
                                            transition: 'all 0.2s ease',
                                            border: isLocked ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                            letterSpacing: '0.5px',
                                        }}
                                    >
                                        {isLocked
                                            ? <><Lock size={15} /> مقفل</>
                                            : <><Play size={15} /> ابدأ الاختبار</>
                                        }
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
