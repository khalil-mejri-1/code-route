import React, { useState, useEffect } from 'react';
import { Check, Shield, Star, Crown, Edit3, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from '../config';

const PricingSection = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Content state with default fallbacks
  const [content, setContent] = useState({
    badgeText: 'الاشتراكات',
    titlePart1: 'اختر باقتك و ',
    titlePart2: 'انطلق نحو النجاح',
    desc: 'خطط مرنة تناسب طموحك وجدولك الزمني.',
    
    plan1Name: 'الخطة الأساسية',
    plan1Price: '49',
    plan1Cta: 'ابدأ مجاناً',
    plan1Features: ['الوصول لجميع الدروس', 'اختبارات تجريبية محدودة', 'تتبع التقدم الأساسي'],
    
    plan2Name: 'الباقة الذهبية',
    plan2Price: '99',
    plan2Cta: 'اشترك الآن',
    plan2Features: ['كل ما في الأساسية', 'اختبارات غير محدودة', 'دعم مباشر 24/7', 'تصحيح مفصل'],
    
    plan3Name: 'حزمة النخبة',
    plan3Price: '249',
    plan3Cta: 'انطلق للاحتراف',
    plan3Features: ['كل المميزات المفتوحة', 'دروس فيديو حصرية', 'مدير حساب خاص', 'شهادة إتمام']
  });

  // Modal form states
  const [formBadgeText, setFormBadgeText] = useState(content.badgeText);
  const [formTitlePart1, setFormTitlePart1] = useState(content.titlePart1);
  const [formTitlePart2, setFormTitlePart2] = useState(content.titlePart2);
  const [formDesc, setFormDesc] = useState(content.desc);
  
  const [formPlan1Name, setFormPlan1Name] = useState(content.plan1Name);
  const [formPlan1Price, setFormPlan1Price] = useState(content.plan1Price);
  const [formPlan1Cta, setFormPlan1Cta] = useState(content.plan1Cta);
  const [formPlan1FeaturesText, setFormPlan1FeaturesText] = useState(content.plan1Features.join('\n'));

  const [formPlan2Name, setFormPlan2Name] = useState(content.plan2Name);
  const [formPlan2Price, setFormPlan2Price] = useState(content.plan2Price);
  const [formPlan2Cta, setFormPlan2Cta] = useState(content.plan2Cta);
  const [formPlan2FeaturesText, setFormPlan2FeaturesText] = useState(content.plan2Features.join('\n'));

  const [formPlan3Name, setFormPlan3Name] = useState(content.plan3Name);
  const [formPlan3Price, setFormPlan3Price] = useState(content.plan3Price);
  const [formPlan3Cta, setFormPlan3Cta] = useState(content.plan3Cta);
  const [formPlan3FeaturesText, setFormPlan3FeaturesText] = useState(content.plan3Features.join('\n'));

  useEffect(() => {
    setIsAdmin(localStorage.getItem('role') === 'admin');

    // Fetch content from database
    const fetchContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/content/pricing_section_content`);
        if (response.ok) {
          const data = await response.json();
          setContent(prev => ({...prev, ...data}));
        }
      } catch (error) {
        console.error('Failed to fetch pricing section content:', error);
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
      
      plan1Name: formPlan1Name,
      plan1Price: formPlan1Price,
      plan1Cta: formPlan1Cta,
      plan1Features: formPlan1FeaturesText.split('\n').map(x => x.trim()).filter(Boolean),
      
      plan2Name: formPlan2Name,
      plan2Price: formPlan2Price,
      plan2Cta: formPlan2Cta,
      plan2Features: formPlan2FeaturesText.split('\n').map(x => x.trim()).filter(Boolean),
      
      plan3Name: formPlan3Name,
      plan3Price: formPlan3Price,
      plan3Cta: formPlan3Cta,
      plan3Features: formPlan3FeaturesText.split('\n').map(x => x.trim()).filter(Boolean)
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/content/pricing_section_content`, {
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
      console.error('Failed to save pricing section content:', error);
      alert('حدث خطأ أثناء حفظ المحتوى');
    }
  };

  const premiumPlans = [
    {
      name: content.plan1Name,
      icon: <Shield size={24} />,
      price: content.plan1Price,
      period: '/ شهر',
      features: content.plan1Features,
      highlight: false,
      cta: content.plan1Cta
    },
    {
      name: content.plan2Name,
      icon: <Star size={24} />,
      price: content.plan2Price,
      period: '/ شهر',
      features: content.plan2Features,
      highlight: true,
      cta: content.plan2Cta
    },
    {
      name: content.plan3Name,
      icon: <Crown size={24} />,
      price: content.plan3Price,
      period: '/ 6 أشهر',
      features: content.plan3Features,
      highlight: false,
      cta: content.plan3Cta
    }
  ];

  return (
    <section className="pricing-section premium-section-editable">
      {/* Admin Floating Edit Button */}
      {isAdmin && (
        <button 
          onClick={() => {
            setFormBadgeText(content.badgeText);
            setFormTitlePart1(content.titlePart1);
            setFormTitlePart2(content.titlePart2);
            setFormDesc(content.desc);
            
            setFormPlan1Name(content.plan1Name);
            setFormPlan1Price(content.plan1Price);
            setFormPlan1Cta(content.plan1Cta);
            setFormPlan1FeaturesText(content.plan1Features.join('\n'));

            setFormPlan2Name(content.plan2Name);
            setFormPlan2Price(content.plan2Price);
            setFormPlan2Cta(content.plan2Cta);
            setFormPlan2FeaturesText(content.plan2Features.join('\n'));

            setFormPlan3Name(content.plan3Name);
            setFormPlan3Price(content.plan3Price);
            setFormPlan3Cta(content.plan3Cta);
            setFormPlan3FeaturesText(content.plan3Features.join('\n'));

            setShowEditModal(true);
          }} 
          className="admin-edit-section-btn"
        >
          <Edit3 size={15} />
          <span>تعديل خطط الاشتراك</span>
        </button>
      )}

      <div className="premium-container reveal-anim">
        <div className="section-head">
          <span className="badge-new">{content.badgeText}</span>
          <h2>{content.titlePart1}<span className="accent">{content.titlePart2}</span></h2>
          <p className="hero-desc">{content.desc}</p>
        </div>

        <div className="pricing-grid">
          {premiumPlans.map((plan, i) => (
            <div 
              className={`feature-card-premium reveal-anim ${plan.highlight ? 'highlight-plan' : ''}`} 
              key={i}
              style={{
                background: plan.highlight ? 'var(--bg-darker)' : 'var(--bg-card)',
                borderColor: plan.highlight ? 'var(--primary)' : 'var(--glass-border)',
                animationDelay: `${i * 0.15}s`
              }}
            >
              <div className="feature-icon-wrapper" style={{ 
                color: plan.highlight ? 'var(--secondary)' : 'var(--primary)',
                background: plan.highlight ? 'var(--secondary-glow)' : 'var(--bg-accent)'
              }}>
                {plan.icon}
              </div>
              
              <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>{plan.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                <span style={{ fontSize: '42px', fontWeight: 900 }}>{plan.price}</span>
                <span style={{ color: 'var(--text-gray)', fontSize: '18px' }}>د.ت {plan.period}</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px' }}>
                {plan.features.map((f, fi) => (
                  <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-gray)', fontSize: '15px' }}>
                    <Check size={18} color="var(--primary)" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link to="/subscriptions" style={{ textDecoration: 'none' }}>
                <button className={plan.highlight ? 'btn-premium' : 'signup-button'} style={{ width: '100%' }}>
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Futuristic Glassmorphism Edit Modal rendered with React Portal */}
      {showEditModal && createPortal(
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '850px' }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <Edit3 size={22} style={{ color: '#10b981' }} />
                <span>تعديل خطط الاشتراك والأسعار</span>
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

              <h4 style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', margin: '25px 0 15px' }}>تفاصيل خطط الاشتراك الثلاثة</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                {/* Plan 1 */}
                <div className="admin-form-group" style={{ background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <label className="admin-form-label" style={{ color: '#10b981' }}>الخطة الأساسية</label>
                  <label className="admin-form-label" style={{ fontSize: '11px', marginTop: '5px' }}>الاسم</label>
                  <input 
                    type="text" 
                    value={formPlan1Name} 
                    onChange={e => setFormPlan1Name(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                  <label className="admin-form-label" style={{ fontSize: '11px', marginTop: '5px' }}>السعر (د.ت)</label>
                  <input 
                    type="text" 
                    value={formPlan1Price} 
                    onChange={e => setFormPlan1Price(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                  <label className="admin-form-label" style={{ fontSize: '11px', marginTop: '5px' }}>نص الزر</label>
                  <input 
                    type="text" 
                    value={formPlan1Cta} 
                    onChange={e => setFormPlan1Cta(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                  <label className="admin-form-label" style={{ fontSize: '11px', marginTop: '5px' }}>الميزات (سطر لكل ميزة)</label>
                  <textarea 
                    value={formPlan1FeaturesText} 
                    onChange={e => setFormPlan1FeaturesText(e.target.value)} 
                    className="admin-form-input" 
                    style={{ minHeight: '100px', fontSize: '12px' }}
                    required 
                  />
                </div>

                {/* Plan 2 */}
                <div className="admin-form-group" style={{ background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <label className="admin-form-label" style={{ color: '#10b981' }}>الباقة الذهبية (المميزة)</label>
                  <label className="admin-form-label" style={{ fontSize: '11px', marginTop: '5px' }}>الاسم</label>
                  <input 
                    type="text" 
                    value={formPlan2Name} 
                    onChange={e => setFormPlan2Name(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                  <label className="admin-form-label" style={{ fontSize: '11px', marginTop: '5px' }}>السعر (د.ت)</label>
                  <input 
                    type="text" 
                    value={formPlan2Price} 
                    onChange={e => setFormPlan2Price(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                  <label className="admin-form-label" style={{ fontSize: '11px', marginTop: '5px' }}>نص الزر</label>
                  <input 
                    type="text" 
                    value={formPlan2Cta} 
                    onChange={e => setFormPlan2Cta(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                  <label className="admin-form-label" style={{ fontSize: '11px', marginTop: '5px' }}>الميزات (سطر لكل ميزة)</label>
                  <textarea 
                    value={formPlan2FeaturesText} 
                    onChange={e => setFormPlan2FeaturesText(e.target.value)} 
                    className="admin-form-input" 
                    style={{ minHeight: '100px', fontSize: '12px' }}
                    required 
                  />
                </div>

                {/* Plan 3 */}
                <div className="admin-form-group" style={{ background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <label className="admin-form-label" style={{ color: '#10b981' }}>حزمة النخبة</label>
                  <label className="admin-form-label" style={{ fontSize: '11px', marginTop: '5px' }}>الاسم</label>
                  <input 
                    type="text" 
                    value={formPlan3Name} 
                    onChange={e => setFormPlan3Name(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                  <label className="admin-form-label" style={{ fontSize: '11px', marginTop: '5px' }}>السعر (د.ت)</label>
                  <input 
                    type="text" 
                    value={formPlan3Price} 
                    onChange={e => setFormPlan3Price(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                  <label className="admin-form-label" style={{ fontSize: '11px', marginTop: '5px' }}>نص الزر</label>
                  <input 
                    type="text" 
                    value={formPlan3Cta} 
                    onChange={e => setFormPlan3Cta(e.target.value)} 
                    className="admin-form-input" 
                    required 
                  />
                  <label className="admin-form-label" style={{ fontSize: '11px', marginTop: '5px' }}>الميزات (سطر لكل ميزة)</label>
                  <textarea 
                    value={formPlan3FeaturesText} 
                    onChange={e => setFormPlan3FeaturesText(e.target.value)} 
                    className="admin-form-input" 
                    style={{ minHeight: '100px', fontSize: '12px' }}
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

export default PricingSection;