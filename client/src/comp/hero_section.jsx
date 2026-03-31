import React from 'react';
import { ArrowLeft, Play, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImg from '../image/hero-bg.png';

const HeroSection = () => {
  return (
    <div className="hero-wrapper">
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

      <div className="hero-content reveal-anim">
        <div className="badge-new">
          <CheckCircle size={14} />
          <span>المنصة رقم 1 في تعلم قانون الطرق بذكاء</span>
        </div>
        
        <h1 className="hero-title-main">
          <span>أتقن قانون السير بأسلوب </span>
          <br/>
          <span className="accent">إبداعي وحديث</span>
        </h1>
        
        <p className="hero-desc">
          ابدأ رحلتك التفاعلية اليوم مع دروس متطورة، اختبارات تحاكي الواقع، ونظام تتبع ذكي يضمن وصولك للعلامة الكاملة في وقت قياسي.
        </p>
        
        <div className="hero-cta">
          <Link to="/courses" style={{ textDecoration: 'none' }}>
            <button className="btn-premium">
              ابدأ التعلم الآن
              <ArrowLeft size={18} />
            </button>
          </Link>
          
          <Link to="/courses" style={{ textDecoration: 'none' }}>
            <button className="signup-button" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', padding: '18px 32px' }}>
               <Play size={18} fill="currentColor" />
               عرض تجريبي
            </button>
          </Link>
        </div>
      </div>

      <div className="stats-section reveal-anim">
        <div className="stats-grid">
          <div className="stat-item">
            <h2>+50k</h2>
            <p>مستخدم نشط</p>
          </div>
          <div className="stat-item">
            <h2>100%</h2>
            <p>تغطية شاملة</p>
          </div>
          <div className="stat-item">
            <h2>4.9</h2>
            <p>تقييم المستخدمين</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;