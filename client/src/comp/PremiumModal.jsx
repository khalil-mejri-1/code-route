import React from 'react';
import { X, Lock, Crown, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PremiumModal.css';

const PremiumModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="premium-modal-overlay" onClick={onClose}>
            <div className="premium-modal-container reveal-anim" onClick={e => e.stopPropagation()}>
                <button className="close-btn-premium" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="premium-modal-header">
                    <div className="premium-icon-glow">
                        <Crown size={40} className="crown-icon" />
                    </div>
                    <h2>محتوى <span className="accent-premium">VIP</span> حصري</h2>
                    <p>هذه السلسلة متاحة للمشتركين فقط. انضم إلينا الآن للوصول الكامل لجميع السلاسل والامتحانات.</p>
                </div>

                <div className="premium-benefits">
                    <div className="benefit-item">
                        <div className="check-icon">✓</div>
                        <span>فتح جميع السلاسل والامتحانات (24+)</span>
                    </div>
                    <div className="benefit-item">
                        <div className="check-icon">✓</div>
                        <span>شروحات مفصلة لجميع القواعد</span>
                    </div>
                    <div className="benefit-item">
                        <div className="check-icon">✓</div>
                        <span>دعم فني وتواصل مباشر مع المكونين</span>
                    </div>
                </div>

                <div className="premium-modal-footer">
                    <button 
                        className="btn-subscribe-now"
                        onClick={() => {
                            onClose();
                            navigate('/subscriptions');
                        }}
                    >
                        اشترك الآن وابدأ التعلم
                        <ChevronLeft size={20} />
                    </button>
                    <button className="btn-maybe-later" onClick={onClose}>
                        ربما لاحقاً
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PremiumModal;
