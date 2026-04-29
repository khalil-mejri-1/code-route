import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Importer useNavigate
import axios from 'axios'; // ⭐️ Import Axios
import { User, Mail, Lock, Info, CheckCircle, X } from 'lucide-react';
import { API_BASE_URL } from '../config';
import Navbar from './navbar';
import ConfirmModal from './ConfirmModal'; // Reusing ConfirmModal styles for simplicity or creating a new one

const SignUp = ({ onToggleMode }) => {
    // 2. Initialiser la navigation
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // --- Validation Checks ---
        if (!fullName || !email || !password || !confirmPassword) {
            setError('يرجى ملء جميع الحقول');
            setLoading(false);
            return;
        }
        if (password.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setError('كلمتا المرور غير متطابقتين');
            setLoading(false);
            return;
        }
        if (!acceptedTerms) {
            setError('يجب الموافقة على شروط الاستخدام للمتابعة');
            setLoading(false);
            return;
        }
        // --- End Validation Checks ---

        try {
            // ⭐️ Real Backend Call
            await axios.post(`${API_BASE_URL}/auth/signup`, {
                fullName,
                email,
                password
            });

            // Success Logic
            console.log('Registration Successful!');
            // Optional: You can store initial data, but login usually handles tokens
            localStorage.setItem('userEmail', email);

            // Redirect to login
            navigate('/login');

        } catch (err) {
            console.error('Signup Error:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('فشل إنشاء الحساب. خطأ في الاتصال بالخادم.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1 className="auth-title">إنشاء حساب جديد</h1>
                        <p className="auth-subtitle">انضم إلينا وابدأ رحلتك التعليمية</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && <div className="auth-message auth-error">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="fullName" className="form-label">الاسم الكامل</label>
                            <div className="input-with-icon">
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="form-input"
                                    placeholder="أدخل اسمك الكامل"
                                    disabled={loading}
                                    required
                                />
                                <User className="input-icon" size={18} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">البريد الإلكتروني</label>
                            <div className="input-with-icon">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="form-input"
                                    placeholder="example@email.com"
                                    disabled={loading}
                                    required
                                />
                                <Mail className="input-icon" size={18} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">كلمة المرور</label>
                            <div className="input-with-icon">
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-input"
                                    placeholder="••••••••"
                                    disabled={loading}
                                    required
                                />
                                <Lock className="input-icon" size={18} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">تأكيد كلمة المرور</label>
                            <div className="input-with-icon">
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="form-input"
                                    placeholder="••••••••"
                                    disabled={loading}
                                    required
                                />
                                <Lock className="input-icon" size={18} />
                            </div>
                        </div>

                        <div className="form-group terms-group">
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                />
                                <span className="checkmark"></span>
                                <span className="checkbox-label">أوافق على شروط الاستخدام</span>
                            </label>
                            <button 
                                type="button" 
                                className="terms-link-btn"
                                onClick={() => setShowTermsModal(true)}
                            >
                                <Info size={14} />
                                عرض الشروط
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
                        </button>
                    </form>

                    {/* Terms of Use Modal */}
                    {showTermsModal && (
                        <div className="modal-overlay">
                            <div className="modal-content terms-modal reveal-anim">
                                <div className="modal-header">
                                    <h2 className="modal-title">شروط الاستخدام</h2>
                                    <button className="close-btn" onClick={() => setShowTermsModal(false)}><X size={18} /></button>
                                </div>
                                <div className="modal-body terms-text">
                                    <h3>أهلاً بك في منصتنا التعليمية</h3>
                                    <p>باستخدامك لهذا الموقع، فإنك توافق على الالتزام بالشروط التالية:</p>
                                    <ul>
                                        <li>يمنع منعاً باتاً محاولة فتح الحساب من أكثر من جهاز في نفس الوقت.</li>
                                        <li>في حال كشف النظام لدخول متزامن من جهازين مختلفين، سيتم تجميد الحساب تلقائياً للأمان.</li>
                                        <li>المحتوى مخصص للاستخدام الشخصي فقط ولا يجوز إعادة نشره.</li>
                                        <li>لإلغاء تجميد الحساب، يجب التواصل مع فريق الإدارة عبر صفحة اتصل بنا.</li>
                                    </ul>
                                    <div className="terms-footer-note">
                                        <CheckCircle size={18} className="text-primary" />
                                        <span>نحن نسعى لحماية خصوصيتك وضمان أفضل تجربة تعليمية لك.</span>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn-premium-sm" onClick={() => setShowTermsModal(false)}>فهمت ذلك</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="auth-footer">
                        <p className="auth-toggle-text">
                            لديك حساب بالفعل؟{' '}
                            {/* La prop onToggleMode est maintenue ici pour la flexibilité si ce composant est utilisé dans un mode modal */}
                            <Link to="/login" onClick={onToggleMode} className="auth-toggle-link">
                                تسجيل الدخول
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};
export default SignUp;