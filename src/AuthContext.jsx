import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_CONFIG, apiRequest, safeJsonParse, TokenManager } from './api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(TokenManager.get());
    const [loading, setLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                const userData = localStorage.getItem('user_data');
                if (userData) {
                    try {
                        setUser(JSON.parse(userData));
                        setIsReady(true);
                    } catch (error) {
                        console.error('Error parsing user data:', error);
                        logout();
                    }
                } else {
                    logout();
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, [token]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (token && TokenManager.isExpiringSoon()) {
                refreshToken();
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [token]);

    const refreshToken = async () => {
        try {
            const refreshTokenStored = localStorage.getItem('refresh_token');
            if (!refreshTokenStored) {
                logout();
                setError('Không tìm thấy refresh token');
                return false;
            }

            const response = await apiRequest(API_CONFIG.ENDPOINTS.REFRESH, {
                method: 'POST',
                body: JSON.stringify({ refresh_token: refreshTokenStored }),
            }, true, false);

            if (response.ok) {
                const data = await safeJsonParse(response);
                TokenManager.set(data.access_token, data.expires_in);
                setToken(data.access_token);
                setError(null);
                return true;
            } else {
                logout();
                setError('Không thể làm mới token');
                return false;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            logout();
            setError('Lỗi khi làm mới token: ' + error.message);
            return false;
        }
    };

    const login = async (username, password) => {
        try {
            setLoading(true); // Bắt đầu loading
            const response = await apiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            }, false, true);

            if (response.ok) {
                const data = await safeJsonParse(response);

                // Kiểm tra user_type
                if (data.user.user_type !== 'Cán bộ quản lý') {
                    const errorMessage = 'Chỉ được đăng nhập bằng tài khoản của Cán bộ quản lý.';
                    setError(errorMessage);
                    setLoading(false); // Tắt loading
                    return { success: false, error: errorMessage };
                }

                // Đồng bộ hóa token và user nếu không phải Cán bộ quản lý
                await new Promise((resolve) => {
                    TokenManager.set(data.access_token, data.expires_in || 3600);
                    localStorage.setItem('refresh_token', data.refresh_token);
                    localStorage.setItem('user_data', JSON.stringify(data.user));
                    setToken(data.access_token);
                    setUser(data.user);
                    setIsReady(true);
                    setError(null);
                    resolve();
                });
                return { success: true, data };
            } else {
                const errorText = await response.text();
                let errorMessage;
                if (response.status === 400) {
                    errorMessage = 'Tên người dùng hoặc mật khẩu không đúng';
                } else if (response.status === 401) {
                    errorMessage = 'Không được phép đăng nhập. Vui lòng kiểm tra thông tin đăng nhập.';
                } else {
                    errorMessage = `Đăng nhập thất bại: ${response.status} - ${errorText}`;
                }
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            const errorMessage =
                error.name === 'TypeError' && error.message.includes('Failed to fetch')
                    ? 'Lỗi CORS hoặc kết nối mạng. Vui lòng kiểm tra server.'
                    : 'Lỗi kết nối mạng';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false); // Kết thúc loading
        }
    };

    const logout = () => {
        TokenManager.clear();
        setToken(null);
        setUser(null);
        setIsReady(false);
        setError(null);
    };

    const value = { user, token, login, logout, isAuthenticated: !!token && !!user, loading, isReady, error, refreshToken };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};