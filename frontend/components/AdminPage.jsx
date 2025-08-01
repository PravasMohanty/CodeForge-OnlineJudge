import React, { useState, useEffect } from 'react';
import { Plus, Settings, Users, BarChart3, FileText, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userCount, setUserCount] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);

    const sidebarItems = [
        { icon: BarChart3, label: 'Dashboard', active: false },
        { icon: FileText, label: 'Questions', active: true },
        { icon: Users, label: 'Users', active: false },
        { icon: Settings, label: 'Settings', active: false },
    ];

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://44.198.131.81:5000';
                const response = await fetch(`${API_BASE_URL}/practice`);
                const data = await response.json();
                setQuestions(data || []);
            } catch (error) {
                setQuestions([]);
            }
            setLoading(false);
        };
        fetchQuestions();

        const fetchUserCount = async () => {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://44.198.131.81:5000';
                const response = await fetch(`${API_BASE_URL}/user/count`);
                const data = await response.json();
                setUserCount(data.count);
            } catch (error) {
                setUserCount(null);
            }
        };
        fetchUserCount();
    }, []);

    const easyCount = questions.filter(q => q.difficulty === 'Easy').length;
    const hardCount = questions.filter(q => q.difficulty === 'Hard').length;

    // Get the 4 most recent questions (assuming createdAt exists, else fallback to last 4)
    let recentQuestions = [];
    if (!loading && questions.length > 0) {
        if (questions[0].createdAt) {
            recentQuestions = [...questions]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 4);
        } else {
            recentQuestions = questions.slice(-4).reverse();
        }
    }

    const handleQuestionClick = (question) => {
        setQuestionToDelete(question);
        setShowDeleteModal(true);
    };

    const handleDeleteQuestion = async (questionId) => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://44.198.131.81:5000';
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/practice/admin/delete/${questionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                alert("Server error: " + text);
                setShowDeleteModal(false);
                setQuestionToDelete(null);
                return;
            }
            if (data.success) {
                setQuestions(prev => prev.filter(q => q._id !== questionId));
            } else {
                alert(data.message || "Failed to delete question.");
            }
        } catch (error) {
            alert("Error deleting question: " + error.message);
        }
        setShowDeleteModal(false);
        setQuestionToDelete(null);
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setQuestionToDelete(null);
    };

    return (
        <div className="h-screen bg-gradient-to-br from-gray-900 to-black flex pt-16 overflow-hidden">

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 border-r border-gray-700 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                        Admin Panel
                    </h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-gray-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="mt-8 px-4">
                    <div className="space-y-2">
                        {sidebarItems.map((item, index) => (
                            <a
                                key={index}
                                href="#"
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${item.active
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </a>
                        ))}
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:ml-0">
                {/* Header */}
                <header className="bg-gray-900 border-b border-gray-700 h-16 flex items-center justify-between px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-gray-400 hover:text-gray-200"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-100">Question Management</h2>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Questions</p>
                                        <p className="text-2xl font-bold text-gray-100">
                                            {loading ? '...' : questions.length}
                                        </p>
                                    </div>
                                    <FileText className="w-8 h-8 text-emerald-400" />
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Active Users</p>
                                        <p className="text-2xl font-bold text-gray-100">{userCount === null ? '...' : userCount}</p>
                                    </div>
                                    <Users className="w-8 h-8 text-emerald-400" />
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Easy Questions</p>
                                        <p className="text-2xl font-bold text-gray-100">{loading ? '...' : easyCount}</p>
                                    </div>
                                    <BarChart3 className="w-8 h-8 text-emerald-400" />
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Hard Questions</p>
                                        <p className="text-2xl font-bold text-gray-100">{loading ? '...' : hardCount}</p>
                                    </div>
                                    <Settings className="w-8 h-8 text-emerald-400" />
                                </div>
                            </div>
                        </div>

                        {/* Add Question Card - 30% width */}
                        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                            <div className="lg:col-span-3">
                                <Link to="/admin/create-new-question" className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-emerald-400 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/10 cursor-pointer group h-full min-h-[400px] flex flex-col items-center justify-center text-inherit no-underline">
                                    <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <Plus className="w-10 h-10 text-white" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-100 mb-4 group-hover:text-emerald-400 transition-colors duration-200">
                                        Add New Question
                                    </h3>

                                    <p className="text-gray-400 text-center mb-6 leading-relaxed">
                                        Create a new coding problem with test cases, difficulty level, and tags to challenge your users.
                                    </p>

                                    <div className="flex flex-col gap-3 text-sm text-gray-500 w-full">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                            <span>Add problem statement</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                            <span>Configure test cases</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                            <span>Set difficulty & tags</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 w-full">

                                    </div>
                                </Link>
                            </div>

                            {/* Additional content area - 70% width */}
                            <div className="lg:col-span-7">
                                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 h-full min-h-[400px]">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-gray-100">Recent Questions</h3>

                                    </div>

                                    <div className="space-y-4 max-h-70 overflow-y-auto pr-2">
                                        {loading ? (
                                            <div className="text-gray-400">Loading...</div>
                                        ) : recentQuestions.length === 0 ? (
                                            <div className="text-gray-400">No questions found.</div>
                                        ) : (
                                            recentQuestions.map((item, index) => (
                                                <div key={item._id || index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors duration-200 cursor-pointer" onClick={() => handleQuestionClick(item)}>
                                                    <div>
                                                        <h4 className="text-gray-100 font-medium">{item.titletag || item.question}</h4>

                                                        <p className="text-gray-400 text-xs mb-1">
                                                            {(item.tags || []).join(' ')}
                                                        </p>
                                                        <p className="text-gray-400 text-xs">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.difficulty === 'Easy' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-600' :
                                                        item.difficulty === 'Medium' ? 'bg-orange-900/30 text-orange-400 border border-orange-600' :
                                                            'bg-red-900/30 text-red-400 border border-red-600'
                                                        }`}>
                                                        {item.difficulty}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Delete Question Modal */}
            {showDeleteModal && questionToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
                    <div className="bg-gray-800 rounded-lg p-8 shadow-lg flex flex-col items-center">
                        <h2 className="text-xl font-bold text-white mb-4">Delete Question</h2>
                        <p className="text-gray-200 mb-6">Are you sure you want to delete the question:<br /><span className="font-semibold text-emerald-400">{questionToDelete.titletag || questionToDelete.question}</span>?</p>
                        <div className="flex gap-4">
                            <button
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold"
                                onClick={() => handleDeleteQuestion(questionToDelete._id)}
                            >
                                Delete
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold"
                                onClick={handleCancelDelete}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;