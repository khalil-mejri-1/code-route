import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../comp/navbar';
import { API_BASE_URL } from '../../config';
import './MoveSeries.css';

const MoveSeries = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [sourceCategory, setSourceCategory] = useState('');
    const [availableSeries, setAvailableSeries] = useState([]);
    const [selectedSeries, setSelectedSeries] = useState([]);
    const [targetCategory, setTargetCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/categories`);
                setCategories(res.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch series when source category changes
    useEffect(() => {
        if (sourceCategory) {
            const fetchSeries = async () => {
                try {
                    const res = await axios.get(`${API_BASE_URL}/quiz/series?category1=${encodeURIComponent(sourceCategory)}`);
                    setAvailableSeries(res.data);
                    setSelectedSeries([]); // Reset selection
                } catch (err) {
                    console.error('Error fetching series:', err);
                }
            };
            fetchSeries();
        } else {
            setAvailableSeries([]);
            setSelectedSeries([]);
        }
    }, [sourceCategory]);

    const toggleSeriesSelection = (serieNum) => {
        setSelectedSeries(prev => 
            prev.includes(serieNum) 
                ? prev.filter(num => num !== serieNum) 
                : [...prev, serieNum]
        );
    };

    const handleSelectAll = () => {
        if (selectedSeries.length === availableSeries.length) {
            setSelectedSeries([]);
        } else {
            setSelectedSeries([...availableSeries]);
        }
    };

    const handleMove = async (e) => {
        e.preventDefault();
        if (!sourceCategory || selectedSeries.length === 0 || !targetCategory) {
            setStatus({ type: 'error', message: '⚠️ الرجاء ملء جميع الحقول واختيار سلسلة واحدة على الأقل.' });
            return;
        }

        if (sourceCategory === targetCategory) {
            setStatus({ type: 'error', message: '⚠️ لا يمكن نقل السلسلة إلى نفس الفئة.' });
            return;
        }

        if (!window.confirm(`هل أنت متأكد من نقل ${selectedSeries.length} سلسلة من فئة "${sourceCategory}" إلى فئة "${targetCategory}"؟\nسيتم إعادة ترقيمها تلقائياً بالترتيب.`)) {
            return;
        }

        setLoading(true);
        setStatus({ type: 'loading', message: '🔄 جارٍ نقل السلاسل وتحديث البيانات...' });

        try {
            const res = await axios.post(`${API_BASE_URL}/quiz/series/move`, {
                sourceCategory,
                sourceSeries: selectedSeries,
                targetCategory
            });

            setStatus({ 
                type: 'success', 
                message: `✅ تم بنجاح! تم نقل ${selectedSeries.length} سلسلة إلى فئة "${targetCategory}".` 
            });
            
            // Refresh available series
            const refreshed = await axios.get(`${API_BASE_URL}/quiz/series?category1=${encodeURIComponent(sourceCategory)}`);
            setAvailableSeries(refreshed.data);
            setSelectedSeries([]);
        } catch (err) {
            setStatus({ 
                type: 'error', 
                message: `❌ فشل النقل: ${err.response?.data?.message || err.message}` 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="move-series-page">
            <Navbar />
            <div className="move-series-container">
                <header className="page-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>🔙 العودة</button>
                    <h1>نقل السلاسل بالجملة</h1>
                    <p>اختر السلاسل التي تريد نقلها إلى فئة أخرى. سيتم ترقيمها آلياً حسب آخر سلسلة في الفئة المستهدفة.</p>
                </header>

                <div className="move-card">
                    <form onSubmit={handleMove}>
                        <div className="form-section">
                            <h3>1. السلاسل المصدر (Source Selection)</h3>
                            <div className="input-group">
                                <label>الفئة الحالية:</label>
                                <select 
                                    value={sourceCategory} 
                                    onChange={(e) => setSourceCategory(e.target.value)}
                                    required
                                >
                                    <option value="">اختر الفئة...</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat.category}>{cat.category}</option>
                                    ))}
                                </select>
                            </div>

                            {sourceCategory && availableSeries.length > 0 && (
                                <div className="series-selection-area animate-in">
                                    <div className="selection-header">
                                        <label>اختر السلاسل ({selectedSeries.length} مختارة):</label>
                                        <button type="button" className="select-all-btn" onClick={handleSelectAll}>
                                            {selectedSeries.length === availableSeries.length ? 'إلغاء الكل' : 'تحديد الكل'}
                                        </button>
                                    </div>
                                    <div className="series-grid">
                                        {availableSeries.map(num => (
                                            <div 
                                                key={num} 
                                                className={`series-item-card ${selectedSeries.includes(num) ? 'selected' : ''}`}
                                                onClick={() => toggleSeriesSelection(num)}
                                            >
                                                <div className="check-icon">{selectedSeries.includes(num) ? '✅' : '📦'}</div>
                                                <span className="serie-number">سلسلة {num}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {sourceCategory && availableSeries.length === 0 && (
                                <p className="hint">لا توجد سلاسل في هذه الفئة.</p>
                            )}
                        </div>

                        <div className="arrow-divider">
                            <span>⬇️</span>
                        </div>

                        <div className="form-section">
                            <h3>2. الفئة الهدف (Target)</h3>
                            <div className="input-group">
                                <label>انقل إلى فئة:</label>
                                <select 
                                    value={targetCategory} 
                                    onChange={(e) => setTargetCategory(e.target.value)}
                                    required
                                >
                                    <option value="">اختر الفئة الجديدة...</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat.category}>{cat.category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {status && (
                            <div className={`status-banner ${status.type}`}>
                                {status.message}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="submit-move-btn" 
                            disabled={loading || !sourceCategory || selectedSeries.length === 0 || !targetCategory}
                        >
                            {loading ? '⏳ جاري المعالجة...' : `🚀 نقل ${selectedSeries.length} سلسلة الآن`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MoveSeries;
