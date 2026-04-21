import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../comp/navbar';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Lock, Play, Trophy, CircleCheckBig, X, Save, Settings } from 'lucide-react';

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
    const [showModal, setShowModal] = useState(false);
    const [selectedSerieNum, setSelectedSerieNum] = useState(null);
    const [newSerieNum, setNewSerieNum] = useState('');
    const [serieName, setSerieName] = useState('');
    const [serieSubName, setSerieSubName] = useState('');
    const [targetCategory, setTargetCategory] = useState('');
    const [updating, setUpdating] = useState(false);

    const LICENSE_TYPES = ["B", "A", "AA", "Z", "D", "CE", "C", "امتحانات"];

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

    useEffect(() => {
        fetchSeries();
    }, [category1, category2]);

    const openEditModal = (e, serie) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedSerieNum(serie.num);
        setNewSerieNum(serie.num);
        setSerieName(serie.name);
        setSerieSubName(serie.subName || '');
        setTargetCategory(category1); // الافتراضي هو الصنف الحالي
        setShowModal(true);
    };

    const handleUpdateSeries = async () => {
        if (!newSerieNum || isNaN(newSerieNum)) return alert("يرجى إدخال رقم صحيح.");
        
        setUpdating(true);
        try {
            await axios.put(`${API_BASE_URL}/quiz/series/rename`, {
                category1,
                category2,
                oldSerieNum: selectedSerieNum,
                newSerieNum: parseInt(newSerieNum),
                serieName: serieName,
                serieSubName: serieSubName,
                newCategory1: targetCategory !== category1 ? targetCategory : undefined
            });
            setShowModal(false);
            fetchSeries();
            alert("✅ تم تحديث بيانات السلسلة بنجاح!");
        } catch (err) {
            console.error(err);
            alert("❌ فشل تحديث السلسلة.");
        } finally {
            setUpdating(false);
        }
    };

    const isAdmin = localStorage.getItem('role') === 'admin' || localStorage.getItem('login') === 'true';

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
                        {series.map((serie) => {
                            const isLocked = !isSubscribed && serie.nb_serie > 1;
                            return (
                                <Link
                                    key={serie.nb_serie}
                                    to={!isLocked ? `/Examen?category=${encodeURIComponent(categoryParam)}&nb_serie=${serie.nb_serie}` : '#'}
                                    className={`premium-card reveal-anim ${isLocked ? 'disabled' : ''}`}
                                    style={{ position: 'relative' }}
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
                                    <div style={{ 
                                        background: 'var(--bg-accent)', borderRadius: '24px', overflow: 'hidden', 
                                        height: '100%', display: 'flex', flexDirection: 'column',
                                        border: '1px solid var(--glass-border)', boxShadow: '0 15px 35px -10px rgba(0,0,0,0.3)',
                                        position: 'relative'
                                    }}>
                                         {/* الجزء العلوي: الصورة */}
                                         <div style={{ width: '100%', height: '150px', position: 'relative' }}>
                                             <img 
                                                 src="https://i.ibb.co/7xmxRRMm/e0905461a321.jpg" 
                                                 alt="Exam" 
                                                 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                             />
                                             <div style={{ 
                                                 position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px',
                                                 background: 'linear-gradient(to top, var(--bg-accent), transparent)'
                                             }}></div>

                                             {/* زر التحديد (بنمط الأيقونة في الزاوية) */}
                                             <div 
                                                 onClick={(e) => toggleCheck(e, serieNum)}
                                                 style={{ 
                                                     position: 'absolute', 
                                                     top: '12px', 
                                                     left: '12px', 
                                                     cursor: 'pointer', 
                                                     color: checkedSeries[serieNum] ? '#10b981' : 'rgba(255,255,255,0.5)',
                                                     transition: 'all 0.3s ease',
                                                     zIndex: 10,
                                                     background: 'rgba(0,0,0,0.3)',
                                                     borderRadius: '50%',
                                                     padding: '4px'
                                                 }}
                                                 title="تحديد"
                                             >
                                                 <CircleCheckBig 
                                                     size={20} 
                                                     strokeWidth={checkedSeries[serieNum] ? 2.5 : 1.5}
                                                 />
                                             </div>
                                         </div>

                                         {/* الجزء السفلي: النصوص والأزرار */}
                                         <div className="card-body-premium" style={{ 
                                             padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', 
                                             alignItems: 'center', textAlign: 'center', justifyContent: 'center', gap: '8px'
                                         }}>
                                             <h3 className="card-title-premium" style={{ fontSize: '24px', marginBottom: '4px' }}>{serie.serieName}</h3>
                                             {serie.serieSubName && (
                                                 <p style={{ color: 'var(--secondary)', fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>{serie.serieSubName}</p>
                                             )}
                                             <p style={{ color: 'var(--text-gray)', fontSize: '13px' }}>اختبار تجريبي للمحور</p>
                                             
                                             <div style={{ marginTop: '15px', width: '100%' }}>
                                                 {isAdmin && (
                                                     <button 
                                                         onClick={(e) => openEditModal(e, { num: serie.nb_serie, name: serie.serieName, subName: serie.serieSubName })}
                                                         className="btn-premium-sm"
                                                         style={{ 
                                                             background: 'rgba(255,255,255,0.05)', 
                                                             border: '1px solid var(--glass-border)', 
                                                             color: 'white',
                                                             fontSize: '11px',
                                                             padding: '6px 15px',
                                                             borderRadius: '8px'
                                                         }}
                                                     >
                                                         تعديل السلسلة
                                                     </button>
                                                 )}
                                             </div>
                                         </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* MODAL للتعديل */}
                {showModal && (
                    <div className="overlay-premium" style={{ opacity: 1, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
                        <div className="reveal-anim" style={{ background: 'white', width: '95%', maxWidth: '400px', borderRadius: '24px', padding: '35px', position: 'relative', textAlign: 'center' }}>
                            <button 
                                onClick={() => setShowModal(false)}
                                style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                            
                            <div style={{ marginBottom: '25px' }}>
                                <div style={{ width: '60px', height: '60px', background: 'var(--bg-accent)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', margin: '0 auto 15px' }}>
                                    <Settings size={30} />
                                </div>
                                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a202c', marginBottom: '8px' }}>تعديل سلسلة الاختبار</h2>
                                <p style={{ color: '#718096', fontSize: '14px' }}>أنت الآن تقوم بتعديل السلسلة: {serieName}</p>
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4a5568' }}>نقل إلى فئة أخرى:</label>
                                <select 
                                    value={targetCategory}
                                    onChange={(e) => setTargetCategory(e.target.value)}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', background: 'white' }}
                                >
                                    {LICENSE_TYPES.map(type => (
                                        <option key={type} value={type}>صنف {type}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4a5568' }}>اسم السلسلة:</label>
                                <input 
                                    type="text" 
                                    value={serieName}
                                    onChange={(e) => setSerieName(e.target.value)}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px' }}
                                    placeholder="مثال: الاختبار الأول"
                                />
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4a5568' }}>الاسم الفرعي (مثل AA):</label>
                                <input 
                                    type="text" 
                                    value={serieSubName}
                                    onChange={(e) => setSerieSubName(e.target.value)}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px' }}
                                    placeholder="مثال: AA"
                                />
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '25px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: '#4a5568' }}>رقم السلسلة (للترتيب):</label>
                                <input 
                                    type="number" 
                                    value={newSerieNum}
                                    onChange={(e) => setNewSerieNum(e.target.value)}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '16px', textAlign: 'center' }}
                                />
                            </div>

                            <button 
                                onClick={handleUpdateSeries}
                                disabled={updating}
                                style={{ 
                                    width: '100%', 
                                    padding: '16px', 
                                    borderRadius: '16px', 
                                    background: updating ? '#cbd5e0' : 'var(--secondary)', 
                                    color: 'white', 
                                    border: 'none', 
                                    fontWeight: 800, 
                                    fontSize: '16px', 
                                    cursor: updating ? 'not-allowed' : 'pointer',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '10px'
                                }}
                            >
                                <Save size={20} />
                                {updating ? 'جاري التحديث...' : 'حفظ التغييرات'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

