import React from 'react';


const Footer = () => {
  return (
    <footer className="app-footer" dir="rtl">
      <div className="footer-content">
        
        {/* العمود 1: العلامة التجارية والوصف */}
        <div className="footer-column brand-column">
          {/* يمكنك استبدال هذا برمز شعار (Logo) */}
          <div className="brand-logo">
            {/*  يمكنك إضافة أيقونة هنا */}
            <span className="logo-text">رمز القيادة</span>
          </div>
          <p className="brand-tagline">
            منصة الخدمة الخاصة بقانون الطريق.
          </p>
        </div>

        {/* العمود 2: المحتوى (المفتّح) */}
        <div className="footer-column">
          <h4 className="column-title">المفتّح</h4>
          <ul className="footer-links">
            <li><a href="#lessons">الدروس</a></li>
            <li><a href="#prices">الأسعار</a></li>
          </ul>
        </div>

        {/* العمود 3: قانوني */}
        <div className="footer-column">
          <h4 className="column-title">قانوني</h4>
          <ul className="footer-links">
            <li><a href="#privacy">الخصوصية</a></li>
            <li><a href="#terms">الشروط</a></li>
          </ul>
        </div>

        {/* العمود 4: الاتصال */}
        <div className="footer-column contact-column">
          <h4 className="column-title">اتصل</h4>
          <p>Email: <a href="mailto:info@drivecode.tn">info@drivecode.tn</a></p>
          <p>Tel: +216 XX XXX XXX</p>
        </div>

      </div>

      {/* خط فاصل */}
      <hr className="footer-divider" />

      {/* قسم حقوق النشر */}
      <div className="footer-copyright">
        <p>
          رمز القيادة. جميع حقوق النشر محفوظة. 2025 ©
        </p>
      </div>
    </footer>
  );
};

export default Footer;