
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Shield, RefreshCw, AlertCircle } from 'lucide-react';

const LoginForm = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    // Tự động xóa lỗi sau 5 giây
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 5000); // Xóa lỗi sau 5 giây
            return () => clearTimeout(timer); // Dọn dẹp timer
        }
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await login(credentials.username, credentials.password);
        if (!result.success) {
            setError(result.error); // Hiển thị lỗi, bao gồm "Đăng nhập không được phép cho Cán bộ quản lý"
        } else {
            setError(''); // Xóa lỗi khi đăng nhập thành công
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                            RAG System
                        </h1>
                        <p className="text-gray-600">Quản lý tài liệu thông minh</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
                                <input
                                    type="text"
                                    value={credentials.username}
                                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                                    placeholder="Nhập tên đăng nhập"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                                <input
                                    type="password"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                                    placeholder="Nhập mật khẩu"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !credentials.username || !credentials.password}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                    Đang đăng nhập...
                                </div>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;