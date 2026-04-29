import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Info, CheckCircle, X } from 'lucide-react';
import { API_BASE_URL } from '../config';
import Navbar from '../comp/navbar';


const Login = ({ onToggleMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTermsInfoModal, setShowTermsInfoModal] = useState(false);

    const navigate = useNavigate();

    // دالة لجلب أو إنشاء بصمة الجهاز
    const getDeviceId = () => {
        let deviceId = localStorage.getItem('device_fingerprint');
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('device_fingerprint', deviceId);
        }
        return deviceId;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('يرجى ملء جميع الحقول');
            setLoading(false);
            return;
        }

        try {
            const deviceId = getDeviceId();
            // ⭐️ Real Backend Call with deviceId
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password,
                deviceId
            });

            // Login Success
            localStorage.setItem('login', 'true');
            if (response.data.user) {
                localStorage.setItem('userEmail', response.data.user.email);
                localStorage.setItem('userFullName', response.data.user.fullName);
                localStorage.setItem('isApproved', response.data.user.isApproved.toString());
                localStorage.setItem('role', response.data.user.role || 'user');
                localStorage.setItem('isApproved', response.data.user.isApproved.toString());
                const isVip = response.data.user.isApproved || response.data.user.subscriptions || false;
                localStorage.setItem('subscriptions', isVip.toString());
            }

            // إظهار نافذة التنبيه بالقوانين بعد أول دخول ناجح
            setShowTermsInfoModal(true);

        } catch (err) {
            // Login Failure
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('فشل تسجيل الدخول. خطأ في الاتصال بالخادم.');
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
                        <h1 className="auth-title">تسجيل الدخول</h1>
                        <p className="auth-subtitle">مرحباً بك في منصة التدريب على قانون السير</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {/* Display error message only */}
                        {error &&
                            <div className="auth-message auth-error">
                                {error}
                            </div>
                        }

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

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                        </button>
                    </form>

                    {/* Terms Info Modal After Login */}
                    {showTermsInfoModal && (
                        <div className="modal-overlay">
                            <div className="modal-content reveal-anim" style={{ maxWidth: '450px', textAlign: 'right' }}>
                                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
                                    <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
                                        <Info size={24} />
                                        تنبيه هام للأمان
                                    </h2>
                                    <button className="close-btn" onClick={() => { setShowTermsInfoModal(false); navigate('/'); }}><X size={18} /></button>
                                </div>
                                <div className="modal-body" style={{ padding: '20px 0', direction: 'rtl' }}>
                                    <p style={{ color: 'white', fontWeight: '700', marginBottom: '15px', fontSize: '16px' }}>
                                        عزيزي المستخدم، لضمان حماية حسابك:
                                    </p>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        <li style={{ marginBottom: '12px', color: 'var(--text-gray)', fontSize: '14px', display: 'flex', gap: '10px' }}>
                                            <CheckCircle size={16} className="text-primary" style={{ flexShrink: 0, marginTop: '3px' }} />
                                            <span>يسمح باستخدام الحساب من جهاز واحد فقط في نفس الوقت.</span>
                                        </li>
                                        <li style={{ marginBottom: '12px', color: 'var(--text-gray)', fontSize: '14px', display: 'flex', gap: '10px' }}>
                                            <CheckCircle size={16} className="text-primary" style={{ flexShrink: 0, marginTop: '3px' }} />
                                            <span>إذا تم اكتشاف دخول من جهازين مختلفين، سيتم **تجميد الحساب فوراً** وتسجيل الخروج.</span>
                                        </li>
                                        <li style={{ color: 'var(--text-gray)', fontSize: '14px', display: 'flex', gap: '10px' }}>
                                            <CheckCircle size={16} className="text-primary" style={{ flexShrink: 0, marginTop: '3px' }} />
                                            <span>في حال تم تجميد حسابك، يرجى التواصل مع الإدارة لإعادة تفعيله.</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="modal-footer" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '15px', display: 'flex', justifyContent: 'center' }}>
                                    <button 
                                        className="btn-premium" 
                                        style={{ padding: '12px 40px', fontSize: '16px' }}
                                        onClick={() => {
                                            setShowTermsInfoModal(false);
                                            navigate('/');
                                        }}
                                    >
                                        أوافق وأرغب في المتابعة
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="auth-footer">
                        <p className="auth-toggle-text">
                            ليس لديك حساب؟{' '}
                            <Link to="/SignUp" onClick={onToggleMode} className="auth-toggle-link">
                                إنشاء حساب جديد
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

        </>
    );
};

export default Login;
