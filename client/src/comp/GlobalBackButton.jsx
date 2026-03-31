import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const GlobalBackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hidden on Homepage
    if (location.pathname === '/') {
        return null;
    }

    return (
        <button
            className="global-back-floating reveal-anim"
            onClick={() => navigate(-1)}
            title="رجوع للقائمة السابقة"
            style={{ border: 'none', appearance: 'none', fontFamily: 'inherit' }}
        >
            <ArrowLeft size={18} />
            <span>رجوع</span>
        </button>
    );
};

export default GlobalBackButton;
