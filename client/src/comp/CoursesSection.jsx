import React from 'react';
import { BookOpen, GraduationCap, Award, TrendingUp } from 'lucide-react';
// FaCheckCircle is imported but not used in the original structure, I will omit it for simplicity.
// If it were intended for a different part of the design, it would be included.

// Data for the features section
const academyFeatures = [
  {
    icon: BookOpen,
    title: 'دروس شاملة', // Comprehensive Lessons
    description: 'محتوى تعليمي متكامل يغطي جميع جوانب قانون السير', // Integrated educational content covering all aspects of traffic law
    color: '#3b82f6', // Blue
  },
  {
    icon: GraduationCap,
    title: 'اختبارات تفاعلية', // Interactive Exams
    description: 'اختبارات محاكاة للواقع مع نظام تقييم فوري', // Reality simulation exams with an instant grading system
    color: '#10b981', // Emerald/Green
  },
 
  {
    icon: TrendingUp,
    title: 'تتبع التقدم', // Track Progress
    description: 'راقب تقدمك وإحصائياتك التعليمية بشكل مستمر', // Monitor your progress and learning statistics continuously
    color: '#8b5cf6', // Violet/Purple
  },
];

/**
 * Renders a single feature card.
 * @param {object} props - The feature object.
 */
const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <div className="feature-card">
    <div
      className="feature-icon"
      // Apply a light background color based on the feature's primary color
      style={{ backgroundColor: `${color}15` }}
    >
      {/* Icon component from lucide-react */}
      <Icon size={70} style={{ color: color, padding: '10px' }} />
    </div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{description}</p>
  </div>
);


/**
 * Main component to display the academy's features, structured as a "Courses Section" 
 * but using the features data.
 */
const FeaturesSection = () => {
  return (
    <section className="features-section">
      <div className="features-header">
        <h2 className="section-title_home">لماذا أكاديمية قانون السير؟ 🎓</h2> {/* Why Traffic Law Academy? */}
        <p className="section-subtitle">نقدم لكم أهم المزايا لضمان نجاحكم في اختبارات قانون السير.</p> 
        {/* We offer you the most important features to ensure your success in traffic law tests. */}
      </div>
      
      {/* The grid will map over the 'academyFeatures' data */}
      <div className="features-grid">
        {academyFeatures.map((feature, index) => (
          <FeatureCard 
            key={index} 
            // Spread all feature properties as props
            {...feature} 
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;