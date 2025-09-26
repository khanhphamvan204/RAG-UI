import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { API_CONFIG, apiRequest, safeJsonParse, TokenManager } from './api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => TokenManager.get());
    const [loading, setLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);

    const isMountedRef = useRef(true);
    const refreshIntervalRef = useRef(null);
    const isRefreshingRef = useRef(false);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, []);

    const refreshToken = useCallback(async () => {
        if (isRefreshingRef.current || !isMountedRef.current) {
            return false;
        }

        isRefreshingRef.current = true;

        try {
            const refreshTokenStored = localStorage.getItem('refresh_token');
            if (!refreshTokenStored) {
                if (isMountedRef.current) {
                    logout();
                    setError('Không tìm thấy refresh token');
                }
                return false;
            }

            const response = await apiRequest(API_CONFIG.ENDPOINTS.REFRESH, {
                method: 'POST',
                body: JSON.stringify({ refresh_token: refreshTokenStored }),
            }, true, false);

            if (response.ok) {
                const data = await safeJsonParse(response);
                if (isMountedRef.current) {
                    TokenManager.set(data.access_token, data.expires_in);
                    setToken(data.access_token);
                    setError(null);
                }
                return true;
            } else {
                if (isMountedRef.current) {
                    logout();
                    setError('Không thể làm mới token');
                }
                return false;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            if (isMountedRef.current) {
                logout();
                setError('Lỗi khi làm mới token: ' + error.message);
            }
            return false;
        } finally {
            isRefreshingRef.current = false;
        }
    }, []);

    const logout = useCallback(() => {
        if (!isMountedRef.current) return;

        TokenManager.clear();
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');

        setToken(null);
        setUser(null);
        setIsReady(false);
        setError(null);

        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
        }
    }, []);

    const clearError = useCallback(() => {
        if (isMountedRef.current) {
            setError(null);
        }
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {
            if (!isMountedRef.current) return;

            const currentToken = TokenManager.get();
            if (currentToken) {
                const userData = localStorage.getItem('user_data');
                if (userData) {
                    try {
                        const parsedUser = JSON.parse(userData);
                        if (isMountedRef.current) {
                            setUser(parsedUser);
                            setToken(currentToken);
                            setIsReady(true);
                        }
                    } catch (error) {
                        console.error('Error parsing user data:', error);
                        if (isMountedRef.current) {
                            logout();
                        }
                    }
                }
            }

            if (isMountedRef.current) {
                setLoading(false);
            }
        };

        initializeAuth();
    }, [logout]);

    useEffect(() => {
        if (token && !refreshIntervalRef.current && isMountedRef.current) {
            refreshIntervalRef.current = setInterval(() => {
                if (TokenManager.get() && TokenManager.isExpiringSoon()) {
                    refreshToken();
                }
            }, 60000);
        } else if (!token && refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
        }

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
            }
        };
    }, [token, refreshToken]);

    const login = useCallback(async (username, password) => {
        if (!isMountedRef.current) return { success: false, error: 'Component unmounted' };

        try {
            setLoading(true);
            setError(null);

            const response = await apiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            }, false, true);

            if (!isMountedRef.current) return { success: false, error: 'Component unmounted' };

            if (response.ok) {
                const data = await safeJsonParse(response);

                if (data.user.user_type !== 'Cán bộ quản lý') {
                    const errorMessage = 'Chỉ được đăng nhập bằng tài khoản của Cán bộ quản lý.';
                    if (isMountedRef.current) {
                        setError(errorMessage);
                        setLoading(false);
                    }
                    return { success: false, error: errorMessage };
                }

                if (isMountedRef.current) {
                    TokenManager.set(data.access_token, data.expires_in || 3600);
                    localStorage.setItem('refresh_token', data.refresh_token);
                    localStorage.setItem('user_data', JSON.stringify(data.user));

                    setToken(data.access_token);
                    setUser(data.user);
                    setIsReady(true);
                    setError(null);
                }

                return { success: true, data };
            } else {
                let errorData;
                let errorMessage = 'Đăng nhập thất bại';

                try {
                    const responseText = await response.text();
                    errorData = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('Failed to parse error response:', parseError);
                }

                if (errorData) {
                    if (errorData.error === 'INVALID_CREDENTIALS' && errorData.status_code === 401) {
                        errorMessage = errorData.message || 'Tên đăng nhập hoặc mật khẩu không đúng.';
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } else {
                    if (response.status === 400) {
                        errorMessage = 'Tên người dùng hoặc mật khẩu không đúng';
                    } else if (response.status === 401) {
                        errorMessage = 'Không được phép đăng nhập. Vui lòng kiểm tra thông tin đăng nhập.';
                    } else {
                        errorMessage = `Đăng nhập thất bại: ${response.status}`;
                    }
                }

                if (isMountedRef.current) {
                    setError(errorMessage);
                }

                return {
                    success: false,
                    error: errorMessage,
                    errorCode: errorData?.error,
                    statusCode: errorData?.status_code || response.status,
                    details: errorData?.details,
                };
            }
        } catch (error) {
            const errorMessage =
                error.name === 'TypeError' && error.message.includes('Failed to fetch')
                    ? 'Lỗi CORS hoặc kết nối mạng. Vui lòng kiểm tra server.'
                    : 'Lỗi kết nối mạng';

            if (isMountedRef.current) {
                setError(errorMessage);
            }
            return { success: false, error: errorMessage };
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    const contextValue = useMemo(() => ({
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        loading,
        isReady,
        error,
        refreshToken,
        clearError,
    }), [user, token, login, logout, loading, isReady, error, refreshToken, clearError]);

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};