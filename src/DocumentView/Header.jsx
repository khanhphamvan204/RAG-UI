import React from 'react';
import { Plus } from 'lucide-react';

const Header = ({ setIsModalOpen, resetUploadForm }) => {
    return (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Quản lý Tài liệu</h2>
                    <p className="text-blue-100 text-xs sm:text-sm">Quản lý và chia sẻ tài liệu một cách dễ dàng</p>
                </div>
                <button
                    onClick={() => {
                        resetUploadForm();
                        setIsModalOpen(true);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold text-sm sm:text-base">Thêm tài liệu</span>
                </button>
            </div>
        </div>
    );
};

export default Header;