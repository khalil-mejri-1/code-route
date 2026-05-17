import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Send, Edit3, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import Navbar from '../comp/navbar';
import { API_BASE_URL } from '../config';

export default function Contact() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Content state with default fallbacks
  const [content, setContent] = useState({
    badgeText: 'تواصل معنا',
    titlePart1: 'نحن هنا ',
    titlePart2: 'لمساعدتك',
    desc: 'هل لديك استفسار؟ فريقنا جاهز للرد على جميع تساؤلاتك وتوجيهك نحو النجاح.',
    
    infoTitle: 'معلومات الاتصال',
    addressTitle: 'العنوان',
    addressVal: 'ناسن حي البصمة، بن عروس، تونس',
    
    phoneTitle: 'الهاتف',
    phoneVal: '+216 25 172 626',
    
    emailTitle: 'البريد الإلكتروني',
    emailVal: 'contact@drivecode.tn',
    
    hoursTitle: 'ساعات العمل',
    hoursLabel1: 'الاثنين - الجمعة',
    hoursVal1: '09:00 - 19:00',
    hoursLabel2: 'السبت',
    hoursVal2: '10:00 - 18:00',
    hoursLabel3: 'الأحد',
    hoursVal3: 'مغلق',
    
    formTitle: 'أرسل لنا رسالة',
    formDesc: 'الرجاء ملء النموذج أدناه وسنقوم بالرد عليك في أقرب وقت.'
  });

  // Modal form states
  const [formBadgeText, setFormBadgeText] = useState(content.badgeText);
  const [formTitlePart1, setFormTitlePart1] = useState(content.titlePart1);
  const [formTitlePart2, setFormTitlePart2] = useState(content.titlePart2);
  const [formDesc, setFormDesc] = useState(content.desc);
  
  const [formInfoTitle, setFormInfoTitle] = useState(content.infoTitle);
  const [formAddressTitle, setFormAddressTitle] = useState(content.addressTitle);
  const [formAddressVal, setFormAddressVal] = useState(content.addressVal);
  
  const [formPhoneTitle, setFormPhoneTitle] = useState(content.phoneTitle);
  const [formPhoneVal, setFormPhoneVal] = useState(content.phoneVal);
  
  const [formEmailTitle, setFormEmailTitle] = useState(content.emailTitle);
  const [formEmailVal, setFormEmailVal] = useState(content.emailVal);
  
  const [formHoursTitle, setFormHoursTitle] = useState(content.hoursTitle);
  const [formHoursLabel1, setFormHoursLabel1] = useState(content.hoursLabel1);
  const [formHoursVal1, setFormHoursVal1] = useState(content.hoursVal1);
  const [formHoursLabel2, setFormHoursLabel2] = useState(content.hoursLabel2);
  const [formHoursVal2, setFormHoursVal2] = useState(content.hoursVal2);
  const [formHoursLabel3, setFormHoursLabel3] = useState(content.hoursLabel3);
  const [formHoursVal3, setFormHoursVal3] = useState(content.hoursVal3);
  
  const [formFormTitle, setFormFormTitle] = useState(content.formTitle);
  const [formFormDesc, setFormFormDesc] = useState(content.formDesc);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('role') === 'admin');

    // Fetch content from database
    const fetchContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/content/contact_page_content`);
        if (response.ok) {
          const data = await response.json();
          setContent(prev => ({...prev, ...data}));
        }
      } catch (error) {
        console.error('Failed to fetch contact page content:', error);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const newContent = {
      badgeText: formBadgeText,
      titlePart1: formTitlePart1,
      titlePart2: formTitlePart2,
      desc: formDesc,
      
      infoTitle: formInfoTitle,
      addressTitle: formAddressTitle,
      addressVal: formAddressVal,
      
      phoneTitle: formPhoneTitle,
      phoneVal: formPhoneVal,
      
      emailTitle: formEmailTitle,
      emailVal: formEmailVal,
      
      hoursTitle: formHoursTitle,
      hoursLabel1: formHoursLabel1,
      hoursVal1: formHoursVal1,
      hoursLabel2: formHoursLabel2,
      hoursVal2: formHoursVal2,
      hoursLabel3: formHoursLabel3,
      hoursVal3: formHoursVal3,
      
      formTitle: formFormTitle,
      formDesc: formFormDesc
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/content/contact_page_content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContent),
      });
      if (response.ok) {
        setContent(newContent);
        setShowEditModal(false);
      } else {
        alert('حدث خطأ أثناء حفظ المحتوى في قاعدة البيانات');
      }
    } catch (error) {
      console.error('Failed to save contact page content:', error);
      alert('حدث خطأ أثناء حفظ المحتوى');
    }
  };

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', direction: 'rtl' }} className="premium-section-editable">
      <Navbar />
      
      {/* Admin Floating Edit Button */}
      {isAdmin && (
        <button 
          onClick={() => {
            setFormBadgeText(content.badgeText);
            setFormTitlePart1(content.titlePart1);
            setFormTitlePart2(content.titlePart2);
            setFormDesc(content.desc);
            
            setFormInfoTitle(content.infoTitle);
            setFormAddressTitle(content.addressTitle);
            setFormAddressVal(content.addressVal);
            
            setFormPhoneTitle(content.phoneTitle);
            setFormPhoneVal(content.phoneVal);
            
            setFormEmailTitle(content.emailTitle);
            setFormEmailVal(content.emailVal);
            
            setFormHoursTitle(content.hoursTitle);
            setFormHoursLabel1(content.hoursLabel1);
            setFormHoursVal1(content.hoursVal1);
            setFormHoursLabel2(content.hoursLabel2);
            setFormHoursVal2(content.hoursVal2);
            setFormHoursLabel3(content.hoursLabel3);
            setFormHoursVal3(content.hoursVal3);
            
            setFormFormTitle(content.formTitle);
            setFormFormDesc(content.formDesc);
            setShowEditModal(true);
          }} 
          className="admin-edit-section-btn"
          style={{ top: '100px' }} // Positioned nicely below the main navbar
        >
          <Edit3 size={15} />
          <span>تعديل محتوى صفحة الاتصال</span>
        </button>
      )}

      <div className="premium-container reveal-anim" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <div className="section-head">
          <span className="badge-new">{content.badgeText}</span>
          <h2>{content.titlePart1}<span className="accent">{content.titlePart2}</span></h2>
          <p className="hero-desc">{content.desc}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '40px', marginTop: '60px' }}>
          
          {/* Contact Details Panel */}
          <div className="feature-card-premium" style={{ background: 'var(--bg-card)', height: 'fit-content' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
              {content.infoTitle}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {/* Address */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="feature-icon-wrapper" style={{ minWidth: '46px', height: '46px', color: 'var(--primary)', background: 'var(--bg-accent)' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{content.addressTitle}</h4>
                  <p style={{ color: 'var(--text-gray)', fontSize: '14px', lineHeight: 1.5 }}>{content.addressVal}</p>
                </div>
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="feature-icon-wrapper" style={{ minWidth: '46px', height: '46px', color: 'var(--secondary)', background: 'var(--secondary-glow)' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{content.phoneTitle}</h4>
                  <p style={{ color: 'var(--text-gray)', fontSize: '14px', direction: 'ltr', textAlign: 'right' }}>{content.phoneVal}</p>
                </div>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="feature-icon-wrapper" style={{ minWidth: '46px', height: '46px', color: 'var(--primary)', background: 'var(--bg-accent)' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{content.emailTitle}</h4>
                  <p style={{ color: 'var(--text-gray)', fontSize: '14px' }}>{content.emailVal}</p>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>{content.hoursTitle}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-gray)' }}>{content.hoursLabel1}</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{content.hoursVal1}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-gray)' }}>{content.hoursLabel2}</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{content.hoursVal2}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-gray)' }}>{content.hoursLabel3}</span>
                  <span style={{ color: '#ff4d4d', fontWeight: 600 }}>{content.hoursVal3}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Panel */}
          <div className="feature-card-premium" style={{ background: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>{content.formTitle}</h3>
            <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginBottom: '35px' }}>{content.formDesc}</p>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: 'var(--text-gray)', fontSize: '14px', fontWeight: 600 }}>الاسم الكامل</label>
                  <input 
                    type="text" 
                    placeholder="جون دو" 
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: 'var(--text-gray)', fontSize: '14px', fontWeight: 600 }}>البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      direction: 'ltr',
                      textAlign: 'right'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: 'var(--text-gray)', fontSize: '14px', fontWeight: 600 }}>الموضوع</label>
                <input 
                  type="text" 
                  placeholder="كيف يمكننا مساعدتك؟" 
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: 'var(--text-gray)', fontSize: '14px', fontWeight: 600 }}>الرسالة</label>
                <textarea 
                  placeholder="اكتب رسالتك هنا بالتفصيل..." 
                  rows="6"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                />
              </div>

              <button className="btn-premium" type="button" style={{ width: 'fit-content', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>إرسال الرسالة</span>
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Futuristic Glassmorphism Edit Modal rendered with React Portal */}
      {showEditModal && createPortal(
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '850px' }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <Edit3 size={22} style={{ color: '#10b981' }} />
                <span>تعديل محتوى صفحة الاتصال</span>
              </div>
              <button onClick={() => setShowEditModal(false)} className="admin-modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <h4 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '15px' }}>ترويسة الصفحة والتفاصيل العامة</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">شارة الترويسة</label>
                  <input 
                    type="text" 
                    value={formBadgeText} 
                    onChange={e => setFormBadgeText(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">وصف الترويسة الرئيسي</label>
                  <input 
                    type="text" 
                    value={formDesc} 
                    onChange={e => setFormDesc(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">العنوان الرئيسي - الجزء الأول</label>
                  <input 
                    type="text" 
                    value={formTitlePart1} 
                    onChange={e => setFormTitlePart1(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">العنوان الرئيسي - الجزء الثاني (ملون)</label>
                  <input 
                    type="text" 
                    value={formTitlePart2} 
                    onChange={e => setFormTitlePart2(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                </div>
              </div>

              <h4 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: '25px 0 15px' }}>معلومات الاتصال وساعات العمل</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Contact items */}
                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <label className="admin-form-label" style={{ color: '#10b981' }}>تعديل بيانات الاتصال</label>
                  
                  <div className="admin-form-group" style={{ marginTop: '10px' }}>
                    <label className="admin-form-label" style={{ fontSize: '12px' }}>عنوان المقر</label>
                    <input 
                      type="text" 
                      value={formAddressVal} 
                      onChange={e => setFormAddressVal(e.target.value)} 
                      className="admin-form-input" 
                      required 
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontSize: '12px' }}>رقم الهاتف</label>
                    <input 
                      type="text" 
                      value={formPhoneVal} 
                      onChange={e => setFormPhoneVal(e.target.value)} 
                      className="admin-form-input" 
                      required 
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" style={{ fontSize: '12px' }}>البريد الإلكتروني</label>
                    <input 
                      type="text" 
                      value={formEmailVal} 
                      onChange={e => setFormEmailVal(e.target.value)} 
                      className="admin-form-input" 
                      required 
                    />
                  </div>
                </div>

                {/* Working hours */}
                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <label className="admin-form-label" style={{ color: '#10b981' }}>ساعات العمل</label>

                  <div className="admin-form-group" style={{ marginTop: '10px' }}>
                    <label className="admin-form-label" style={{ fontSize: '11px' }}>عنوان ساعات العمل</label>
                    <input 
                      type="text" 
                      value={formHoursTitle} 
                      onChange={e => setFormHoursTitle(e.target.value)} 
                      className="admin-form-input" 
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '11px' }}>الوصف 1</label>
                      <input type="text" value={formHoursLabel1} onChange={e => setFormHoursLabel1(e.target.value)} className="admin-form-input" required />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '11px' }}>الوقت 1</label>
                      <input type="text" value={formHoursVal1} onChange={e => setFormHoursVal1(e.target.value)} className="admin-form-input" required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '11px' }}>الوصف 2</label>
                      <input type="text" value={formHoursLabel2} onChange={e => setFormHoursLabel2(e.target.value)} className="admin-form-input" required />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '11px' }}>الوقت 2</label>
                      <input type="text" value={formHoursVal2} onChange={e => setFormHoursVal2(e.target.value)} className="admin-form-input" required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '11px' }}>الوصف 3</label>
                      <input type="text" value={formHoursLabel3} onChange={e => setFormHoursLabel3(e.target.value)} className="admin-form-input" required />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label" style={{ fontSize: '11px' }}>الوقت 3</label>
                      <input type="text" value={formHoursVal3} onChange={e => setFormHoursVal3(e.target.value)} className="admin-form-input" required />
                    </div>
                  </div>
                </div>
              </div>

              <h4 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: '25px 0 15px' }}>تعديل كرت الرسالة والتواصل</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">عنوان نموذج الرسائل</label>
                  <input 
                    type="text" 
                    value={formFormTitle} 
                    onChange={e => setFormFormTitle(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">وصف نموذج الرسائل</label>
                  <input 
                    type="text" 
                    value={formFormDesc} 
                    onChange={e => setFormFormDesc(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="admin-btn-cancel">إلغاء</button>
                <button type="submit" className="admin-btn-save">حفظ التغييرات</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}