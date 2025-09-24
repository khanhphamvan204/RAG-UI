import React from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import UserSelector from './UserSelector';
import DepartmentSelector from './DepartmentSelector';

const EditModal = ({
    isOpen,
    setIsOpen,
    editingDocument,
    editFilename,
    setEditFilename,
    editFileType,
    setEditFileType,
    editSelectedUsers,
    setEditSelectedUsers,
    editSelectedDepartments,
    setEditSelectedDepartments,
    users,
    fetchUsers,
    usersPagination,
    isLoadingUsers,
    departments,
    fetchDepartments,
    departmentsPagination,
    isLoadingDepartments,
    fileTypes,
    isUpdating,
    handleUpdate,
    error,
    setError,
    isLoadingDetails,
}) => {
    if (!isOpen || !editingDocument) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl shadow-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto m-4 border border-gray-200">
                <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Chỉnh sửa tài liệu</h3>
                        <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin tài liệu</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {isLoadingDetails ? (
                    <div className="flex justify-center items-center py-10">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                        <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Tên tệp <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={editFilename}
                                    onChange={(e) => setEditFilename(e.target.value)}
                                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${!editFilename && error ? 'border-red-500' : ''}`}
                                />
                                {!editFilename && error && (
                                    <p className="text-red-500 text-xs mt-1">Vui lòng nhập tên tệp</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Loại tài liệu <span className="text-red-500">*</span></label>
                                <select
                                    value={editFileType}
                                    onChange={(e) => {
                                        setEditFileType(e.target.value);
                                        setError('');
                                    }}
                                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${!editFileType && error ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Chọn loại tài liệu</option>
                                    {fileTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                {!editFileType && error && (
                                    <p className="text-red-500 text-xs mt-1">Vui lòng chọn loại tài liệu</p>
                                )}
                            </div>
                        </div>

                        <UserSelector
                            selectedUsers={editSelectedUsers}
                            setSelectedUsers={setEditSelectedUsers}
                            label="Người dùng có quyền truy cập"
                            users={users}
                            fetchUsers={fetchUsers}
                            usersPagination={usersPagination}
                            isLoading={isLoadingUsers}
                        />

                        <DepartmentSelector
                            selectedDepartments={editSelectedDepartments}
                            setSelectedDepartments={setEditSelectedDepartments}
                            label="Phòng ban có quyền truy cập"
                            departments={departments}
                            fetchDepartments={fetchDepartments}
                            departmentsPagination={departmentsPagination}
                            isLoading={isLoadingDepartments}
                        />

                        <div className="flex gap-4 pt-6">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 py-3 px-6 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={isUpdating || !editFilename || !editFileType || isLoadingDetails}
                                className={`flex-1 py-3 px-6 text-white rounded-xl transition-all duration-200 font-medium ${isUpdating || !editFilename || !editFileType || isLoadingDetails
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                {isUpdating ? (
                                    <span className="flex items-center justify-center">
                                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                                        Đang cập nhật...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center">
                                        <Save className="h-5 w-5 mr-2" />
                                        Lưu
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditModal;