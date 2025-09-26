import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Shield, RefreshCw, AlertCircle, Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, error: authError, clearError } = useAuth();

    const displayError = localError || authError;

    // Auto-clear errors after 8 seconds
    useEffect(() => {
        if (displayError) {
            const timer = setTimeout(() => {
                setLocalError('');
                clearError();
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [displayError, clearError]);

    // Debug: Log errors
    useEffect(() => {
        if (displayError) {
            console.log('Error to display:', displayError);
        }
    }, [displayError]);

    // Handle escape key to clear errors
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setLocalError('');
                clearError();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [clearError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        clearError();
        setIsLoading(true);

        try {
            console.log('Attempting login with:', { username: credentials.username, password: '***' });
            const result = await login(credentials.username, credentials.password);
            console.log('Login result:', result);

            if (!result.success) {
                setLocalError(result.error);
                console.error('Login failed:', result.error);
                if (result.errorData) {
                    console.log('Error details:', result.errorData);
                }
            } else {
                setLocalError('');
                console.log('Login successful');
            }
        } catch (error) {
            console.error('Login exception:', error);
            setLocalError('Đã xảy ra lỗi không mong đợi: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setCredentials((prev) => ({ ...prev, [field]: value }));
        if (displayError) {
            setLocalError('');
            clearError();
        }
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên đăng nhập
                                </label>
                                <input
                                    type="text"
                                    value={credentials.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                                    placeholder="Nhập tên đăng nhập"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={credentials.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                                        placeholder="Nhập mật khẩu"
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {displayError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 animate-pulse">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-red-700 text-sm font-medium">Đăng nhập thất bại</p>
                                    <p className="text-red-600 text-sm mt-1">{displayError}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLocalError('');
                                        clearError();
                                    }}
                                    className="text-red-400 hover:text-red-600 transition-colors"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !credentials.username.trim() || !credentials.password.trim()}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
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