
import React from 'react';
import { FileText, X, RefreshCw, AlertCircle, Users, Building, Calendar } from 'lucide-react';

const DetailsModal = ({ isOpen, setIsOpen, documentDetails, isLoadingDetails, error }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl shadow-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto m-4 border border-gray-200">
                <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-blue-500" />
                            Chi tiết tài liệu
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Thông tin chi tiết về tài liệu</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {isLoadingDetails ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mr-3" />
                        <span className="text-gray-500 font-medium">Đang tải chi tiết...</span>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                ) : documentDetails ? (
                    <div className="space-y-6">
                        {/* Document Info */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Thông tin tài liệu</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    <p className="text-sm"><span className="font-medium">Tên:</span> {documentDetails.document.filename || 'Không xác định'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    <p className="text-sm"><span className="font-medium">Loại:</span> {documentDetails.document.file_type || 'Không xác định'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    <p className="text-sm"><span className="font-medium">Người tải lên:</span> {documentDetails.document.uploaded_by || 'Không xác định'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-500" />
                                    <p className="text-sm"><span className="font-medium">Ngày tạo:</span> {documentDetails.document.createdAt ? new Date(documentDetails.document.createdAt).toLocaleDateString('vi-VN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'Không xác định'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Users with Access */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" />
                                Người dùng có quyền truy cập
                            </h4>
                            {documentDetails.users.length === 0 ? (
                                <p className="text-sm text-gray-500">Không có người dùng nào được cấp quyền</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto custom-scrollbar">
                                    {documentDetails.users.map(user => (
                                        <div key={user.user_id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200">
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                {String(user.full_name || user.username || user.user_id || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{user.full_name || user.username || user.user_id || 'Không xác định'}</p>
                                                <p className="text-xs text-gray-500">
                                                    {user.student_info?.student_code || user.teacher_info?.teacher_code || user.username || user.user_id || 'Không xác định'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Departments with Access */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Building className="w-5 h-5 text-blue-500" />
                                Phòng ban có quyền truy cập
                            </h4>
                            {documentDetails.departments.length === 0 ? (
                                <p className="text-sm text-gray-500">Không có phòng ban nào được cấp quyền</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto custom-scrollbar">
                                    {documentDetails.departments.map(dept => (
                                        <div key={dept.department_id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200">
                                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                {String(dept.department_name || dept.name || dept.department_id || 'D').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{dept.department_name || dept.name || dept.department_id || 'Không xác định'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">Không có thông tin chi tiết để hiển thị</p>
                )}
            </div>
        </div>
    );
};

export default DetailsModal;
