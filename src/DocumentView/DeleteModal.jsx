import React from 'react';
import { X, Trash2, RefreshCw } from 'lucide-react';

const DeleteModal = ({ isOpen, setIsOpen, deletingDocument, isDeleting, handleDelete }) => {
    if (!isOpen || !deletingDocument) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100 m-4 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Xóa tài liệu</h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="mb-6">
                    <p className="text-gray-600">Bạn có chắc chắn muốn xóa tài liệu <span className="font-semibold">{deletingDocument.filename}</span>?</p>
                    <p className="text-sm text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex-1 py-3 px-6 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => handleDelete(deletingDocument._id)}
                        disabled={isDeleting}
                        className={`flex-1 py-3 px-6 text-white rounded-xl transition-all duration-200 font-medium ${isDeleting
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
                                Xóa
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;