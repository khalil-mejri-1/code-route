import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../comp/navbar';
import { Users, LayoutDashboard, Settings, LogOut, ChevronRight, Trash2, UserCheck, UserX, Snowflake, ShieldCheck, ShieldAlert, X } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import ConfirmModal from '../../comp/ConfirmModal';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [selectedUserResults, setSelectedUserResults] = useState(null);
    
    // Categories Modal State
    const [showCategoriesModal, setShowCategoriesModal] = useState(false);
    const [selectedUserForCategories, setSelectedUserForCategories] = useState(null);
    const [selectedCategoriesList, setSelectedCategoriesList] = useState([]);

    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        type: 'danger',
        onConfirm: () => { }
    });

    useEffect(() => {
        const role = localStorage.getItem('role');
        const isLoggedIn = localStorage.getItem('login') === 'true';

        if (!isLoggedIn || role !== 'admin') {
            window.location.href = '/';
            return;
        }

        if (activeTab === 'users') {
            fetchUsers();
            fetchCategories();
        }
    }, [activeTab]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/categories`);
            setAvailableCategories(res.data);
        } catch (err) {
            console.error('فشل في جلب الفئات', err);
        }
    };


    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/users`);
            setUsers(res.data);
        } catch (err) {
            console.error(err);
            setError('فشل في جلب قائمة المستخدمين');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleApproval = async (userId, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            await axios.put(`${API_BASE_URL}/users/${userId}/approve`, { isApproved: newStatus });
            setUsers(users.map(user => user._id === userId ? { ...user, isApproved: newStatus } : user));
        } catch (err) {
            console.error(err);
            alert('فشل في تحديث حالة المستخدم');
        }
    };

    const handleToggleFreeze = async (userId, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            await axios.put(`${API_BASE_URL}/users/${userId}/freeze`, { isFrozen: newStatus });
            setUsers(users.map(user => user._id === userId ? { ...user, isFrozen: newStatus } : user));
        } catch (err) {
            console.error(err);
            alert('فشل في تحديث حالة التجميد');
        }
    };

    const handleToggleRole = async (userId, currentRole) => {
        try {
            const newRole = currentRole === 'admin' ? 'user' : 'admin';
            await axios.put(`${API_BASE_URL}/users/${userId}/role`, { role: newRole });
            setUsers(users.map(user => user._id === userId ? { ...user, role: newRole } : user));
        } catch (err) {
            console.error(err);
            alert('فشل في تحديث دور المستخدم');
        }
    };

    const handleDeleteUser = (userId) => {
        setModalConfig({
            title: 'حذف الحساب',
            message: 'هل أنت متأكد من حذف هذا الحساب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await axios.delete(`${API_BASE_URL}/users/${userId}`);
                    setUsers(users.filter(user => user._id !== userId));
                } catch (err) {
                    console.error(err);
                    alert('فشل في حذف المستخدم');
                }
            }
        });
        setIsModalOpen(true);
    };

    const handleSaveUserCategories = async () => {
        try {
            await axios.put(`${API_BASE_URL}/users/${selectedUserForCategories._id}/categories`, {
                allowedCategories: selectedCategoriesList
            });
            setUsers(users.map(user => 
                user._id === selectedUserForCategories._id 
                    ? { ...user, allowedCategories: selectedCategoriesList } 
                    : user
            ));
            setShowCategoriesModal(false);
        } catch (err) {
            console.error(err);
            alert('فشل في تحديث الدروس المسموحة');
        }
    };

    const handleLogout = () => {
        setModalConfig({
            title: 'تسجيل الخروج',
            message: 'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
            type: 'warning',
            onConfirm: () => {
                localStorage.removeItem('login');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userFullName');
                window.location.href = '/login';
            }
        });
        setIsModalOpen(true);
    };

    return (
        <div className="admin-dashboard-container">
            <Navbar />

            <div className="admin-layout">
                {/* Sidebar */}
                <aside className="admin-sidebar">
                    <div className="sidebar-header">
                        <div className="admin-avatar">A</div>
                        <div className="admin-info">
                            <h3>لوحة التحكم</h3>
                            <p>المسؤول</p>
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        <button
                            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            <Users size={20} />
                            <span>Gestion Utilisateurs</span>
                            <ChevronRight size={16} className="chevron" />
                        </button>

                        <button
                            className={`nav-item ${activeTab === 'results' ? 'active' : ''}`}
                            onClick={() => setActiveTab('results')}
                        >
                            <LayoutDashboard size={20} />
                            <span>نتائج الطلاب (Résultats)</span>
                            <ChevronRight size={16} className="chevron" />
                        </button>

                        <button className="nav-item disabled">
                            <Settings size={20} />
                            <span>الإعدادات</span>
                        </button>
                    </nav>

                    <div className="sidebar-footer">
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={20} />
                            <span>تسجيل الخروج</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="admin-main-content">
                    <header className="content-header">
                        <h1>{activeTab === 'users' ? 'إدارة المستخدمين (User Management)' : 'لوحة التحكم'}</h1>
                        <p>مرحباً بك في لوحة الإدارة الموحدة</p>
                    </header>

                    {activeTab === 'users' && (
                        <section className="dashboard-section reveal-anim">
                            <div className="section-card">
                                <div className="card-header">
                                    <h2>قائمة المستخدمين المسجلين</h2>
                                    <span className="user-count">إجمالي: {users.length}</span>
                                </div>

                                {loading ? (
                                    <div className="loading-spinner">جاري التحميل...</div>
                                ) : error ? (
                                    <div className="error-message">{error}</div>
                                ) : (
                                    <div className="table-container">
                                        <table className="modern-table">
                                            <thead>
                                                <tr>
                                                    <th>المستخدم</th>
                                                    <th>البريد الإلكتروني</th>
                                                    <th>الرتبة</th>
                                                    <th>تاريخ الانضمام</th>
                                                    <th>الحالة</th>
                                                    <th>الدروس المسموحة</th>
                                                    <th>التجميد</th>
                                                    <th>الإجراءات</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((user) => (
                                                    <tr key={user._id}>
                                                        <td>
                                                            <div className="user-cell">
                                                                <div className={`user-initials ${user.role === 'admin' ? 'admin-bg' : ''}`}>
                                                                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                                                                </div>
                                                                <span>{user.fullName}</span>
                                                            </div>
                                                        </td>
                                                        <td>{user.email}</td>
                                                        <td>
                                                            <span className={`status-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                                                                {user.role === 'admin' ? 'مدير' : 'طالب'}
                                                            </span>
                                                        </td>
                                                        <td>{new Date(user.createdAt).toLocaleDateString('ar-TN')}</td>
                                                        <td>
                                                            <span className={`status-badge ${user.isApproved ? 'active' : 'pending'}`}>
                                                                {user.isApproved ? 'مقبول' : 'قيد الانتظار'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                                                    {user.allowedCategories && user.allowedCategories.length > 0 
                                                                        ? user.allowedCategories.join(', ') 
                                                                        : 'الكل'}
                                                                </span>
                                                                <button
                                                                    className="btn-premium-sm"
                                                                    style={{ padding: '2px 8px', fontSize: '10px' }}
                                                                    onClick={() => {
                                                                        setSelectedUserForCategories(user);
                                                                        setSelectedCategoriesList(user.allowedCategories || []);
                                                                        setShowCategoriesModal(true);
                                                                    }}
                                                                >
                                                                    تعديل الدروس
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge ${user.isFrozen ? 'frozen' : 'normal'}`}>
                                                                {user.isFrozen ? 'مجمد ❄️' : 'نشط'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="table-actions">
                                                                <button 
                                                                    className={`role-btn ${user.role === 'admin' ? 'to-user' : 'to-admin'}`}
                                                                    onClick={() => handleToggleRole(user._id, user.role)}
                                                                    title={user.role === 'admin' ? 'تحويل لمستخدم عادي' : 'ترقية لمدير'}
                                                                >
                                                                    {user.role === 'admin' ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                                                                </button>

                                                                <button 
                                                                    className={`approve-btn ${user.isApproved ? 'unapprove' : ''}`}
                                                                    onClick={() => handleToggleApproval(user._id, user.isApproved)}
                                                                    title={user.isApproved ? 'إلغاء الموافقة' : 'موافقة'}
                                                                >
                                                                    {user.isApproved ? <UserX size={18} /> : <UserCheck size={18} />}
                                                                </button>
                                                                
                                                                <button 
                                                                    className={`freeze-btn ${user.isFrozen ? 'frozen-active' : ''}`}
                                                                    onClick={() => handleToggleFreeze(user._id, user.isFrozen)}
                                                                    title={user.isFrozen ? 'إلغاء التجميد' : 'تجميد الحساب'}
                                                                >
                                                                    <Snowflake size={18} />
                                                                </button>

                                                                <button 
                                                                    className="delete-user-btn"
                                                                    onClick={() => handleDeleteUser(user._id)}
                                                                    title="حذف الحساب"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {activeTab === 'results' && (
                        <section className="dashboard-section reveal-anim">
                            <div className="section-card">
                                <div className="card-header">
                                    <h2>متابعة نتائج الامتحانات للطلاب</h2>
                                    <span className="user-count">طلاب خاضوا امتحانات: {users.filter(u => u.examResults && u.examResults.length > 0).length}</span>
                                </div>

                                <div className="table-container">
                                    <table className="modern-table">
                                        <thead>
                                            <tr>
                                                <th>الطالب</th>
                                                <th>عدد الامتحانات</th>
                                                <th>آخر نتيجة</th>
                                                <th>متوسط الأخطاء</th>
                                                <th>الحالة العامة</th>
                                                <th>التفاصيل</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.filter(u => u.role !== 'admin').map((user) => {
                                                const totalExams = user.examResults ? user.examResults.length : 0;
                                                const lastResult = totalExams > 0 ? user.examResults[totalExams - 1] : null;
                                                const avgWrong = totalExams > 0 
                                                    ? (user.examResults.reduce((acc, r) => acc + r.wrongAnswers, 0) / totalExams).toFixed(1)
                                                    : '-';
                                                
                                                return (
                                                    <tr key={user._id}>
                                                        <td>
                                                            <div className="user-cell">
                                                                <div className="user-initials">
                                                                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                                                                </div>
                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <span style={{ fontWeight: 700 }}>{user.fullName}</span>
                                                                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{user.email}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{totalExams}</td>
                                                        <td>
                                                            {lastResult ? (
                                                                <span className={`status-badge ${lastResult.wrongAnswers <= 5 ? 'active' : 'pending'}`}>
                                                                    {lastResult.correctAnswers} / {lastResult.totalQuestions}
                                                                </span>
                                                            ) : 'لم يمتحن بعد'}
                                                        </td>
                                                        <td style={{ color: avgWrong > 5 ? '#f43f5e' : '#10b981', fontWeight: 700 }}>
                                                            {avgWrong} خطأ
                                                        </td>
                                                        <td>
                                                            {totalExams > 0 ? (
                                                                <span className={`status-badge ${parseFloat(avgWrong) <= 5 ? 'active' : 'pending'}`} style={{ fontSize: '10px' }}>
                                                                    {parseFloat(avgWrong) <= 5 ? 'مستوى ممتاز ✅' : 'يحتاج مراجعة ⚠️'}
                                                                </span>
                                                            ) : '-'}
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className="btn-premium-sm"
                                                                style={{ padding: '6px 12px', fontSize: '11px', background: 'var(--bg-accent)', color: 'var(--primary)', border: '1px solid var(--primary-glow)' }}
                                                                onClick={() => {
                                                                    setSelectedUserResults(user);
                                                                    setShowResultsModal(true);
                                                                }}
                                                            >
                                                                عرض السجل
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}
                </main>
            </div>

            {/* 🏆 نافذة النتائج الاحترافية الجديدة (Premium Results Modal) */}
            {showResultsModal && selectedUserResults && (
                <div className="premium-modal-overlay reveal-anim" style={{ zIndex: 9999 }}>
                    <div className="results-modal-content glass-effect">
                        <div className="modal-header-premium">
                            <div className="header-title-group">
                                <div className="header-icon-box">
                                    <LayoutDashboard size={24} />
                                </div>
                                <div>
                                    <h2>سجل أداء الطالب: <span className="accent">{selectedUserResults.fullName}</span></h2>
                                    <p>{selectedUserResults.email}</p>
                                </div>
                            </div>
                            <button className="close-modal-btn" onClick={() => setShowResultsModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body-premium">
                            {selectedUserResults.examResults && selectedUserResults.examResults.length > 0 ? (
                                <div className="results-table-wrapper">
                                    <table className="modern-table results-specific-table">
                                        <thead>
                                            <tr>
                                                <th>الفئة</th>
                                                <th>رقم الامتحان</th>
                                                <th>النتيجة</th>
                                                <th>الأخطاء</th>
                                                <th>التاريخ والوقت</th>
                                                <th>الحالة</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedUserResults.examResults.slice().reverse().map((res, i) => (
                                                <tr key={i}>
                                                    <td><span className="badge-new" style={{ fontSize: '10px' }}>{res.category}</span></td>
                                                    <td style={{ fontWeight: 700 }}>إمتحان رقم {res.examNum}</td>
                                                    <td style={{ color: 'var(--primary)', fontWeight: 800 }}>{res.correctAnswers} / {res.totalQuestions}</td>
                                                    <td style={{ color: res.wrongAnswers > 5 ? '#f43f5e' : '#10b981', fontWeight: 700 }}>{res.wrongAnswers} أخطاء</td>
                                                    <td>{new Date(res.completedAt).toLocaleString('ar-TN')}</td>
                                                    <td>
                                                        <span className={`status-badge ${res.wrongAnswers <= 5 ? 'active' : 'pending'}`}>
                                                            {res.wrongAnswers <= 5 ? 'ناجح ✅' : 'راسب ❌'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-results-state">
                                    <div className="empty-icon-box">
                                        <ShieldAlert size={48} />
                                    </div>
                                    <h3>لا توجد نتائج مسجلة</h3>
                                    <p>هذا الطالب لم يقم بإجراء أي امتحانات حتى الآن.</p>
                                    <button className="btn-premium-sm" onClick={() => setShowResultsModal(false)} style={{ marginTop: '20px' }}>
                                        إغلاق النافذة
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-footer-premium">
                            <div className="stats-summary">
                                <span>إجمالي الامتحانات: <strong>{selectedUserResults.examResults?.length || 0}</strong></span>
                                {selectedUserResults.examResults?.length > 0 && (
                                    <span style={{ marginRight: '20px' }}>أفضل نتيجة: <strong>{Math.max(...selectedUserResults.examResults.map(r => r.correctAnswers))}</strong></span>
                                )}
                            </div>
                            <button className="btn-premium-sm" onClick={() => setShowResultsModal(false)}>تم</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories Modal */}
            {showCategoriesModal && selectedUserForCategories && (
                <div className="premium-modal-overlay reveal-anim" style={{ zIndex: 9999 }}>
                    <div className="results-modal-content glass-effect" style={{ maxWidth: '400px' }}>
                        <div className="modal-header-premium">
                            <div className="header-title-group">
                                <div>
                                    <h2>تعديل الدروس المسموحة</h2>
                                    <p>{selectedUserForCategories.fullName}</p>
                                </div>
                            </div>
                            <button className="close-modal-btn" onClick={() => setShowCategoriesModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body-premium" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {availableCategories.map(cat => (
                                    <label key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', background: 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCategoriesList.includes(cat.category)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCategoriesList([...selectedCategoriesList, cat.category]);
                                                } else {
                                                    setSelectedCategoriesList(selectedCategoriesList.filter(c => c !== cat.category));
                                                }
                                            }}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>الصنف {cat.category}</span>
                                    </label>
                                ))}
                            </div>
                            {availableCategories.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#666' }}>لا توجد أصناف متاحة.</p>
                            )}
                        </div>
                        <div className="modal-footer-premium" style={{ justifyContent: 'center' }}>
                            <button className="btn-premium-sm" onClick={handleSaveUserCategories} style={{ width: '100%' }}>حفظ التعديلات</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Professional Confirm Modal */}
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />
        </div>
    );
};

export default AdminDashboard;
