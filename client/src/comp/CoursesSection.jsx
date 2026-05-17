import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, ShieldCheck, Zap, Edit3, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from '../config';

const FeaturesSection = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Content state with default fallbacks
  const [content, setContent] = useState({
    badgeText: 'لماذا منصتنا؟',
    titlePart1: 'قوة التجربة و ',
    titlePart2: 'رؤية المحترفين',
    desc: 'نحن لا نعلمك فقط لتنجح، بل لتقود بذكاء وأمان.',
    feat1Title: 'تعلم سريع وذكي',
    feat1Desc: 'تم تصميم نظامنا بطريقة تضمن استيعاب المفاهيم في أقل وقت ممكن.',
    feat2Title: 'اختبارات محاكاة',
    feat2Desc: 'خض تجربة مشابهة للاختبار الرسمي تماماً مع نظام فوري للنتائج.',
    feat3Title: 'بيئة آمنة للمبتدئين',
    feat3Desc: 'كل ما تحتاجه من موارد وأدوات في مكان واحد ليكون طريقك سهلاً ومضموناً.',
    feat4Title: 'محتوى شامل وحصري',
    feat4Desc: 'دروس بصرية متقدمة، رسوم توضيحية، وفيديوهات تشرح القواعد المعقدة.'
  });

  // Modal form states
  const [formBadgeText, setFormBadgeText] = useState(content.badgeText);
  const [formTitlePart1, setFormTitlePart1] = useState(content.titlePart1);
  const [formTitlePart2, setFormTitlePart2] = useState(content.titlePart2);
  const [formDesc, setFormDesc] = useState(content.desc);
  const [formFeat1Title, setFormFeat1Title] = useState(content.feat1Title);
  const [formFeat1Desc, setFormFeat1Desc] = useState(content.feat1Desc);
  const [formFeat2Title, setFormFeat2Title] = useState(content.feat2Title);
  const [formFeat2Desc, setFormFeat2Desc] = useState(content.feat2Desc);
  const [formFeat3Title, setFormFeat3Title] = useState(content.feat3Title);
  const [formFeat3Desc, setFormFeat3Desc] = useState(content.feat3Desc);
  const [formFeat4Title, setFormFeat4Title] = useState(content.feat4Title);
  const [formFeat4Desc, setFormFeat4Desc] = useState(content.feat4Desc);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('role') === 'admin');

    // Fetch content from database
    const fetchContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/content/courses_section_content`);
        if (response.ok) {
          const data = await response.json();
          setContent(prev => ({...prev, ...data}));
        }
      } catch (error) {
        console.error('Failed to fetch courses section content:', error);
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
      feat1Title: formFeat1Title,
      feat1Desc: formFeat1Desc,
      feat2Title: formFeat2Title,
      feat2Desc: formFeat2Desc,
      feat3Title: formFeat3Title,
      feat3Desc: formFeat3Desc,
      feat4Title: formFeat4Title,
      feat4Desc: formFeat4Desc
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/content/courses_section_content`, {
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
      console.error('Failed to save courses section content:', error);
      alert('حدث خطأ أثناء حفظ المحتوى');
    }
  };

  const modernFeatures = [
    {
      icon: <Zap />,
      title: content.feat1Title,
      description: content.feat1Desc,
      color: 'var(--primary)'
    },
    {
      icon: <GraduationCap />,
      title: content.feat2Title,
      description: content.feat2Desc,
      color: 'var(--secondary)'
    },
    {
      icon: <ShieldCheck />,
      title: content.feat3Title,
      description: content.feat3Desc,
      color: 'var(--primary)'
    },
    {
      icon: <BookOpen />,
      title: content.feat4Title,
      description: content.feat4Desc,
      color: 'var(--secondary)'
    }
  ];

  return (
    <section className="features-section premium-container premium-section-editable">
      {/* Admin Floating Edit Button */}
      {isAdmin && (
        <button 
          onClick={() => {
            setFormBadgeText(content.badgeText);
            setFormTitlePart1(content.titlePart1);
            setFormTitlePart2(content.titlePart2);
            setFormDesc(content.desc);
            setFormFeat1Title(content.feat1Title);
            setFormFeat1Desc(content.feat1Desc);
            setFormFeat2Title(content.feat2Title);
            setFormFeat2Desc(content.feat2Desc);
            setFormFeat3Title(content.feat3Title);
            setFormFeat3Desc(content.feat3Desc);
            setFormFeat4Title(content.feat4Title);
            setFormFeat4Desc(content.feat4Desc);
            setShowEditModal(true);
          }} 
          className="admin-edit-section-btn"
        >
          <Edit3 size={15} />
          <span>تعديل قسم مميزات المنصة</span>
        </button>
      )}

      <div className="section-head reveal-anim">
        <span className="badge-new">{content.badgeText}</span>
        <h2>{content.titlePart1}<span className="accent">{content.titlePart2}</span></h2>
        <p className="hero-desc">{content.desc}</p>
      </div>

      <div className="features-grid">
        {modernFeatures.map((f, i) => (
          <div className="feature-card-premium reveal-anim" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="feature-icon-wrapper" style={{ boxShadow: `0 0 20px ${f.color}30` }}>
              {f.icon}
            </div>
            <h3 className="card-h3">{f.title}</h3>
            <p className="card-p">{f.description}</p>
          </div>
        ))}
      </div>

      {/* Futuristic Glassmorphism Edit Modal rendered with React Portal */}
      {showEditModal && createPortal(
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <Edit3 size={22} style={{ color: '#10b981' }} />
                <span>تعديل محتوى مميزات المنصة</span>
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
                  <label className="admin-form-label">وصف القسم الرئيسي</label>
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

              <h4 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: '25px 0 15px' }}>تعديل كروت المميزات الأربعة</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Feature 1 */}
                <div className="admin-form-group" style={{ background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <label className="admin-form-label" style={{ color: '#10b981' }}>الميزة الأولى (أيقونة البرق)</label>
                  <label className="admin-form-label" style={{ fontSize: '12px', marginTop: '5px' }}>العنوان</label>
                  <input 
                    type="text" 
                    value={formFeat1Title} 
                    onChange={e => setFormFeat1Title(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                  <label className="admin-form-label" style={{ fontSize: '12px', marginTop: '5px' }}>الوصف</label>
                  <textarea 
                    value={formFeat1Desc} 
                    onChange={e => setFormFeat1Desc(e.target.value)} 
                    className="admin-form-input" 
                    style={{ minHeight: '60px' }}
                    required 
                  />
                </div>

                {/* Feature 2 */}
                <div className="admin-form-group" style={{ background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <label className="admin-form-label" style={{ color: '#10b981' }}>الميزة الثانية (أيقونة قبعة التخرج)</label>
                  <label className="admin-form-label" style={{ fontSize: '12px', marginTop: '5px' }}>العنوان</label>
                  <input 
                    type="text" 
                    value={formFeat2Title} 
                    onChange={e => setFormFeat2Title(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                  <label className="admin-form-label" style={{ fontSize: '12px', marginTop: '5px' }}>الوصف</label>
                  <textarea 
                    value={formFeat2Desc} 
                    onChange={e => setFormFeat2Desc(e.target.value)} 
                    className="admin-form-input" 
                    style={{ minHeight: '60px' }}
                    required 
                  />
                </div>

                {/* Feature 3 */}
                <div className="admin-form-group" style={{ background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <label className="admin-form-label" style={{ color: '#10b981' }}>الميزة الثالثة (أيقونة الدرع)</label>
                  <label className="admin-form-label" style={{ fontSize: '12px', marginTop: '5px' }}>العنوان</label>
                  <input 
                    type="text" 
                    value={formFeat3Title} 
                    onChange={e => setFormFeat3Title(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                  <label className="admin-form-label" style={{ fontSize: '12px', marginTop: '5px' }}>الوصف</label>
                  <textarea 
                    value={formFeat3Desc} 
                    onChange={e => setFormFeat3Desc(e.target.value)} 
                    className="admin-form-input" 
                    style={{ minHeight: '60px' }}
                    required 
                  />
                </div>

                {/* Feature 4 */}
                <div className="admin-form-group" style={{ background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <label className="admin-form-label" style={{ color: '#10b981' }}>الميزة الرابعة (أيقونة الكتاب)</label>
                  <label className="admin-form-label" style={{ fontSize: '12px', marginTop: '5px' }}>العنوان</label>
                  <input 
                    type="text" 
                    value={formFeat4Title} 
                    onChange={e => setFormFeat4Title(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                  <label className="admin-form-label" style={{ fontSize: '12px', marginTop: '5px' }}>الوصف</label>
                  <textarea 
                    value={formFeat4Desc} 
                    onChange={e => setFormFeat4Desc(e.target.value)} 
                    className="admin-form-input" 
                    style={{ minHeight: '60px' }}
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
    </section>
  );
};

export default FeaturesSection;