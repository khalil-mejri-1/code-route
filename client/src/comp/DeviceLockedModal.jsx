import React from 'react';
import { ShieldCheck, X, Smartphone } from 'lucide-react';
import './DeviceLockedModal.css';

const DeviceLockedModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="device-modal-overlay">
            <div className="device-modal-container reveal-anim">
                <div className="device-modal-header">
                    <div className="shield-icon">
                        <ShieldCheck size={40} />
                    </div>
                </div>
                
                <div className="device-modal-body">
                    <h2>تم تأمين حسابك بنجاح!</h2>
                    <p>
                        لقد تم ربط حسابك بهذا الجهاز بنجاح. لأسباب تتعلق بالأمان، لن تتمكن من فتح حسابك إلا من خلال هذا الجهاز فقط.
                    </p>
                    
                    <div className="device-info-box">
                        <Smartphone size={20} />
                        <span>تم التعرف على بصمة جهازك الحالي</span>
                    </div>
                </div>
                
                <button className="device-modal-btn" onClick={onClose}>
                    فهمت ذلك، ابدأ الآن
                </button>
            </div>
        </div>
    );
};

export default DeviceLockedModal;
