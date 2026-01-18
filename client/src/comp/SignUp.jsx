import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Importer useNavigate
import axios from 'axios'; // ⭐️ Import Axios
import Navbar from './navbar';



const SignUp = ({ onToggleMode }) => {
    // 2. Initialiser la navigation
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
        // --- End Validation Checks ---

        try {
            // ⭐️ Real Backend Call
            await axios.post('https://code-route-rho.vercel.app/api/auth/signup', {
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
                        {error && <div className="auth-error">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="fullName" className="form-label">الاسم الكامل</label>
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
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">البريد الإلكتروني</label>
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
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">كلمة المرور</label>
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
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">تأكيد كلمة المرور</label>
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
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
                        </button>
                    </form>

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