import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Folder, Plus, RefreshCw, Trash2, X, AlertCircle, CheckCircle, FolderOpen } from 'lucide-react';
import { API_CONFIG, apiRequest, safeJsonParse } from './api';

const FoldersView = () => {
    const { token } = useAuth();
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Form states
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderDescription, setNewFolderDescription] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Delete states
    const [deletingFolder, setDeletingFolder] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch folders
    const fetchFolders = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.FOLDERS_LIST, {}, false, true, null);
            if (response.ok) {
                const data = await safeJsonParse(response);
                if (data.folders) {
                    setFolders(data.folders);
                } else {
                    setFolders([]);
                    setError('Dữ liệu thư mục không hợp lệ');
                }
            } else {
                setFolders([]);
                setError('Không thể tải danh sách thư mục');
            }
        } catch (error) {
            console.error('Error fetching folders:', error);
            setFolders([]);
            setError('Lỗi kết nối khi tải thư mục: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Add folder
    const handleAddFolder = async () => {
        if (!newFolderName.trim()) {
            setError('Vui lòng nhập tên thư mục');
            return;
        }

        setIsAdding(true);
        setError('');
        try {
            const response = await apiRequest(
                API_CONFIG.ENDPOINTS.FOLDERS_ADD,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        folder_name: newFolderName.trim(),
                        description: newFolderDescription.trim() || null,
                    }),
                },
                true,
                true,
                token
            );

            if (response.ok) {
                setIsAddModalOpen(false);
                resetAddForm();
                fetchFolders();
                setError('');
            } else {
                const errorData = await response.json().catch(() => null);
                setError(errorData?.detail || errorData?.message || 'Không thể tạo thư mục');
            }
        } catch (error) {
            console.error('Error adding folder:', error);
            setError('Lỗi khi tạo thư mục: ' + error.message);
        } finally {
            setIsAdding(false);
        }
    };

    // Delete folder
    const handleDeleteFolder = async () => {
        if (!deletingFolder) return;

        setIsDeleting(true);
        try {
            const response = await apiRequest(
                `${API_CONFIG.ENDPOINTS.FOLDERS_DELETE}/${deletingFolder}`,
                { method: 'DELETE' },
                true,
                true,
                token
            );

            if (response.ok) {
                setIsDeleteModalOpen(false);
                setDeletingFolder('');
                fetchFolders();
                setError('');
            } else {
                const errorData = await response.json().catch(() => null);
                setError(errorData?.detail || errorData?.message || 'Không thể xóa thư mục');
            }
        } catch (error) {
            console.error('Error deleting folder:', error);
            setError('Lỗi khi xóa thư mục: ' + error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    // Reset add form
    const resetAddForm = () => {
        setNewFolderName('');
        setNewFolderDescription('');
    };

    // Open delete modal
    const openDeleteModal = (folderName) => {
        setDeletingFolder(folderName);
        setIsDeleteModalOpen(true);
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    return (
        <div className="flex-1 p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Quản lý Thư mục</h2>
                        <p className="text-green-100 text-sm">Tạo và quản lý các thư mục tài liệu</p>
                    </div>
                    <button
                        onClick={() => {
                            resetAddForm();
                            setIsAddModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-xl hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-semibold">Tạo thư mục</span>
                    </button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-start gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-red-800 font-medium">Có lỗi xảy ra</p>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                    <button
                        onClick={() => setError('')}
                        className="text-red-400 hover:text-red-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Refresh Button */}
            <div className="flex justify-end">
                <button
                    onClick={fetchFolders}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-md border border-gray-200"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Làm mới</span>
                </button>
            </div>

            {/* Folders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full flex items-center justify-center py-16">
                        <div className="flex items-center gap-3">
                            <RefreshCw className="h-8 w-8 animate-spin text-green-500" />
                            <span className="text-lg font-medium text-gray-600">Đang tải thư mục...</span>
                        </div>
                    </div>
                ) : folders.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                        <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-500 mb-2">Chưa có thư mục nào</p>
                        <p className="text-sm text-gray-400">Tạo thư mục đầu tiên để bắt đầu</p>
                    </div>
                ) : (
                    folders.map((folderName, index) => (
                        <div
                            key={folderName}
                            className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <Folder className="h-6 w-6 text-white" />
                                </div>
                                <button
                                    onClick={() => openDeleteModal(folderName)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                    title="Xóa thư mục"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <h3 className="font-semibold text-gray-900 text-lg mb-2 truncate">{folderName}</h3>
                            <p className="text-sm text-gray-500 mb-4">Thư mục tài liệu</p>
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Hoạt động
                                </span>
                                <span className="text-xs text-gray-400">#{index + 1}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100 border border-gray-200">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Tạo thư mục mới</h3>
                                <p className="text-sm text-gray-500 mt-1">Tạo thư mục để tổ chức tài liệu</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tên thư mục <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="Nhập tên thư mục..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
                                <textarea
                                    value={newFolderDescription}
                                    onChange={(e) => setNewFolderDescription(e.target.value)}
                                    placeholder="Nhập mô tả thư mục (tùy chọn)..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3 px-6 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleAddFolder}
                                    disabled={isAdding || !newFolderName.trim()}
                                    className={`flex-1 py-3 px-6 text-white rounded-xl transition-all duration-200 font-medium ${isAdding || !newFolderName.trim()
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    {isAdding ? (
                                        <span className="flex items-center justify-center">
                                            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                                            Đang tạo...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center">
                                            <Plus className="h-5 w-5 mr-2" />
                                            Tạo thư mục
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && deletingFolder && (
                <div className="fixed inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100 text-center border border-gray-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa thư mục</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa thư mục <span className="font-semibold">"{deletingFolder}"</span>? Hành động này
                            không thể hoàn tác.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeleteFolder}
                                disabled={isDeleting}
                                className={`flex-1 px-6 py-3 text-white rounded-xl transition-all duration-200 font-medium ${isDeleting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                {isDeleting ? (
                                    <span className="flex items-center justify-center">
                                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                                        Đang xóa...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center">
                                        <Trash2 className="h-5 w-5 mr-2" />
                                        Xóa thư mục
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoldersView;