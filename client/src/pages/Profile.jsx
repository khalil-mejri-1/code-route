import React, { useState, useEffect } from 'react';
import Navbar from '../comp/navbar';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { User, Mail, Calendar, Award, Trophy, CheckCircle, XCircle, Clock, ChevronLeft } from 'lucide-react';
import './Profile.css';

export default function Profile() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const email = localStorage.getItem('userEmail');
    const isLoggedIn = localStorage.getItem('login') === 'true';

    useEffect(() => {
        if (!isLoggedIn || !email) {
            window.location.href = '/login';
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/profile?email=${email}`);
                setUserData(response.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [email, isLoggedIn]);

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="loader-spinner"></div>
                <p>جاري تحميل ملفك الشخصي...</p>
            </div>
        );
    }

    const totalExams = userData?.examResults?.length || 0;
    const avgCorrect = totalExams > 0
        ? (userData.examResults.reduce((acc, curr) => acc + curr.correctAnswers, 0) / totalExams).toFixed(1)
        : 0;

    return (
        <div className="profile-page">
            <Navbar />
            <div className="profile-container">
                <div className="profile-header reveal-anim">
                    <div className="profile-avatar-large">
                        {userData?.fullName?.[0] || 'U'}
                    </div>
                    <div className="profile-main-info">
                        <h1>{userData?.fullName}</h1>
                        <div className="profile-badges">
                            <span className={`role-badge ${userData?.role}`}>
                                {userData?.role === 'admin' ? 'مدير النظام' : 'طالب'}
                            </span>
                            {userData?.subscriptions === true && (
                                <span className="premium-badge">عضوية VIP</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile-grid">
                    {/* Sidebar Info */}
                    <div className="profile-sidebar reveal-anim">
                        <div className="info-card">
                            <h3>معلومات الحساب</h3>
                            <div className="info-item">
                                <Mail size={18} />
                                <div>
                                    <label>البريد الإلكتروني</label>
                                    <p>{userData?.email}</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <Calendar size={18} />
                                <div>
                                    <label>تاريخ الانضمام</label>
                                    <p>{new Date(userData?.createdAt).toLocaleDateString('ar-TN')}</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <Award size={18} />
                                <div>
                                    <label>حالة الحساب</label>
                                    <p>{userData?.isApproved ? 'مفعل' : 'في انتظار التفعيل'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="stats-summary-card">
                            <div className="stat-box">
                                <Trophy size={24} color="var(--primary)" />
                                <h4>{totalExams}</h4>
                                <p>امتحان منجز</p>
                            </div>
                            <div className="stat-box">
                                <CheckCircle size={24} color="#10b981" />
                                <h4>{avgCorrect}</h4>
                                <p>معدل الإجابات</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Exam History */}
                    <div className="profile-content reveal-anim">
                        <div className="history-header">
                            <h2>سجل الامتحانات</h2>
                            <p>تتبع أداءك في جميع الاختبارات التي أجريتها</p>
                        </div>

                        {totalExams > 0 ? (
                            <div className="exam-history-list">
                                {[...userData.examResults].reverse().map((result, index) => (
                                    <div key={index} className="history-item">
                                        <div className="history-icon">
                                            <Trophy size={20} />
                                        </div>
                                        <div className="history-details">
                                            <div className="history-title">
                                                <span>اختبار {result.examNum} - صنف {result.category}</span>
                                                <span className="history-date">
                                                    <Clock size={12} /> {new Date(result.completedAt).toLocaleDateString('ar-TN')}
                                                </span>
                                            </div>
                                            <div className="history-stats">
                                                <div className="stat">
                                                    <span className="dot correct"></span>
                                                    صحيحة: <strong>{result.correctAnswers}</strong>
                                                </div>
                                                <div className="stat">
                                                    <span className="dot wrong"></span>
                                                    خاطئة: <strong>{result.wrongAnswers}</strong>
                                                </div>
                                                <div className="stat">
                                                    <span className="score-label">النتيجة:</span>
                                                    <strong className={result.correctAnswers >= 24 ? 'pass' : 'fail'}>
                                                        {result.correctAnswers}/{result.totalQuestions}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="history-action">
                                            <ChevronLeft size={20} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-history">
                                <Trophy size={48} />
                                <p>لم تقم بإجراء أي اختبارات بعد.</p>
                                {/* <button className="btn-premium" onClick={() => window.location.href='/examens'}>ابدأ الآن</button> */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
