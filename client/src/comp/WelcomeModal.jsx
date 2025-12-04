// WelcomeModal.jsx
import React from 'react';
// Assuming you will create a corresponding CSS file for styling

/**
 * @param {object} props
 * @param {() => void} props.onClose - Function to call when the modal is closed.
 */
const WelcomeModal = ({ onClose }) => {
  return (
    // Backdrop for the blur effect
    <div className="modal-backdrop">
      {/* Modal content container */}
      <div className="modal-content">
        <h2 className="modal-title"></h2>

        {/* The required Arabic message */}
        <p className="modal-message">


          جميع المعلومات والدروس المنشورة هنا تهدف إلى المساعدة على الفهم والدعم الذاتي للتعلّم،
          الهدف من الدروس هو التثقيف والمساعدة على الفهم فقط و
           إتقان قانون الطرقات وإشارات المرور بطريقة تفاعلية وممتعة. استعد لاختبار رخصة القيادة بثقة كاملة.


        </p>

        {/* Close button */}
        <button
          className="modal-close-btn"
          onClick={onClose}
        >
          ابدأ التعلم الآن
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;