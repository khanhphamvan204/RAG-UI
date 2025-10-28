import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Shield, Plus, RefreshCw, Trash2, X, AlertCircle, FolderOpen, Settings } from 'lucide-react';
import { API_CONFIG, apiRequest, safeJsonParse, getFullUrl } from './api';

const FolderRolesView = () => {
    const { token } = useAuth();
    const [folderRoles, setFolderRoles] = useState([]);
    const [availableFolders, setAvailableFolders] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); // Lỗi chung (cho danh sách folderRoles)

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Form states
    const [newRole, setNewRole] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [selectedFolders, setSelectedFolders] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [addModalError, setAddModalError] = useState(''); // Lỗi riêng cho Add Modal

    // Delete states
    const [deletingRole, setDeletingRole] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModalError, setDeleteModalError] = useState(''); // Lỗi riêng cho Delete Modal

    // Fetch folder roles
    const fetchFolderRoles = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.FOLDER_ROLES_LIST, {}, true, false, token);
            if (response.ok) {
                const data = await safeJsonParse(response);
                setFolderRoles(Array.isArray(data) ? data : []);
            } else {
                setFolderRoles([]);
                setError('Không thể tải danh sách phân quyền');
            }
        } catch (error) {
            console.error('Error fetching folder roles:', error);
            setFolderRoles([]);
            setError('Lỗi kết nối khi tải phân quyền');
        } finally {
            setLoading(false);
        }
    };

    // Fetch available folders
    const fetchAvailableFolders = async () => {
        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.FOLDERS_LIST, {}, true, false, token);
            if (response.ok) {
                const data = await safeJsonParse(response);
                setAvailableFolders(data.folders || []);
            } else {
                setAvailableFolders([]);
                setError('Không thể tải danh sách thư mục');
            }
        } catch (error) {
            console.error('Error fetching folders:', error);
            setAvailableFolders([]);
            setError('Lỗi kết nối khi tải danh sách thư mục');
        }
    };

    // Fetch available roles from API
    const fetchAvailableRoles = async () => {
        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.ROLES, {}, false, true, null);
            if (response.ok) {
                const data = await safeJsonParse(response);
                setAvailableRoles(Array.isArray(data) ? data : []);
            } else {
                setAvailableRoles([]);
                setError('Không thể tải danh sách vai trò');
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            setAvailableRoles([]);
            setError('Lỗi kết nối khi tải danh sách vai trò');
        }
    };

    // Toggle folder selection
    const toggleFolderSelection = (folderName) => {
        if (selectedFolders.includes(folderName)) {
            setSelectedFolders(selectedFolders.filter(f => f !== folderName));
        } else {
            setSelectedFolders([...selectedFolders, folderName]);
        }
    };

    // Add folder role
    const handleAddFolderRole = async () => {
        if (!newRole.trim()) {
            setAddModalError('Vui lòng chọn vai trò');
            return;
        }
        if (selectedFolders.length === 0) {
            setAddModalError('Vui lòng chọn ít nhất một thư mục');
            return;
        }

        setIsAdding(true);
        setAddModalError('');
        try {
            const response = await apiRequest(
                API_CONFIG.ENDPOINTS.FOLDER_ROLES_ASSIGN,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        role: newRole.trim(),
                        folder_use: selectedFolders,
                        description: newDescription.trim() || null,
                    }),
                },
                true,
                false,
                token
            );

            if (response.ok) {
                setIsAddModalOpen(false);
                resetAddForm();
                fetchFolderRoles();
            } else {
                const errorData = await safeJsonParse(response).catch(() => null);
                let errorMessage = 'Không thể tạo phân quyền';
                if (errorData && errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData && errorData.message) {
                    errorMessage = errorData.message;
                }
                setAddModalError(errorMessage);
            }
        } catch (error) {
            console.error('Error adding folder role:', error);
            setAddModalError('Lỗi khi tạo phân quyền: ' + error.message);
        } finally {
            setIsAdding(false);
        }
    };

    // Delete folder role
    const handleDeleteFolderRole = async () => {
        if (!deletingRole) return;

        setIsDeleting(true);
        setDeleteModalError('');
        try {
            const encodedRole = encodeURIComponent(deletingRole);
            const response = await apiRequest(
                `${API_CONFIG.ENDPOINTS.FOLDER_ROLES_DELETE}/${encodedRole}`,
                { method: 'DELETE' },
                true,
                false,
                token
            );

            if (response.ok) {
                setIsDeleteModalOpen(false);
                setDeletingRole('');
                fetchFolderRoles();
            } else {
                const errorData = await safeJsonParse(response).catch(() => null);
                let errorMessage = 'Không thể xóa phân quyền';
                if (errorData && errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData && errorData.message) {
                    errorMessage = errorData.message;
                }
                setDeleteModalError(errorMessage);
            }
        } catch (error) {
            console.error('Error deleting folder role:', error);
            setDeleteModalError('Lỗi khi xóa phân quyền: ' + error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    // Reset add form
    const resetAddForm = () => {
        setNewRole('');
        setNewDescription('');
        setSelectedFolders([]);
        setAddModalError('');
    };

    // Open delete modal
    const openDeleteModal = (role) => {
        setDeletingRole(role);
        setIsDeleteModalOpen(true);
        setDeleteModalError('');
    };

    useEffect(() => {
        fetchFolderRoles();
        fetchAvailableFolders();
        fetchAvailableRoles();
    }, []);

    return (
        <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Phân quyền Thư mục</h2>
                        <p className="text-purple-100 text-xs sm:text-sm">Quản lý quyền truy cập thư mục theo vai trò người dùng</p>
                    </div>
                    <button
                        onClick={() => {
                            resetAddForm();
                            setIsAddModalOpen(true);
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-semibold text-sm sm:text-base">Thêm phân quyền</span>
                    </button>
                </div>
            </div>

            {/* Error Alert for general errors (not modal-related) */}
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
                    onClick={fetchFolderRoles}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-md border border-gray-200"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Làm mới</span>
                </button>
            </div>

            {/* Folder Roles List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="flex items-center gap-3">
                            <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
                            <span className="text-lg font-medium text-gray-600">Đang tải phân quyền...</span>
                        </div>
                    </div>
                ) : folderRoles.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-md">
                        <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-500 mb-2">Chưa có phân quyền nào</p>
                        <p className="text-sm text-gray-400">Tạo phân quyền đầu tiên để quản lý truy cập thư mục</p>
                    </div>
                ) : (
                    folderRoles.map((roleData, index) => (
                        <div
                            key={roleData.role || index}
                            className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                                        <Shield className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                                            {roleData.role}
                                        </h3>
                                        {roleData.description && (
                                            <p className="text-gray-600 text-sm mb-3">
                                                {roleData.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mb-2">
                                            <FolderOpen className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-500 font-medium">
                                                Quyền truy cập thư mục:
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {roleData.folder_use && roleData.folder_use.length > 0 ? (
                                                roleData.folder_use.map((folder) => (
                                                    <span
                                                        key={folder}
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                                                    >
                                                        {folder}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">
                                                    Không có thư mục nào
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => openDeleteModal(roleData.role)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                    title="Xóa phân quyền"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 p-4">
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-2xl shadow-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto border border-gray-200">
                        <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6 border-b border-gray-200 pb-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Tạo phân quyền mới</h3>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">Phân quyền truy cập thư mục cho vai trò người dùng</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setAddModalError('');
                                }}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors flex-shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 sm:space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tên vai trò <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                                >
                                    <option value="">Chọn vai trò</option>
                                    {availableRoles.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Mô tả về vai trò và quyền hạn..."
                                    rows={3}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Thư mục được phép truy cập <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {availableFolders.map((folder) => (
                                        <div
                                            key={folder}
                                            onClick={() => toggleFolderSelection(folder)}
                                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedFolders.includes(folder)
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedFolders.includes(folder)
                                                            ? 'bg-purple-500'
                                                            : 'bg-gray-400'
                                                            }`}
                                                    >
                                                        <FolderOpen className="h-4 w-4 text-white" />
                                                    </div>
                                                    <span className="font-medium text-gray-900">
                                                        {folder}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`w-5 h-5 border-2 rounded flex items-center justify-center ${selectedFolders.includes(folder)
                                                        ? 'border-purple-500 bg-purple-500'
                                                        : 'border-gray-300'
                                                        }`}
                                                >
                                                    {selectedFolders.includes(folder) && (
                                                        <svg
                                                            className="w-3 h-3 text-white"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {availableFolders.length === 0 && (
                                    <p className="text-sm text-gray-500 italic">Không có thư mục nào khả dụng</p>
                                )}
                            </div>

                            {addModalError && (
                                <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-start gap-3 mt-4">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-red-800 font-medium">Lỗi</p>
                                        <p className="text-red-600 text-sm mt-1">{addModalError}</p>
                                    </div>
                                    <button
                                        onClick={() => setAddModalError('')}
                                        className="text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                                <button
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setAddModalError('');
                                    }}
                                    className="flex-1 py-2 sm:py-3 px-4 sm:px-6 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-sm sm:text-base"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleAddFolderRole}
                                    disabled={isAdding || !newRole.trim() || selectedFolders.length === 0}
                                    className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 text-white rounded-xl transition-all duration-200 font-medium text-sm sm:text-base ${isAdding || !newRole.trim() || selectedFolders.length === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-xl'
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
                                            Tạo phân quyền
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && deletingRole && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 p-4">
                    <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100 text-center border border-gray-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa phân quyền</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa phân quyền cho vai trò{' '}
                            <span className="font-semibold">"{deletingRole}"</span>? Hành động này không thể hoàn tác.
                        </p>

                        {deleteModalError && (
                            <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-start gap-3 mb-6">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-red-800 font-medium">Lỗi</p>
                                    <p className="text-red-600 text-sm mt-1">{deleteModalError}</p>
                                </div>
                                <button
                                    onClick={() => setDeleteModalError('')}
                                    className="text-red-400 hover:text-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeleteModalError('');
                                }}
                                className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeleteFolderRole}
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
                                        Xóa phân quyền
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

export default FolderRolesView;