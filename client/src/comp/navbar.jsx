import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaDollarSign, FaCreditCard } from 'react-icons/fa'; // إضافة FaCreditCard للحساب/الاشتراكات

const Navbar = () => {
    const navigate = useNavigate();
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
                <button onClick={toggleAccountMenu} className="signup-button">
                    الحساب 
                </button>
                
                {isAccountMenuOpen && (
                    <div className="account-dropdown-menu">
                        {/* 5أ. تسجيل الخروج - مع أيقونة */}
                        <button onClick={handleLogout} className="dropdown-item">
                            {/* <FaSignOutAlt className="dropdown-icon" /> */}
                            تسجيل الخروج
                        </button>
                        
                        {/* 5ب. حالة الاشتراك الديناميكية */}
                        {isSubscribed ? (
                            <Link to="/profile" className="dropdown-item" onClick={toggleAccountMenu}>
                                {/* <FaCreditCard className="dropdown-icon" /> */}
                                  مشترك في باقاتنا
                            </Link>
                        ) : (
                            <Link to="/subscriptions" className="dropdown-item" onClick={toggleAccountMenu}>
                                {/* <FaDollarSign className="dropdown-icon" /> */}
                                لست مشترك في باقاتنا
                            </Link>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <nav className="navbar"> 
            <div className="navbar-logo">
                <span className="logo-text">DriveCode</span> 
            </div>

            {/* زر قائمة الهاتف (Burger Menu) */}
            <div className="menu-icon" onClick={toggleMenu}>
                <div className={`line line1 ${isOpen ? 'line1-open' : ''}`}></div>
                <div className={`line line2 ${isOpen ? 'line2-open' : ''}`}></div>
                <div className={`line line3 ${isOpen ? 'line3-open' : ''}`}></div>
            </div>

            {/* قائمة الروابط */}
            <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                <NavLink to="/" onClick={() => setIsOpen(false)}>الرئيسية</NavLink>
                <NavLink to="/courses" onClick={() => setIsOpen(false)}>الدروس</NavLink>
                <NavLink to="/examens" onClick={() => setIsOpen(false)}>الاختبارات</NavLink>
                {/* 6. عرض رابط الملف الشخصي فقط عند تسجيل الدخول */}
                {/* {isLoggedIn && <NavLink to="/profile" onClick={() => setIsOpen(false)}>الملف الشخصي</NavLink>}  */}
                <NavLink to="/contact" onClick={() => setIsOpen(false)}>اتصل بنا</NavLink>
            </div>

            {/* التحكم والأزرار الجانبية */}
            <div className="navbar-controls">
                {/* <button className="lang-button">FR</button>
                <button className="lang-button">AR</button> */}
                
                <AuthButton />

                {/* 7. تصحيح زر الاشتراك ليكون رابطًا */}
                <Link to="/subscriptions" className="abonnement-link">
                    <button className="abonement-button">اشتراك</button>
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;