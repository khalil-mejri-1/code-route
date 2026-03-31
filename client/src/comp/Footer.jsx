import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-premium" style={{ background: 'var(--bg-deep)', padding: '80px 20px', borderTop: '1px solid var(--glass-border)' }}>
      <div className="premium-container reveal-anim">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '60px' }}>
          
          {/* Logo & Vision */}
          <div className="footer-col">
            <h2 className="logo-text" style={{ marginBottom: '24px' }}>Drive</h2>
            <p className="card-p" style={{ maxWidth: '300px', lineHeight: '1.8' }}>
              منصتكم الرائدة والذكية لتعلم جميع قواعد طرقات تونس باحترافية، بأساليب حديثة تعتمد على الرؤية الفنية والذكاء التعليمي.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>روابط سريعة</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '16px' }}><Link to="/" style={{ color: 'var(--text-gray)', fontSize: '15px' }}>الرئيسية</Link></li>
              <li style={{ marginBottom: '16px' }}><Link to="/courses" style={{ color: 'var(--text-gray)', fontSize: '15px' }}>الدروس</Link></li>
              <li style={{ marginBottom: '16px' }}><Link to="/examens" style={{ color: 'var(--text-gray)', fontSize: '15px' }}>الاختبارات</Link></li>
              <li style={{ marginBottom: '16px' }}><Link to="/subscriptions" style={{ color: 'var(--text-gray)', fontSize: '15px' }}>الاشتراكات</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>تواصل معنا</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-gray)', fontSize: '14px' }}>
                <Mail size={18} color="var(--primary)" /> help@drive.tn
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-gray)', fontSize: '14px' }}>
                <Phone size={18} color="var(--primary)" /> +216 71 000 000
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-gray)', fontSize: '14px' }}>
                <MapPin size={18} color="var(--primary)" /> Sfax, Tunisia
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="footer-col">
            <h4 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>تابعنا</h4>
            <div style={{ display: 'flex', gap: '16px' }}>
               <button className="signup-button" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Facebook size={20} />
               </button>
               <button className="signup-button" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Instagram size={20} />
               </button>
               <button className="signup-button" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Twitter size={20} />
               </button>
            </div>
          </div>

        </div>

        <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>
             جميع الحقوق محفوظة © {new Date().getFullYear()} - منصة Drive لتعلم قانون السير
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;