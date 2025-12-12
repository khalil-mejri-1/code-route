import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../comp/navbar';


const Login = ({ onToggleMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // تهيئة hook useNavigate
    const navigate = useNavigate();

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
            // ⭐️ Real Backend Call
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                email,
                password
            });

            // Login Success
            localStorage.setItem('login', 'true');
            // Store user data if needed (optional)
            if (response.data.user) {
                localStorage.setItem('userEmail', response.data.user.email);
                localStorage.setItem('userFullName', response.data.user.fullName);
            }

            navigate('/');

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

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                        </button>
                    </form>

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
