import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../comp/navbar';
import './AdminPanel.css'; // We'll create this for styling

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('categories');
    const [categories, setCategories] = useState([]);
    const [topics, setTopics] = useState([]);
    const [users, setUsers] = useState([]);
    const [newCategory, setNewCategory] = useState({ category: '', description: '', image: '' });
    const [newTopic, setNewTopic] = useState({ name: '', category: '', image: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Edit states
    const [editingItem, setEditingItem] = useState(null); // { type: 'category'|'topic', data: {} }

    useEffect(() => {
        fetchCategories();
        fetchTopics();
        fetchUsers();
    }, []);

    // Set default category for new topic once categories are loaded
    useEffect(() => {
        if (categories.length > 0 && !newTopic.category) {
            setNewTopic(prev => ({ ...prev, category: categories[0].category }));
        }
    }, [categories]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/categories');
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTopics = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/topics');
            setTopics(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:3000/api/categories', newCategory);
            setMessage('تم إضافة الصنف بنجاح');
            setNewCategory({ category: '', description: '', image: '' });
            fetchCategories();
        } catch (err) {
            setMessage('فشل في إضافة الصنف');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleAddTopic = async (e) => {
        e.preventDefault();
        if (!newTopic.category) {
            alert('الرجاء اختيار فئة');
            return;
        }
        setLoading(true);
        try {
            await axios.post('http://localhost:3000/api/topics', newTopic);
            setMessage('تم إضافة الموضوع بنجاح');
            const currentCat = newTopic.category;
            setNewTopic({ name: '', category: currentCat, image: '' });
            fetchTopics();
        } catch (err) {
            setMessage('فشل في إضافة الموضوع');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
            try {
                await axios.delete(`http://localhost:3000/api/categories/${id}`);
                fetchCategories();
            } catch (err) {
                alert('فشل في الحذف');
            }
        }
    };

    const handleDeleteTopic = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الموضوع؟')) {
            try {
                await axios.delete(`http://localhost:3000/api/topics/${id}`);
                fetchTopics();
            } catch (err) {
                alert('فشل في الحذف');
            }
        }
    };

    const handleEditStart = (type, data) => {
        setEditingItem({ type, data: { ...data } });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { type, data } = editingItem;
        const url = type === 'category'
            ? `http://localhost:3000/api/categories/${data._id}`
            : `http://localhost:3000/api/topics/${data._id}`;

        try {
            await axios.put(url, data);
            setMessage('تم التحديث بنجاح');
            setEditingItem(null);
            type === 'category' ? fetchCategories() : fetchTopics();
        } catch (err) {
            setMessage('فشل في التحديث');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="admin-panel-container">
            <Navbar />
            <div className="admin-content">
                <h1 className="admin-title">لوحة التحكم (Admin Panel)</h1>

                {editingItem && (
                    <div className="edit-modal-overlay">
                        <div className="edit-modal">
                            <h2>تعديل {editingItem.type === 'category' ? 'الصنف' : 'الموضوع'}</h2>
                            <form onSubmit={handleUpdate} className="admin-form">
                                {editingItem.type === 'category' ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editingItem.data.category}
                                            onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                                            placeholder="اسم الصنف"
                                            required
                                        />
                                        <textarea
                                            value={editingItem.data.description}
                                            onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                                            placeholder="وصف الصنف"
                                            required
                                        />
                                    </>
                                ) : (
                                    <>
                                        <input
                                            type="text"
                                            value={editingItem.data.name}
                                            onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                                            placeholder="اسم الموضوع"
                                            required
                                        />
                                        <select
                                            value={editingItem.data.category}
                                            onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                                            required
                                            style={{ padding: '12px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155' }}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat.category}>{cat.category}</option>
                                            ))}
                                        </select>
                                    </>
                                )}
                                <input
                                    type="text"
                                    value={editingItem.data.image}
                                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, image: e.target.value } })}
                                    placeholder="رابط الصورة"
                                />
                                <div className="modal-actions">
                                    <button type="submit" className="save-btn" disabled={loading}>حفظ التعديلات</button>
                                    <button type="button" className="cancel-btn" onClick={() => setEditingItem(null)}>إلغاء</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="admin-tabs">
                    <button
                        className={activeTab === 'categories' ? 'active' : ''}
                        onClick={() => setActiveTab('categories')}
                    >
                        إدارة الأصناف (License Types)
                    </button>
                    <button
                        className={activeTab === 'topics' ? 'active' : ''}
                        onClick={() => setActiveTab('topics')}
                    >
                        إدارة المواضيع (Course Topics)
                    </button>
                    <button
                        className={activeTab === 'users' ? 'active' : ''}
                        onClick={() => setActiveTab('users')}
                    >
                        المسجلين في الموقع
                    </button>
                </div>

                {message && <div className="admin-message">{message}</div>}

                {activeTab === 'categories' && (
                    <div className="admin-section">
                        <h2>إضافة صنف رخصة جديد (مثلاً: B, A, C)</h2>
                        <form onSubmit={handleAddCategory} className="admin-form">
                            <input
                                type="text"
                                placeholder="اسم الصنف (مثلاً: B)"
                                value={newCategory.category}
                                onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="وصف الصنف"
                                value={newCategory.description}
                                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="رابط الصورة"
                                value={newCategory.image}
                                onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })}
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? 'جاري الإضافة...' : 'إضافة الصنف'}
                            </button>
                        </form>

                        <hr />

                        <h2>الأصناف الحالية</h2>
                        <div className="admin-grid">
                            {categories.map(cat => (
                                <div key={cat._id} className="admin-card">
                                    <img src={cat.image || 'https://via.placeholder.com/150'} alt={cat.category} />
                                    <div className="admin-card-info">
                                        <h3>{cat.category}</h3>
                                        <p>{cat.description}</p>
                                        <div className="card-actions">
                                            <button onClick={() => handleEditStart('category', cat)} className="edit-btn">تعديل</button>
                                            <button onClick={() => handleDeleteCategory(cat._id)} className="delete-btn">حذف</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'topics' && (
                    <div className="admin-section">
                        <h2>إضافة موضوع دراسي جديد</h2>
                        <form onSubmit={handleAddTopic} className="admin-form">
                            <input
                                type="text"
                                placeholder="اسم الموضوع (مثلاً: الأولوية، الإشارات)"
                                value={newTopic.name}
                                onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                                required
                            />

                            <select
                                value={newTopic.category}
                                onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                                required
                                style={{ padding: '12px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155' }}
                            >
                                <option value="">اختر الصنف التابع له</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat.category}>{cat.category}</option>
                                ))}
                            </select>

                            <input
                                type="text"
                                placeholder="رابط الصورة"
                                value={newTopic.image}
                                onChange={(e) => setNewTopic({ ...newTopic, image: e.target.value })}
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? 'جاري الإضافة...' : 'إضافة الموضوع'}
                            </button>
                        </form>

                        <hr />

                        <h2>المواضيع الحالية</h2>
                        <div className="admin-grid">
                            {topics.map(topic => (
                                <div key={topic._id} className="admin-card">
                                    <img src={topic.image || 'https://via.placeholder.com/150'} alt={topic.name} />
                                    <div className="admin-card-info">
                                        <h3>{topic.name}</h3>
                                        <p style={{ color: '#3b82f6', marginBottom: '10px' }}>القسم: {topic.category}</p>
                                        <div className="card-actions">
                                            <button onClick={() => handleEditStart('topic', topic)} className="edit-btn">تعديل</button>
                                            <button onClick={() => handleDeleteTopic(topic._id)} className="delete-btn">حذف</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="admin-section">
                        <h2>قائمة المستخدمين المسجلين</h2>
                        <div className="users-table-wrapper">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>الاسم الكامل</th>
                                        <th>البريد الإلكتروني</th>
                                        <th>تاريخ التسجيل</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id}>
                                            <td>{user.fullName}</td>
                                            <td>{user.email}</td>
                                            <td>{new Date(user.createdAt).toLocaleDateString('ar-TN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
