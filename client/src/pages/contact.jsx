import React from 'react';
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Twitter } from 'lucide-react';
import Navbar from '../comp/navbar';

export default function Contact() {
  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', direction: 'rtl' }}>
      <Navbar />
      <div className="page-container">
        <header className="page-header reveal-anim">
          <span className="badge-new">تواصل معنا</span>
          <h1 className="page-title">نحن هنا <span className="accent">لمساعدتك</span></h1>
          <p className="hero-desc" style={{ maxWidth: '600px', margin: '0 auto' }}>
            هل لديك استفسار؟ فريقنا جاهز للرد على جميع تساؤلاتك وتوجيهك نحو النجاح.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', marginTop: '60px' }}>
          
          {/* Contact Info Card */}
          <div className="reveal-anim" style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', padding: '40px', borderRadius: 'var(--radius-2xl)', backdropFilter: 'var(--glass-blur)' }}>
             <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '32px' }}>معلومات الاتصال</h2>
             
             <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
                <div style={{ width: '50px', height: '50px', background: 'var(--bg-accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                   <MapPin size={24} />
                </div>
                <div>
                   <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>العنوان</h4>
                   <p style={{ color: 'var(--text-gray)', fontSize: '15px' }}>ناسن حي البصمة، بن عروس، تونس</p>
                </div>
             </div>

             <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
                <div style={{ width: '50px', height: '50px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', flexShrink: 0 }}>
                   <Phone size={24} />
                </div>
                <div>
                   <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>الهاتف</h4>
                   <p style={{ color: 'var(--text-gray)', fontSize: '15px' }} dir="ltr">+216 25 172 626</p>
                </div>
             </div>

             <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <div style={{ width: '50px', height: '50px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                   <Mail size={24} />
                </div>
                <div>
                   <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>البريد الإلكتروني</h4>
                   <p style={{ color: 'var(--text-gray)', fontSize: '15px' }}>contact@drivecode.tn</p>
                </div>
             </div>

             <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>ساعات العمل</h3>
             <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-gray)' }}>
                   <span>الاثنين - الجمعة</span>
                   <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>09:00 - 19:00</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-gray)' }}>
                   <span>السبت</span>
                   <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>10:00 - 18:00</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-gray)' }}>
                   <span>الأحد</span>
                   <span style={{ color: 'var(--accent)', fontWeight: 600 }}>مغلق</span>
                </li>
             </ul>
          </div>

          {/* Contact Form Card */}
          <div className="reveal-anim" style={{ background: 'var(--bg-darker)', border: '1px solid var(--glass-border)', padding: '40px', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-premium)', animationDelay: '0.2s' }}>
             <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>أرسل لنا رسالة</h2>
             <p style={{ color: 'var(--text-gray)', marginBottom: '32px' }}>الرجاء ملء النموذج أدناه وسنقوم بالرد عليك في أقرب وقت.</p>

             <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '14px', fontWeight: 600 }}>الاسم بالكامل</label>
                      <input type="text" style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} placeholder="أحمد علي" required />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '14px', fontWeight: 600 }}>البريد الإلكتروني</label>
                      <input type="email" style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} placeholder="example@mail.com" required />
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <label style={{ fontSize: '14px', fontWeight: 600 }}>الموضوع</label>
                   <input type="text" style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} placeholder="كيف يمكننا مساعدتك؟" required />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <label style={{ fontSize: '14px', fontWeight: 600 }}>الرسالة</label>
                   <textarea rows="5" style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', resize: 'none' }} placeholder="أدخل رسالتك هنا..." required></textarea>
                </div>

                <button type="submit" className="btn-premium" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                   <Send size={20} />
                   إرسال الرسالة
                </button>
             </form>
          </div>

        </div>
      </div>
    </div>
  );
}