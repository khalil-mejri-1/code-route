import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import { Menu, X, User, LogOut, Zap } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const accountMenuRef = useRef(null);

    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const checkAuthStatus = () => {
        const loginStatus = localStorage.getItem('login') === 'true';
        const subscriptionStatus = localStorage.getItem('subscriptions') === 'true';
        setIsLoggedIn(loginStatus);
        setIsSubscribed(subscriptionStatus);
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        if (isAccountMenuOpen) setIsAccountMenuOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('login');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userFullName');
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
        checkAuthStatus();
        window.addEventListener('storage', checkAuthStatus);
        return () => window.removeEventListener('storage', checkAuthStatus);
    }, []);

    return (
        <nav className="navbar reveal-anim">
            <div className="navbar-logo">
                <Link to="/" className="logo-text">Drive</Link>
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
                                    <p className="user-status">{isSubscribed ? 'عضوية VIP' : 'عضو مجاني'}</p>
                                </div>
                                <div className="dropdown-divider"></div>
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