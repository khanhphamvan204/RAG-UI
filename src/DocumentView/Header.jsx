import React from 'react';
import { Plus } from 'lucide-react';

const Header = ({ setIsModalOpen, resetUploadForm }) => {
    return (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Quản lý Tài liệu</h2>
                    <p className="text-blue-100 text-sm">Quản lý và chia sẻ tài liệu một cách dễ dàng</p>
                </div>
                <button
                    onClick={() => {
                        resetUploadForm();
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-semibold">Thêm tài liệu</span>
                </button>
            </div>
        </div>
    );
};

export default Header;