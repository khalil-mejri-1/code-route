import React from 'react';
import { BookOpen, GraduationCap, Award, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

const modernFeatures = [
  {
    icon: <Zap />,
    title: 'تعلم سريع وذكي',
    description: 'تم تصميم نظامنا بطريقة تضمن استيعاب المفاهيم في أقل وقت ممكن.',
    color: 'var(--primary)'
  },
  {
    icon: <GraduationCap />,
    title: 'اختبارات محاكاة',
    description: 'خض تجربة مشابهة للاختبار الرسمي تماماً مع نظام فوري للنتائج.',
    color: 'var(--secondary)'
  },
  {
    icon: <ShieldCheck />,
    title: 'بيئة آمنة للمبتدئين',
    description: 'كل ما تحتاجه من موارد وأدوات في مكان واحد ليكون طريقك سهلاً ومضموناً.',
    color: 'var(--primary)'
  },
  {
    icon: <BookOpen />,
    title: 'محتوى شامل وحصري',
    description: 'دروس بصرية متقدمة، رسوم توضيحية، وفيديوهات تشرح القواعد المعقدة.',
    color: 'var(--secondary)'
  }
];

const FeaturesSection = () => {
  return (
    <section className="features-section premium-container">
      <div className="section-head reveal-anim">
        <span className="badge-new">لماذا منصتنا؟</span>
        <h2>قوة التجربة و <span className="accent">رؤية المحترفين</span></h2>
        <p className="hero-desc">نحن لا نعلمك فقط لتنجح، بل لتقود بذكاء وأمان.</p>
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
    </section>
  );
};

export default FeaturesSection;