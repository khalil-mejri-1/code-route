import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import { Menu, X, User, LogOut, Zap, LayoutDashboard } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Navbar = () => {
    const navigate = useNavigate();
    const accountMenuRef = useRef(null);

    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [role, setRole] = useState(localStorage.getItem('role') || 'user');

    const fetchUserStatus = async () => {
        const email = localStorage.getItem('userEmail');
        const loginStatus = localStorage.getItem('login') === 'true';
        if (loginStatus && email) {
            try {
                const response = await fetch(`${API_BASE_URL}/users/status?email=${email}`);
                const data = await response.json();

                if (data.isFrozen) {
                    localStorage.removeItem('login');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userFullName');
                    localStorage.removeItem('role');
                    localStorage.removeItem('subscriptions');
                    window.location.href = '/login';
                    return;
                }

                if (data.role) {
                    localStorage.setItem('role', data.role);
                    setRole(data.role);
                }

                if (data.isApproved !== undefined) {
                    localStorage.setItem('isApproved', data.isApproved.toString());
                }

                if (data.subscriptions !== undefined) {
                    // نأخذ القيمة الأقوى (سواء من الحقل المباشر أو من حالة القبول)
                    const isVip = data.isApproved || data.subscriptions;
                    localStorage.setItem('subscriptions', isVip.toString());
                    setIsSubscribed(isVip);
                }
            } catch (error) {
                console.error('Error fetching user status in navbar:', error);
            }
        }
    };

    const checkAuthStatus = () => {
        const loginStatus = localStorage.getItem('login') === 'true';
        const isApproved = localStorage.getItem('isApproved') === 'true';
        // إذا كان الحساب مقبولاً، فهو VIP تلقائياً
        const subscriptionStatus = (localStorage.getItem('subscriptions') === 'true') || isApproved;
        const currentRole = localStorage.getItem('role') || 'user';

        setIsLoggedIn(loginStatus);
        setIsSubscribed(subscriptionStatus);
        setRole(currentRole);
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        if (isAccountMenuOpen) setIsAccountMenuOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('login');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userFullName');
        localStorage.removeItem('role');
        localStorage.removeItem('subscriptions');
        setIsLoggedIn(false);
        setIsAccountMenuOpen(false);
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
                setIsAccountMenuOpen(false);
            }
        };
        if (isAccountMenuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isAccountMenuOpen]);

    useEffect(() => {
        const initNavbar = async () => {
            checkAuthStatus(); // قراءة البيانات السريعة من التخزين
            await fetchUserStatus(); // جلب البيانات الأكيدة من السيرفر وتحديث الواجهة
        };

        initNavbar();
        window.addEventListener('storage', checkAuthStatus);
        return () => window.removeEventListener('storage', checkAuthStatus);
    }, []);

    return (
        <nav className="navbar reveal-anim">
            <div className="navbar-logo">
                <Link to="/" className="logo-text">Code La Route</Link>
            </div>

            {/* Main Links */}
            <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
                <li><NavLink to="/" onClick={() => setIsOpen(false)}>الرئيسية</NavLink></li>
                <li><NavLink to="/courses" onClick={() => setIsOpen(false)}>الدروس</NavLink></li>
                <li><NavLink to="/contact" onClick={() => setIsOpen(false)}>اتصل بنا</NavLink></li>

                {/* Mobile Extra Actions */}
                <li className="mobile-only-action">
                    {!isSubscribed && (
                        <Link to="/subscriptions" className="btn-premium-sm" onClick={() => setIsOpen(false)} style={{ display: 'block', textAlign: 'center' }}>
                            تفعيل الاشتراك
                        </Link>
                    )}
                </li>
            </ul>

            <div className="navbar-actions">
                {isLoggedIn ? (
                    <div className="account-dropdown-container" ref={accountMenuRef}>
                        <button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} className="account-trigger-btn">
                            <div className="avatar-mini">
                                <User size={18} />
                            </div>
                            <span className="desktop-only">{localStorage.getItem('userFullName')?.split(' ')[0] || 'حسابي'}</span>
                            <FaChevronDown size={10} className={`chevron ${isAccountMenuOpen ? 'open' : ''}`} />
                        </button>

                        {isAccountMenuOpen && (
                            <div className="account-dropdown-menu">
                                <div className="dropdown-info">
                                    <p className="user-name">{localStorage.getItem('userFullName')}</p>
                                    <p className="user-status">
                                        {role === 'admin' ? 'مدير النظام' : (isSubscribed ? 'عضوية VIP' : 'عضوية مجانية')}
                                    </p>
                                </div>
                                <div className="dropdown-divider"></div>
                                {localStorage.getItem('role') === 'admin' && (
                                    <Link to="/admin" className="dropdown-item" onClick={() => setIsAccountMenuOpen(false)}>
                                        <LayoutDashboard size={16} />
                                        <span>لوحة التحكم</span>
                                    </Link>
                                )}
                                <Link to="/profile" className="dropdown-item" onClick={() => setIsAccountMenuOpen(false)}>
                                    <User size={16} />
                                    <span>الملف الشخصي</span>
                                </Link>
                                <Link to="/subscriptions" className="dropdown-item" onClick={() => setIsAccountMenuOpen(false)}>
                                    <Zap size={16} />
                                    <span>{isSubscribed ? 'إدارة الاشتراك' : 'ترقية الحساب'}</span>
                                </Link>
                                <button onClick={handleLogout} className="dropdown-item logout">
                                    <LogOut size={16} />
                                    <span>تسجيل الخروج</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="signup-button desktop-only">دخول</Link>
                )}

                {!isSubscribed && (
                    <Link to="/subscriptions" className="btn-premium-sm desktop-only">اشتراك</Link>
                )}

                {/* Burger Icon */}
                <button className="menu-icon-btn" onClick={toggleMenu}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;