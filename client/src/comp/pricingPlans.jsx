import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa'; // أيقونات صح وخطأ
import { Link } from 'react-router-dom';

// (استخدم البيانات أعلاه)
const pricingPlans = [
  // ... (بيانات الخطط) ...

  {
    name: 'شهري',
    tagline: 'وصول كامل لمدة شهر واحد',
    price: '9.99',
    currency: 'دينار تونسي',
    features: [
      { text: 'الوصول إلى جميع الدروس', included: true },
      { text: 'اختبارات عملية غير محدودة', included: true },
      { text: 'تصحيحات مفصلة', included: true },
      { text: 'الاجابة عن الاستفسارات  24/24', included: true },
    ],
    buttonText: 'اشترك',
    highlight: true,
  },
 
];

const PricingCard = ({ plan }) => {
  const isHighlight = plan.highlight;
  const buttonClass = isHighlight ? 'btn-primary' : 'btn-outline';

  return (
    <div className={`pricing-card ${isHighlight ? 'highlighted' : ''}`}>
      <h3 className="plan-name">{plan.name}</h3>
      <p className="plan-tagline">{plan.tagline}</p>

      <div className="plan-price">
        <span className="price-number">{plan.price}</span>
        <span className="price-currency">{plan.currency}</span>
      </div>

      <button className={buttonClass}>
        {plan.buttonText}
      </button>

      <ul className="plan-features">
        {plan.features.map((feature, index) => (
          <li key={index} className={feature.included ? 'included' : 'excluded'}>
            {feature.included ? (
              <FaCheck className="feature-icon check" />
            ) : (
              <FaTimes className="feature-icon times" />
            )}
            {feature.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

const PricingSection = () => {
  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h2 className="pricing-title">خطط الاشتراك</h2>
        <p className="pricing-subtitle">اختر الخطة المناسبة لك</p>
      </div>
<Link style={{textDecoration:"none"}} to="/subscriptions">
  <div className="pricing-grid">
        {pricingPlans.map((plan, index) => (
          <PricingCard key={index} plan={plan} />
        ))}
      </div>

</Link>
    
    </div>
  );
};

export default PricingSection;