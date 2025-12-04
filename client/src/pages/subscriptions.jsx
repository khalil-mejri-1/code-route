import React, { useState, useRef } from 'react';
import Navbar from '../comp/navbar';
import { FaMobileAlt, FaUniversity, FaUpload, FaCheckCircle, FaCreditCard, FaEnvelopeOpenText } from 'react-icons/fa';

export default function Subscriptions() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentReceipt, setPaymentReceipt] = useState(null);
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // إنشاء مرجع لـ input رفع الملف المخفي
    const fileInputRef = useRef(null);

    // دالة لتشغيل النقر على input رفع الملف المخفي
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

        // --- محاكاة عملية الإرسال (في بيئة الإنتاج يتم هنا إرسال البيانات إلى الخادم) ---

        setTimeout(() => {
            setLoading(false);
            setPhoneNumber('');
            
            // إعادة تعيين حالة إثبات الدفع ومدخل الملف
            setPaymentReceipt(null);
            if (fileInputRef.current) {
                 fileInputRef.current.value = null; 
            }

            // تسجيل حالة الاشتراك في localStorage
            localStorage.setItem('subscriptions', 'true'); // <-- تم إضافة هذا السطر ✅
            
            setConfirmationMessage('✅ تم استلام إثبات الدفع بنجاح! سيتصل بك المسؤول في غضون 24 ساعة.');
        }, 2000);
    };

    return (
        <>
            <Navbar />
            <div className="subscriptions-container">
                <header className="payment-header">
                    <h1>خيارات الدفع وتأكيد الاشتراك</h1>
                    <p>يرجى اختيار طريقة الدفع المناسبة واتباع الخطوات أدناه لتأكيد اشتراكك.</p>
                </header>

                {/* --- طرق الدفع المتاحة --- */}
                <section className="payment-instructions">
                    <h2>طرق الدفع المتاحة</h2>
                    <div className="payment-methods four-columns">
                        
                        {/* 1. D17 */}
                        <div className="method-card">
                            <FaMobileAlt className="method-icon mobile" />
                            <h3>1. الدفع عبر D17</h3>
                            <p>يمكنك تحويل المبلغ مباشرة عبر تطبيق D17 إلى الرقم التالي:</p>
                            <div className="rib-info d17-info">
                                <strong>+216 5X XXX XXX</strong>
                            </div>
                        </div>

                        {/* 2. تحويل بنكي (RIB) */}
                        <div className="method-card">
                            <FaUniversity className="method-icon bank" />
                            <h3>2. تحويل بنكي (RIB)</h3>
                            <p>قم بالتحويل البنكي باستخدام معلومات الحساب التالية:</p>
                            <div className="rib-info">
                                <strong>RIB:</strong> 08123456789012345678
                            </div>
                        </div>
                        
                        {/* 3. Flouci */}
                        <div className="method-card">
                            <FaCreditCard className="method-icon flouci" />
                            <h3>3. الدفع عبر Flouci</h3>
                            <p>قم بالدفع عبر تطبيق Flouci إلى رقم الهاتف/المعرّف التالي:</p>
                            <div className="rib-info flouci-info">
                                <strong>المعرّف:</strong> DriveCode / <strong>الهاتف:</strong> +216 9X XXX XXX
                            </div>
                        </div>
                        
                        {/* 4. تحويل بريدي (e-Dinar) */}
                        <div className="method-card">
                            <FaEnvelopeOpenText className="method-icon postal" />
                            <h3>4. تحويل بريدي (باستخدام بطاقة e-Dinar)</h3>
                            <p>يمكنك إرسال المبلغ عبر مكاتب البريد (Mandat Minute) إلى رقم بطاقة **e-Dinar** التالية:</p>
                            <div className="rib-info postal-info">
                                <strong>رقم البطاقة:</strong> 9999 1234 5678 XXXX
                            </div>
                        </div>
                        
                    </div>
                </section>
                
                <hr className="divider" />

                {/* --- تأكيد عملية الدفع --- */}
                <section className="confirmation-form-section">
                    <h2>تأكيد عملية الدفع</h2>
                    <p className="form-description">بعد إتمام عملية الدفع، يرجى ملء النموذج أدناه لإرسال إثبات الدفع ورقم هاتفك ليتسنى لنا تفعيل اشتراكك.</p>

                    {error && <div className="payment-error">{error}</div>}
                    {confirmationMessage && (
                        <div className="payment-success">
                            <FaCheckCircle className="success-icon" />
                            {confirmationMessage}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="confirmation-form">
                        
                        <div className="form-group">
                            <label htmlFor="phone">رقم الهاتف *</label>
                            <input
                                type="tel"
                                id="phone"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="مثال: 25172626"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="form-group file-upload-group">
                            <label htmlFor="receipt-upload">
                                إثبات الدفع (صورة للوصل أو لقطة شاشة) *
                            </label>
                            
                            {/* input رفع الملف الفعلي (مخفي) */}
                            <input
                                type="file"
                                id="receipt-upload"
                                ref={fileInputRef} 
                                accept="image/jpeg, image/png, application/pdf"
                                onChange={handleFileChange}
                                disabled={loading}
                                required
                                style={{ display: 'none' }} 
                            />
                            
                            {/* الزر المخصص الذي يتم النقر عليه */}
                            <div className="custom-file-input" onClick={triggerFileInput}>
                                <span className="upload-btn">
                                    <FaUpload /> رفع الملف
                                </span>
                                <span className="file-name">
                                    {paymentReceipt ? paymentReceipt.name : 'لم يتم اختيار ملف بعد'}
                                </span>
                            </div>
                        </div>
                        
                        <button type="submit" className="confirm-btn" disabled={loading}>
                            {loading ? 'جاري الإرسال...' : 'تأكيد وإرسال'}
                        </button>
                    </form>
                </section>
            </div>
        </>
    );
}