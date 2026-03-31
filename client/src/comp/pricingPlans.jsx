import React from 'react';
import { Check, Shield, Star, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const premiumPlans = [
  {
    name: 'الخطة الأساسية',
    icon: <Shield size={24} />,
    price: '49',
    period: '/ شهر',
    features: ['الوصول لجميع الدروس', 'اختبارات تجريبية محدودة', 'تتبع التقدم الأساسي'],
    highlight: false,
    cta: 'ابدأ مجاناً'
  },
  {
    name: 'الباقة الذهبية',
    icon: <Star size={24} />,
    price: '99',
    period: '/ شهر',
    features: ['كل ما في الأساسية', 'اختبارات غير محدودة', 'دعم مباشر 24/7', 'تصحيح مفصل'],
    highlight: true,
    cta: 'اشترك الآن'
  },
  {
    name: 'حزمة النخبة',
    icon: <Crown size={24} />,
    price: '249',
    period: '/ 6 أشهر',
    features: ['كل المميزات المفتوحة', 'دروس فيديو حصرية', 'مدير حساب خاص', 'شهادة إتمام'],
    highlight: false,
    cta: 'انطلق للاحتراف'
  }
];

const PricingSection = () => {
  return (
    <section className="pricing-section">
      <div className="premium-container reveal-anim">
        <div className="section-head">
          <span className="badge-new">الاشتراكات</span>
          <h2>اختر باقتك و <span className="accent">انطلق نحو النجاح</span></h2>
          <p className="hero-desc">خطط مرنة تناسب طموحك وجدولك الزمني.</p>
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
    </section>
  );
};

export default PricingSection;