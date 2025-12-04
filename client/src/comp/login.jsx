import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../comp/navbar'; // ⭐️ تم تصحيح مسار الاستيراد

// Define the keys we expect to find in localStorage from the SignUp process
const USER_EMAIL_KEY = 'userEmail';
// NOTE: This key is used for demonstration ONLY. Storing passwords is insecure!
const USER_PASSWORD_KEY = 'userPassword'; 

// Placeholder/Mock function for sign-in logic
const mockSignIn = (email, password) => {
    // 1. Get the stored data from localStorage
    const storedEmail = localStorage.getItem(USER_EMAIL_KEY);
    
    // For a realistic test against localStorage, we check if the email matches
    // AND the password matches the mock testing password 'test1234'.
    // NOTE: This is MOCK authentication. In a real app, you'd use Firebase/Backend service.
    if (storedEmail === email && password === 'test1234') { 
        // Success
        return new Promise(resolve => setTimeout(() => resolve({ error: null }), 500)); 
    }
    
    // Failure
    return new Promise(resolve => setTimeout(() => resolve({ error: 'Mismatch' }), 500)); 
};


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

        // 1. Attempt the mock sign-in logic
        const { error: signInError } = await mockSignIn(email, password); 

        // 2. Handle result
        if (signInError) {
            // Failure: Display error message
            setError('فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور المسجلين.');
        } else {
            // Success: Store flag and redirect
            
            // ⭐️ المطلوب 1: تخزين قيمة 'login=true' في localStorage
            localStorage.setItem('login', 'true');
            
            // ⭐️ المطلوب 2: إعادة التوجيه إلى الصفحة الرئيسية
            navigate('/'); 

            // لا حاجة لتعيين رسالة نجاح في الخطأ (setError) لأنه سيتم إعادة توجيه المستخدم فوراً
        }

        setLoading(false);
    };

    return (
        <>
        <Navbar/>
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
