import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FaSignOutAlt, FaDollarSign, FaCreditCard, FaUserCircle, FaArrowRight } from 'react-icons/fa'; // إضافة FaCreditCard للحساب/الاشتراكات

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const accountMenuRef = useRef(null);

    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false); // 1. حالة الاشتراك الجديدة
    const [isOpen, setIsOpen] = useState(false); // Menu Burger

    // دالة تحقق من حالة تسجيل الدخول والاشتراك معاً
    const checkAuthStatus = () => {
        const loginStatus = localStorage.getItem('login') === 'true';
        const subscriptionStatus = localStorage.getItem('subscriptions') === 'true'; // 2. قراءة حالة الاشتراك
        setIsLoggedIn(loginStatus);
        setIsSubscribed(subscriptionStatus);
    };

    const toggleMenu = () => {
        setIsOpen(prev => !prev);
        if (isAccountMenuOpen) setIsAccountMenuOpen(false);
    };

    const toggleAccountMenu = () => {
        setIsAccountMenuOpen(prev => !prev);
        if (isOpen) setIsOpen(false);
    };

    const handleLogout = () => {
        // إزالة بيانات المصادقة
        localStorage.removeItem('login');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userFullName');

        // لا نحذف 'subscriptions' هنا، بل نتركها لتُحذف يدوياً عند إلغاء الاشتراك فعلياً

        setIsLoggedIn(false);
        setIsAccountMenuOpen(false);

        navigate('/login');
    };

    // --- 3. لوجيك إغلاق القائمة عند النقر خارجها ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
                setIsAccountMenuOpen(false);
            }
        };

        if (isAccountMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAccountMenuOpen]);

    // --- 4. التحقق من حالة المصادقة والاشتراك عند التحميل وأي تغيير في التخزين ---
    useEffect(() => {
        checkAuthStatus();
        window.addEventListener('storage', checkAuthStatus);
        return () => {
            window.removeEventListener('storage', checkAuthStatus);
        };
    }, []);

    // --- 5. مكون زر المصادقة ---
    const AuthButton = () => {
        if (!isLoggedIn) {
            return (
                <Link to="/login" className="signup-button">
                    تسجيل الدخول
                </Link>
            );
        }

        return (
            <div className="account-dropdown-container" ref={accountMenuRef}>
                <button onClick={toggleAccountMenu} className="account-trigger-button">
                    <FaUserCircle className="account-icon" />
                    <span className="account-text">الحساب</span>
                </button>

                {isAccountMenuOpen && (
                    <div className="account-dropdown-menu">
                        <div className="dropdown-header">
                            <span className="user-name">{localStorage.getItem('userFullName') || 'المستخدم'}</span>
                        </div>
                        <div className="dropdown-divider"></div>

                        {/* 5أ. تسجيل الخروج - مع أيقونة */}

                        {/* 5ب. حالة الاشتراك الديناميكية */}
                        {isSubscribed ? (
                            <Link to="/profile" className="dropdown-item" onClick={toggleAccountMenu}>
                                <FaCreditCard className="dropdown-icon" />
                                <span>الاشتراك (نشط)</span>
                            </Link>
                        ) : (
                            <Link to="/subscriptions" className="dropdown-item" onClick={toggleAccountMenu}>
                                <FaDollarSign className="dropdown-icon" />
                                <span>اشترك الآن</span>
                            </Link>
                        )}

                        <button onClick={handleLogout} className="dropdown-item logout-item">
                            <FaSignOutAlt className="dropdown-icon" />
                            تسجيل الخروج
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/" className="logo-text">Drive</Link>
            </div>

            {/* Main Navigation (Desktop + Mobile Drawer) */}
            <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                <NavLink to="/" onClick={() => setIsOpen(false)}>الرئيسية</NavLink>
                <NavLink to="/courses" onClick={() => setIsOpen(false)}>الدروس</NavLink>
                <NavLink to="/examens" onClick={() => setIsOpen(false)}>الاختبارات</NavLink>
                <NavLink to="/contact" onClick={() => setIsOpen(false)}>اتصل بنا</NavLink>

                {/* Mobile-only Subscribe Button (Auth is now in header) */}
                <div className="mobile-auth-buttons">
                    <Link to="/subscriptions" className="abonnement-link" onClick={() => setIsOpen(false)}>
                        <button className="abonement-button">اشتراك</button>
                    </Link>
                </div>
            </div>

            {/* Header Actions (Visible on both) */}
            <div className="navbar-actions">
                <AuthButton />

                {/* Desktop Subscribe Button */}
                <Link to="/subscriptions" className="abonnement-link desktop-only">
                    <button className="abonement-button">اشتراك</button>
                </Link>

                {/* Mobile Menu Toggle */}
                <div className="menu-icon" onClick={toggleMenu}>
                    <div className={`line line1 ${isOpen ? 'line1-open' : ''}`}></div>
                    <div className={`line line2 ${isOpen ? 'line2-open' : ''}`}></div>
                    <div className={`line line3 ${isOpen ? 'line3-open' : ''}`}></div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;