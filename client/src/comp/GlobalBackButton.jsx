import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

/**
 * Global Back Button - Fixed Position (Floating)
 * Visible on all pages except Home ('/').
 * Placed outside the Navbar (e.g. top-left relative to content, or fixed).
 */
const GlobalBackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hidden on Homepage
    if (location.pathname === '/') {
        return null;
    }

    return (
        <>

        </>
        // <button
        //     className="global-back-floating"
        //     onClick={() => navigate(-1)}
        //     title="رجوع"
        // >
        //     <FaArrowRight /> رجوع
        // </button>
    );
};

export default GlobalBackButton;
