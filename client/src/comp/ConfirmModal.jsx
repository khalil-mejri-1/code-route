import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container reveal-anim">
                <button className="close-icon" onClick={onClose}>
                    <X size={20} />
                </button>
                
                <div className="modal-body">
                    <div className={`icon-circle ${type}`}>
                        <AlertTriangle size={30} />
                    </div>
                    
                    <h2 className="modal-title">{title}</h2>
                    <p className="modal-text">{message}</p>
                </div>
                
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        إلغاء
                    </button>
                    <button className={`btn-confirm ${type}`} onClick={() => {
                        onConfirm();
                        onClose();
                    }}>
                        تأكيد
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
