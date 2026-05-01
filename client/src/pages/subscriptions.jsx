import React, { useState, useRef } from 'react';
import Navbar from '../comp/navbar';
import { FaMobileAlt, FaUniversity, FaUpload, FaCheckCircle, FaCreditCard, FaEnvelopeOpenText } from 'react-icons/fa';
import { ShieldCheck, Smartphone, Landmark, MailOpen, CloudUpload, Check } from 'lucide-react';

const paymentMethods = [
    {
        icon: <Smartphone size={32} />,
        name: '1. الدفع عبر D17',
        desc: 'حول المبلغ مباشرة عبر تطبيق D17 إلى الرقم التالي:',
        value: '+216 5X XXX XXX',
        color: 'var(--primary)'
    },
    {
        icon: <Landmark size={32} />,
        name: '2. تحويل بنكي (RIB)',
        desc: 'قم بالتحويل البنكي باستخدام معلومات الحساب التالية:',
        value: 'RIB: 08123456789012345678',
        color: 'var(--secondary)'
    },
    {
        icon: <ShieldCheck size={32} />,
        name: '3. الدفع عبر Flouci',
        desc: 'قم بالدفع عبر تطبيق Flouci إلى المعرّف التالي:',
        value: 'المعرّف: DriveCode',
        color: 'var(--primary)'
    },
    {
        icon: <MailOpen size={32} />,
        name: '4. تحويل بريدي (e-Dinar)',
        desc: 'أرسل المبلغ عبر مكاتب البريد (Mandat Minute) للبطاقة:',
        value: '9999 1234 5678 XXXX',
        color: 'var(--secondary)'
    }
];

export default function Subscriptions() {
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

    return (
        <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', direction: 'rtl' }}>
            <Navbar />
            <div className="page-container">
                <header className="page-header reveal-anim">
                    <span className="badge-new">الاشتراك المميز</span>
                    <h1 className="page-title">تفعيل <span className="accent">العضوية</span></h1>
                    <p className="hero-desc" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        اختر وسيلة الدفع المناسبة لك وقم برفع وصل الدفع لتتمتع بكافة الدروس والاختبارات الحصرية.
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
        </div>
    );
}