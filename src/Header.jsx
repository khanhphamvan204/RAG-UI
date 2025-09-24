import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { LogOut, User } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-sm text-gray-600">Quản lý và tìm kiếm tài liệu thông minh</p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-medium text-gray-900">{user?.full_name}</div>
                            <div className="text-xs text-gray-500">{user?.user_type}</div>
                        </div>
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <div className="text-sm font-medium text-gray-900">{user?.full_name}</div>
                                <div className="text-xs text-gray-500">{user?.email}</div>
                                <div className="text-xs text-gray-500">{user?.department_info?.department_name}</div>
                            </div>
                            <button
                                onClick={() => { logout(); setShowUserMenu(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;