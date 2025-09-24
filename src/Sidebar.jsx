import React from 'react';
import { FileText, MessageSquare, Folder, Shield, LogOut } from 'lucide-react';
import { useAuth } from './AuthContext';

const Sidebar = ({ activeView, setActiveView }) => {
    const { logout } = useAuth();

    const menuItems = [
        {
            id: 'documents',
            label: 'Tài liệu',
            icon: FileText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            hoverColor: 'hover:bg-blue-100'
        },
        {
            id: 'folders',
            label: 'Thư mục',
            icon: Folder,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            hoverColor: 'hover:bg-green-100'
        },
        {
            id: 'folder-roles',
            label: 'Phân quyền',
            icon: Shield,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            hoverColor: 'hover:bg-purple-100'
        },
        {
            id: 'chat',
            label: 'Trò chuyện',
            icon: MessageSquare,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            hoverColor: 'hover:bg-indigo-100'
        }
    ];

    return (
        <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
            {/* Logo/Brand */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Document AI</h1>
                        <p className="text-xs text-gray-500">Quản lý thông minh</p>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${isActive
                                    ? `${item.bgColor} ${item.color} shadow-sm font-semibold`
                                    : `text-gray-600 hover:text-gray-900 ${item.hoverColor}`
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-400 group-hover:text-gray-600'}`} />
                            <span className={`font-medium ${isActive ? 'text-current' : ''}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className={`ml-auto w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')}`} />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;