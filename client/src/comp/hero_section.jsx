import React from 'react';
import CountUp from 'react-countup'; // 👈 استيراد مكون CountUp
import { Link } from 'react-router-dom';

const HeroSection = () => {
  // تعريف الأرقام المستهدفة
  const stats = [
    { number: 10000, label: 'تحديات', prefix: '', suffix: '+' },
    { number: 92, label: 'معدل النجاح', prefix: '', suffix: '%' },
    { number: 50, label: 'دروس', prefix: '', suffix: '+' },
  ];

  return (
    <div className="hero_container">
      <div className="hero-content">
        {/* العناوين والأزرار ... (كما هي) */}
        <h1 className="hero-title">أتقن قانون الطريق التونسي</h1>
        <p className="hero-subtitle">
          نساعد بفعالية لامتحان رخصة القيادة من خلال دوراتنا التفاعلية واختباراتنا العملية.
        </p>
        <div className="hero-buttons">
          <Link to="/subscriptions">
            <button className="btn-primary">اشترك الان</button>
          </Link>

          <Link to="/courses">
            <button className="btn-secondary">عرض الدروس</button>
          </Link>
        
        </div>

        {/* قسم الإحصائيات المحدث */}
        <div className="hero-stats">
          {stats.map((stat, index) => (
            <div className="stat-card" key={index}>
              <span className="stat-number">
                <CountUp
                  start={0} // يبدأ من الصفر
                  end={stat.number} // الرقم المستهدف
                  duration={3} // مدة الرسوم المتحركة بالثواني (3 ثواني لإضفاء طابع سينمائي)
                  delay={0.5} // تأخير بسيط قبل البدء
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  enableScrollSpy={true} // يبدأ العد عندما يصبح مرئياً
                  scrollSpyOnce={true} // يعد مرة واحدة فقط عند ظهوره
                  separator={stat.number > 1000 ? ',' : ''} // لإضافة فاصل للآلاف
                />
              </span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;