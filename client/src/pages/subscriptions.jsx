import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../comp/navbar';
import { FaMobileAlt, FaUniversity, FaUpload, FaCheckCircle, FaCreditCard, FaEnvelopeOpenText } from 'react-icons/fa';
import { ShieldCheck, Smartphone, Landmark, MailOpen, CloudUpload, Check, Edit3, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from '../config';

export default function Subscriptions() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Content state with default fallbacks
    const [content, setContent] = useState({
        badgeText: 'الاشتراك المميز',
        titlePart1: 'تفعيل ',
        titlePart2: 'العضوية',
        desc: 'اختر وسيلة الدفع المناسبة لك وقم برفع وصل الدفع لتتمتع بكافة الدروس والاختبارات الحصرية.',
        
        pm1Name: '1. الدفع عبر D17',
        pm1Desc: 'حول المبلغ مباشرة عبر تطبيق D17 إلى الرقم التالي:',
        pm1Value: '+216 5X XXX XXX',
        
        pm2Name: '2. تحويل بنكي (RIB)',
        pm2Desc: 'قم بالتحويل البنكي باستخدام معلومات الحساب التالية:',
        pm2Value: 'RIB: 08123456789012345678',
        
        pm3Name: '3. الدفع عبر Flouci',
        pm3Desc: 'قم بالدفع عبر تطبيق Flouci إلى المعرّف التالي:',
        pm3Value: 'المعرّف: DriveCode',
        
        pm4Name: '4. تحويل بريدي (e-Dinar)',
        pm4Desc: 'أرسل المبلغ عبر مكاتب البريد (Mandat Minute) للبطاقة:',
        pm4Value: '9999 1234 5678 XXXX',
    });

    // Modal form states
    const [formBadgeText, setFormBadgeText] = useState(content.badgeText);
    const [formTitlePart1, setFormTitlePart1] = useState(content.titlePart1);
    const [formTitlePart2, setFormTitlePart2] = useState(content.titlePart2);
    const [formDesc, setFormDesc] = useState(content.desc);
    
    const [formPm1Name, setFormPm1Name] = useState(content.pm1Name);
    const [formPm1Desc, setFormPm1Desc] = useState(content.pm1Desc);
    const [formPm1Value, setFormPm1Value] = useState(content.pm1Value);
    
    const [formPm2Name, setFormPm2Name] = useState(content.pm2Name);
    const [formPm2Desc, setFormPm2Desc] = useState(content.pm2Desc);
    const [formPm2Value, setFormPm2Value] = useState(content.pm2Value);
    
    const [formPm3Name, setFormPm3Name] = useState(content.pm3Name);
    const [formPm3Desc, setFormPm3Desc] = useState(content.pm3Desc);
    const [formPm3Value, setFormPm3Value] = useState(content.pm3Value);
    
    const [formPm4Name, setFormPm4Name] = useState(content.pm4Name);
    const [formPm4Desc, setFormPm4Desc] = useState(content.pm4Desc);
    const [formPm4Value, setFormPm4Value] = useState(content.pm4Value);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentReceipt, setPaymentReceipt] = useState(null);
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fileInputRef = useRef(null);

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 5 * 1024 * 1024) {
            setError('حجم الملف كبير جداً. الحد الأقصى هو 5 ميغابايت.');
            setPaymentReceipt(null);
        } else if (file) {
            setPaymentReceipt(file);
            setError('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setConfirmationMessage('');

        if (!phoneNumber || phoneNumber.length < 8) {
            setError('يرجى إدخال رقم هاتف صحيح (8 أرقام على الأقل).');
            return;
        }
        if (!paymentReceipt) {
            setError('يرجى رفع صورة إثبات الدفع.');
            return;
        }

        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            setPhoneNumber('');
            setPaymentReceipt(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
            localStorage.setItem('subscriptions', 'true');
            setConfirmationMessage('✅ تم استلام إثبات الدفع بنجاح! سيتصل بك المسؤول في غضون 24 ساعة.');
        }, 2000);
    };

    useEffect(() => {
        setIsAdmin(localStorage.getItem('role') === 'admin');

        const fetchContent = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/content/subscriptions_page_content`);
                if (response.ok) {
                    const data = await response.json();
                    setContent(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error('Failed to fetch subscriptions page content:', error);
            }
        };
        fetchContent();
    }, []);

    const handleSaveContent = async (e) => {
        e.preventDefault();
        const newContent = {
            badgeText: formBadgeText,
            titlePart1: formTitlePart1,
            titlePart2: formTitlePart2,
            desc: formDesc,
            
            pm1Name: formPm1Name,
            pm1Desc: formPm1Desc,
            pm1Value: formPm1Value,
            
            pm2Name: formPm2Name,
            pm2Desc: formPm2Desc,
            pm2Value: formPm2Value,
            
            pm3Name: formPm3Name,
            pm3Desc: formPm3Desc,
            pm3Value: formPm3Value,
            
            pm4Name: formPm4Name,
            pm4Desc: formPm4Desc,
            pm4Value: formPm4Value,
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/content/subscriptions_page_content`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newContent),
            });
            if (response.ok) {
                setContent(newContent);
                setShowEditModal(false);
            } else {
                alert('حدث خطأ أثناء حفظ المحتوى في قاعدة البيانات');
            }
        } catch (error) {
            console.error('Failed to save subscriptions page content:', error);
            alert('حدث خطأ أثناء حفظ المحتوى');
        }
    };

    const paymentMethods = [
        {
            icon: <Smartphone size={32} />,
            name: content.pm1Name,
            desc: content.pm1Desc,
            value: content.pm1Value,
            color: 'var(--primary)'
        },
        {
            icon: <Landmark size={32} />,
            name: content.pm2Name,
            desc: content.pm2Desc,
            value: content.pm2Value,
            color: 'var(--secondary)'
        },
        {
            icon: <ShieldCheck size={32} />,
            name: content.pm3Name,
            desc: content.pm3Desc,
            value: content.pm3Value,
            color: 'var(--primary)'
        },
        {
            icon: <MailOpen size={32} />,
            name: content.pm4Name,
            desc: content.pm4Desc,
            value: content.pm4Value,
            color: 'var(--secondary)'
        }
    ];

    return (
        <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', direction: 'rtl' }} className="premium-section-editable">
            <Navbar />
            
            {/* Admin Floating Edit Button */}
            {isAdmin && (
                <button 
                    onClick={() => {
                        setFormBadgeText(content.badgeText);
                        setFormTitlePart1(content.titlePart1);
                        setFormTitlePart2(content.titlePart2);
                        setFormDesc(content.desc);
                        
                        setFormPm1Name(content.pm1Name);
                        setFormPm1Desc(content.pm1Desc);
                        setFormPm1Value(content.pm1Value);
                        
                        setFormPm2Name(content.pm2Name);
                        setFormPm2Desc(content.pm2Desc);
                        setFormPm2Value(content.pm2Value);
                        
                        setFormPm3Name(content.pm3Name);
                        setFormPm3Desc(content.pm3Desc);
                        setFormPm3Value(content.pm3Value);
                        
                        setFormPm4Name(content.pm4Name);
                        setFormPm4Desc(content.pm4Desc);
                        setFormPm4Value(content.pm4Value);
                        
                        setShowEditModal(true);
                    }} 
                    className="admin-edit-section-btn"
                    style={{ top: '100px' }}
                >
                    <Edit3 size={15} />
                    <span>تعديل قسم الاشتراكات</span>
                </button>
            )}

            <div className="page-container">
                <header className="page-header reveal-anim">
                    <span className="badge-new">{content.badgeText}</span>
                    <h1 className="page-title">{content.titlePart1}<span className="accent">{content.titlePart2}</span></h1>
                    <p className="hero-desc" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        {content.desc}
                    </p>
                </header>

                <div className="cards-grid" style={{ marginBottom: '80px' }}>
                    {paymentMethods.map((m, i) => (
                        <div className="feature-card-premium reveal-anim" key={i} style={{ animationDelay: `${i * 0.15}s`, padding: '32px' }}>
                            <div className="feature-icon-wrapper" style={{ color: m.color, background: `${m.color}15` }}>
                                {m.icon}
                            </div>
                            <h3 className="card-title-premium" style={{ fontSize: '20px' }}>{m.name}</h3>
                            <p className="card-desc-premium" style={{ marginBottom: '20px' }}>{m.desc}</p>
                            <div style={{ background: 'var(--bg-darker)', padding: '15px', borderRadius: '12px', border: '1px dashed var(--glass-border)', textAlign: 'center', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px' }}>
                                {m.value}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="reveal-anim" style={{ maxWidth: '700px', margin: '0 auto', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', padding: '50px', borderRadius: 'var(--radius-2xl)', backdropFilter: 'var(--glass-blur)' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', textAlign: 'center' }}>إرسال إثبات الدفع</h2>
                    <p style={{ color: 'var(--text-gray)', textAlign: 'center', marginBottom: '40px' }}>بعد إتمام عملية الدفع، يرجى ملء النموذج أدناه لطلب تفعيل حسابك.</p>

                    {error && <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', padding: '15px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(244,63,94,0.2)', textAlign: 'center' }}>{error}</div>}
                    {confirmationMessage && (
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '15px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <Check size={20} />
                            {confirmationMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: 'var(--text-white)' }}>رقم الهاتف الخاص بك</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="مثال: 25172626"
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--bg-darker)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '16px', outline: 'none' }}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: 'var(--text-white)' }}>إثبات الدفع (صورة الوصل)</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*,application/pdf"
                                onChange={handleFileChange}
                                disabled={loading}
                                required
                                style={{ display: 'none' }}
                            />
                            <div
                                onClick={triggerFileInput}
                                style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '2px dashed var(--glass-border)', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                            >
                                <div style={{ width: '45px', height: '45px', background: 'var(--bg-accent)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <CloudUpload size={24} />
                                </div>
                                <div style={{ flexGrow: 1 }}>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>{paymentReceipt ? paymentReceipt.name : 'اختر صورة الوصل...'}</p>
                                    <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '12px' }}>JPG, PNG أو PDF (بحد أقصى 5MB)</p>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn-premium" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
                            {loading ? 'جاري المعالجة...' : 'تأكيد الطلب الآن'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Futuristic Glassmorphism Edit Modal rendered with React Portal */}
            {showEditModal && createPortal(
                <div className="admin-modal-overlay">
                    <div className="admin-modal-card">
                        <div className="admin-modal-header">
                            <div className="admin-modal-title">
                                <Edit3 size={22} style={{ color: '#10b981' }} />
                                <span>تعديل محتوى قسم الاشتراكات</span>
                            </div>
                            <button type="button" onClick={() => setShowEditModal(false)} className="admin-modal-close">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <form onSubmit={handleSaveContent}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">النص الجانبي (Badge)</label>
                                        <input type="text" value={formBadgeText} onChange={(e) => setFormBadgeText(e.target.value)} className="admin-form-input" />
                                    </div>
                                    <div className="admin-form-group">
                                        <label className="admin-form-label">الجزء الأول من العنوان</label>
                                        <input type="text" value={formTitlePart1} onChange={(e) => setFormTitlePart1(e.target.value)} className="admin-form-input" />
                                    </div>
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-form-label">الجزء الثاني من العنوان (ملون)</label>
                                    <input type="text" value={formTitlePart2} onChange={(e) => setFormTitlePart2(e.target.value)} className="admin-form-input" />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-form-label">الوصف</label>
                                    <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="admin-form-input admin-form-textarea" rows="2"></textarea>
                                </div>
                                
                                <h4 style={{ color: 'var(--primary)', marginTop: '20px', marginBottom: '10px' }}>الطريقة 1 (D17)</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                    <div className="admin-form-group"><label className="admin-form-label">الاسم</label><input type="text" value={formPm1Name} onChange={(e) => setFormPm1Name(e.target.value)} className="admin-form-input" /></div>
                                    <div className="admin-form-group"><label className="admin-form-label">الوصف</label><input type="text" value={formPm1Desc} onChange={(e) => setFormPm1Desc(e.target.value)} className="admin-form-input" /></div>
                                    <div className="admin-form-group"><label className="admin-form-label">القيمة</label><input type="text" value={formPm1Value} onChange={(e) => setFormPm1Value(e.target.value)} className="admin-form-input" /></div>
                                </div>

                                <h4 style={{ color: 'var(--secondary)', marginTop: '10px', marginBottom: '10px' }}>الطريقة 2 (RIB)</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                    <div className="admin-form-group"><label className="admin-form-label">الاسم</label><input type="text" value={formPm2Name} onChange={(e) => setFormPm2Name(e.target.value)} className="admin-form-input" /></div>
                                    <div className="admin-form-group"><label className="admin-form-label">الوصف</label><input type="text" value={formPm2Desc} onChange={(e) => setFormPm2Desc(e.target.value)} className="admin-form-input" /></div>
                                    <div className="admin-form-group"><label className="admin-form-label">القيمة</label><input type="text" value={formPm2Value} onChange={(e) => setFormPm2Value(e.target.value)} className="admin-form-input" /></div>
                                </div>

                                <h4 style={{ color: 'var(--primary)', marginTop: '10px', marginBottom: '10px' }}>الطريقة 3 (Flouci)</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                    <div className="admin-form-group"><label className="admin-form-label">الاسم</label><input type="text" value={formPm3Name} onChange={(e) => setFormPm3Name(e.target.value)} className="admin-form-input" /></div>
                                    <div className="admin-form-group"><label className="admin-form-label">الوصف</label><input type="text" value={formPm3Desc} onChange={(e) => setFormPm3Desc(e.target.value)} className="admin-form-input" /></div>
                                    <div className="admin-form-group"><label className="admin-form-label">القيمة</label><input type="text" value={formPm3Value} onChange={(e) => setFormPm3Value(e.target.value)} className="admin-form-input" /></div>
                                </div>

                                <h4 style={{ color: 'var(--secondary)', marginTop: '10px', marginBottom: '10px' }}>الطريقة 4 (e-Dinar)</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                    <div className="admin-form-group"><label className="admin-form-label">الاسم</label><input type="text" value={formPm4Name} onChange={(e) => setFormPm4Name(e.target.value)} className="admin-form-input" /></div>
                                    <div className="admin-form-group"><label className="admin-form-label">الوصف</label><input type="text" value={formPm4Desc} onChange={(e) => setFormPm4Desc(e.target.value)} className="admin-form-input" /></div>
                                    <div className="admin-form-group"><label className="admin-form-label">القيمة</label><input type="text" value={formPm4Value} onChange={(e) => setFormPm4Value(e.target.value)} className="admin-form-input" /></div>
                                </div>

                                <div className="admin-modal-footer">
                                    <button type="button" onClick={() => setShowEditModal(false)} className="admin-btn-cancel">إلغاء</button>
                                    <button type="submit" className="admin-btn-save">حفظ التغييرات</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}