import React from 'react';
import { X, Upload, User, CheckCircle, RefreshCw } from 'lucide-react';
import UserSelector from './UserSelector';
import DepartmentSelector from './DepartmentSelector';

const UploadModal = ({
    isOpen,
    setIsOpen,
    selectedFile,
    handleFileChange,
    newDocType,
    setNewDocType,
    selectedUsers,
    setSelectedUsers,
    selectedDepartments,
    setSelectedDepartments,
    uploadedBy,
    users,
    fetchUsers,
    usersPagination,
    isLoadingUsers,
    departments,
    fetchDepartments,
    departmentsPagination,
    isLoadingDepartments,
    fileTypes,
    isUploading,
    handleUpload,
    error,
    setError,
    resetUploadForm,
    user,
}) => {
    if (!isOpen) return null;

    // Check if the error is about file already existing
    const isFileExistsError = error.includes('File already exists at path');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl shadow-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto m-4 border border-gray-200">
                <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Thêm tài liệu mới</h3>
                        <p className="text-sm text-gray-500 mt-1">Tải lên và chia sẻ tài liệu của bạn</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Chọn tệp <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.txt,.docx,.csv,.xlsx,.xls"
                                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {selectedFile && (
                                    <div className="mt-2 flex items-center text-sm text-green-600">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {selectedFile.name}
                                    </div>
                                )}
                            </div>
                            {!selectedFile && error && !isFileExistsError && (
                                <p className="text-red-500 text-xs mt-1">Vui lòng chọn tệp</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Loại tài liệu <span className="text-red-500">*</span></label>
                            <select
                                value={newDocType}
                                onChange={(e) => {
                                    setNewDocType(e.target.value);
                                    setError('');
                                }}
                                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${!newDocType && error && !isFileExistsError ? 'border-red-500' : ''}`}
                            >
                                <option value="">Chọn loại tài liệu</option>
                                {fileTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                            {!newDocType && error && !isFileExistsError && (
                                <p className="text-red-500 text-xs mt-1">Vui lòng chọn loại tài liệu</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center mb-3">
                            <User className="w-5 h-5 text-gray-500 mr-2" />
                            <span className="text-sm font-semibold text-gray-700">Thông tin người tải</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                    {user?.full_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{user?.full_name || 'Người dùng'}</p>
                                <p className="text-sm text-gray-500">@{user?.username || uploadedBy}</p>
                            </div>
                        </div>
                    </div>

                    <UserSelector
                        selectedUsers={selectedUsers}
                        setSelectedUsers={setSelectedUsers}
                        label="Người dùng có quyền truy cập"
                        users={users}
                        fetchUsers={fetchUsers}
                        usersPagination={usersPagination}
                        isLoading={isLoadingUsers}
                    />

                    <DepartmentSelector
                        selectedDepartments={selectedDepartments}
                        setSelectedDepartments={setSelectedDepartments}
                        label="Phòng ban có quyền truy cập"
                        departments={departments}
                        fetchDepartments={fetchDepartments}
                        departmentsPagination={departmentsPagination}
                        isLoading={isLoadingDepartments}
                    />

                    {isFileExistsError && (
                        <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg border border-red-200">
                            Tệp đã tồn tại trong thư mục
                        </div>
                    )}

                    <div className="flex gap-4 pt-6">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex-1 py-3 px-6 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={isUploading || !selectedFile || !newDocType}
                            className={`flex-1 py-3 px-6 text-white rounded-xl transition-all duration-200 font-medium ${isUploading || !selectedFile || !newDocType
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {isUploading ? (
                                <span className="flex items-center justify-center">
                                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                                    Đang tải lên...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <Upload className="h-5 w-5 mr-2" />
                                    Tải lên
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;