import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Edit3, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from '../config';
import heroImg from '../image/hero-bg.png';

const HeroSection = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Content state with default fallbacks
  const [content, setContent] = useState({
    badgeText: 'المنصة رقم 1 في تعلم قانون الطرق بذكاء',
    titlePart1: 'أتقن قانون السير بأسلوب ',
    titlePart2: 'إبداعي وحديث',
    desc: 'ابدأ رحلتك التفاعلية اليوم مع دروس متطورة، اختبارات تحاكي الواقع، ونظام تتبع ذكي يضمن وصولك للعلامة الكاملة في وقت قياسي.',
    ctaText: 'ابدأ التعلم الآن',
    stat1Val: '+50k',
    stat1Lbl: 'مستخدم نشط',
    stat2Val: '100%',
    stat2Lbl: 'تغطية شاملة',
    stat3Val: '4.9',
    stat3Lbl: 'تقييم المستخدمين'
  });

  // Modal form states
  const [formBadgeText, setFormBadgeText] = useState(content.badgeText);
  const [formTitlePart1, setFormTitlePart1] = useState(content.titlePart1);
  const [formTitlePart2, setFormTitlePart2] = useState(content.titlePart2);
  const [formDesc, setFormDesc] = useState(content.desc);
  const [formCtaText, setFormCtaText] = useState(content.ctaText);
  const [formStat1Val, setFormStat1Val] = useState(content.stat1Val);
  const [formStat1Lbl, setFormStat1Lbl] = useState(content.stat1Lbl);
  const [formStat2Val, setFormStat2Val] = useState(content.stat2Val);
  const [formStat2Lbl, setFormStat2Lbl] = useState(content.stat2Lbl);
  const [formStat3Val, setFormStat3Val] = useState(content.stat3Val);
  const [formStat3Lbl, setFormStat3Lbl] = useState(content.stat3Lbl);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('role') === 'admin');
    
    // Fetch content from database
    const fetchContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/content/hero_section_content`);
        if (response.ok) {
          const data = await response.json();
          setContent(prev => ({...prev, ...data}));
        }
      } catch (error) {
        console.error('Failed to fetch hero content:', error);
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
      ctaText: formCtaText,
      stat1Val: formStat1Val,
      stat1Lbl: formStat1Lbl,
      stat2Val: formStat2Val,
      stat2Lbl: formStat2Lbl,
      stat3Val: formStat3Val,
      stat3Lbl: formStat3Lbl
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/content/hero_section_content`, {
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
      console.error('Failed to save hero content:', error);
      alert('حدث خطأ أثناء حفظ المحتوى');
    }
  };

  return (
    <div className="hero-wrapper premium-section-editable">
      {/* Admin Floating Edit Button */}
      {isAdmin && (
        <button 
          onClick={() => {
            // Pre-fill form state with current content
            setFormBadgeText(content.badgeText);
            setFormTitlePart1(content.titlePart1);
            setFormTitlePart2(content.titlePart2);
            setFormDesc(content.desc);
            setFormCtaText(content.ctaText);
            setFormStat1Val(content.stat1Val);
            setFormStat1Lbl(content.stat1Lbl);
            setFormStat2Val(content.stat2Val);
            setFormStat2Lbl(content.stat2Lbl);
            setFormStat3Val(content.stat3Val);
            setFormStat3Lbl(content.stat3Lbl);
            setShowEditModal(true);
          }} 
          className="admin-edit-section-btn"
        >
          <Edit3 size={15} />
          <span>تعديل قسم واجهة البداية</span>
        </button>
      )}

      <div className="hero-glow-1"></div>
      <div className="hero-glow-2"></div>
      
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(to bottom, rgba(5, 5, 8, 0.7), var(--bg-deep)), url(${heroImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.4,
          zIndex: 1
        }}
      ></div>

      <div className="hero-content reveal-anim" style={{ position: 'relative', zIndex: 2 }}>
        <div className="badge-new">
          <CheckCircle size={14} />
          <span>{content.badgeText}</span>
        </div>
        
        <h1 className="hero-title-main">
          <span>{content.titlePart1}</span>
          <br/>
          <span className="accent">{content.titlePart2}</span>
        </h1>
        
        <p className="hero-desc">
          {content.desc}
        </p>
        
        <div className="hero-cta">
          <Link to="/courses" className="btn-premium" style={{ textDecoration: 'none' }}>
            {content.ctaText}
            <ArrowLeft size={18} />
          </Link>
        </div>
      </div>

      <div className="stats-section reveal-anim" style={{ position: 'relative', zIndex: 2 }}>
        <div className="stats-grid">
          <div className="stat-item">
            <h2>{content.stat3Val}</h2>
            <p>{content.stat3Lbl}</p>
          </div>
          <div className="stat-item">
            <h2>{content.stat2Val}</h2>
            <p>{content.stat2Lbl}</p>
          </div>
          <div className="stat-item">
            <h2>{content.stat1Val}</h2>
            <p>{content.stat1Lbl}</p>
          </div>
        </div>
      </div>

      {/* Futuristic Glassmorphism Edit Modal rendered with React Portal */}
      {showEditModal && createPortal(
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <Edit3 size={22} style={{ color: '#10b981' }} />
                <span>تعديل محتوى قسم واجهة البداية</span>
              </div>
              <button onClick={() => setShowEditModal(false)} className="admin-modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">شارة القسم العلوي</label>
                  <input 
                    type="text" 
                    value={formBadgeText} 
                    onChange={e => setFormBadgeText(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">نص زر الانتقال (CTA)</label>
                  <input 
                    type="text" 
                    value={formCtaText} 
                    onChange={e => setFormCtaText(e.target.value)} 
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

              <div className="admin-form-group">
                <label className="admin-form-label">الوصف التفصيلي</label>
                <textarea 
                  value={formDesc} 
                  onChange={e => setFormDesc(e.target.value)} 
                  className="admin-form-input admin-form-textarea" 
                  required 
                />
              </div>

              <h4 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: '25px 0 15px' }}>تعديل الأرقام والإحصائيات</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">الرقم 1</label>
                  <input 
                    type="text" 
                    value={formStat1Val} 
                    onChange={e => setFormStat1Val(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                  <label className="admin-form-label" style={{ fontSize: '12px', marginTop: '5px' }}>الوصف 1</label>
                  <input 
                    type="text" 
                    value={formStat1Lbl} 
                    onChange={e => setFormStat1Lbl(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">الرقم 2</label>
                  <input 
                    type="text" 
                    value={formStat2Val} 
                    onChange={e => setFormStat2Val(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                  <label className="admin-form-label" style={{ fontSize: '12px', marginTop: '5px' }}>الوصف 2</label>
                  <input 
                    type="text" 
                    value={formStat2Lbl} 
                    onChange={e => setFormStat2Lbl(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">الرقم 3</label>
                  <input 
                    type="text" 
                    value={formStat3Val} 
                    onChange={e => setFormStat3Val(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                  <label className="admin-form-label" style={{ fontSize: '12px', marginTop: '5px' }}>الوصف 3</label>
                  <input 
                    type="text" 
                    value={formStat3Lbl} 
                    onChange={e => setFormStat3Lbl(e.target.value)} 
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
};

export default HeroSection;