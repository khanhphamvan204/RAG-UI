// API Configuration
export const API_CONFIG = {
    USE_PROXY_FOR_AUTH: false,
    USE_PROXY_FOR_RAG: false,
    AUTH_BASE_URL: 'https://ai-api.bitech.vn',
    RAG_BASE_URL: 'http://localhost:8000',
    ENDPOINTS: {
        LOGIN: '/api/auth/login',
        REFRESH: '/api/auth/refresh',
        LOGOUT: '/api/auth/logout',
        ALL_USERS: '/api/manager/all-users',
        USER_PROFILE_UPDATE: '/api/manager/update-user',
        DOCUMENTS_LIST: '/documents/list',
        DOCUMENTS_TYPES: '/agent-list/api/folders/list',
        DOCUMENT_RETRIEVE: '/documents/retrieve',
        VECTOR_ADD: '/documents/vector/add',
        VECTOR_UPDATE: '/documents/vector',
        VECTOR_DELETE: '/documents/vector',
        VECTOR_SEARCH: '/documents/vector/search',
        SEARCH_WITH_LLM: '/documents/vector/search-with-llm',
        SEARCH_USER: '/api/manager/search-user',
        SEARCH_DEPARTMENT: '/api/manager/search-department',
        // Thêm các endpoint cho quản lý thư mục
        FOLDERS_LIST: '/agent-list/api/folders/list',
        FOLDERS_ADD: '/agent-list/api/folders/add',
        FOLDERS_DELETE: '/agent-list/api/folders/delete',
        // Thêm các endpoint cho quản lý phân quyền role
        FOLDER_ROLES_LIST: '/agent-list/api/folder_roles/list',
        FOLDER_ROLES_ASSIGN: '/agent-list/api/folder_roles/assign',
        FOLDER_ROLES_DELETE: '/agent-list/api/folder_roles/delete',
        DEPARTMENTS: '/api/manager/departments',

        ROLES: '/agent-list/api/roles/list',
    },
};

// Token management utilities
export const TokenManager = {
    get: () => {
        try {
            const token = localStorage.getItem('access_token');
            const expiry = localStorage.getItem('token_expiry');
            if (!token || !expiry) return null;
            if (Date.now() > parseInt(expiry)) {
                TokenManager.clear();
                return null;
            }
            return token;
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },
    set: (token, expiresIn = 3600) => {
        try {
            const expiry = Date.now() + (expiresIn * 1000);
            localStorage.setItem('access_token', token);
            localStorage.setItem('token_expiry', expiry.toString());
        } catch (error) {
            console.error('Error setting token:', error);
        }
    },
    clear: () => {
        try {
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_expiry');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
        } catch (error) {
            console.error('Error clearing token:', error);
        }
    },
    isExpiringSoon: () => {
        try {
            const expiry = localStorage.getItem('token_expiry');
            if (!expiry) return true;
            const timeLeft = parseInt(expiry) - Date.now();
            return timeLeft < 300000; // 5 phút
        } catch (error) {
            console.error('Error checking token expiry:', error);
            return true;
        }
    },
};

export const getFullUrl = (endpoint, isAuth = false, isUserManagement = false) => {
    if (isAuth || isUserManagement) {
        return API_CONFIG.USE_PROXY_FOR_AUTH ? endpoint : `${API_CONFIG.AUTH_BASE_URL}${endpoint}`;
    }
    return API_CONFIG.USE_PROXY_FOR_RAG ? endpoint : `${API_CONFIG.RAG_BASE_URL}${endpoint}`;
};

export const apiRequest = async (endpoint, options = {}, isAuth = false, isUserManagement = false) => {
    const url = getFullUrl(endpoint, isAuth, isUserManagement);
    const headers = new Headers(options.headers || {});
    const isFormData = options.body instanceof FormData;

    if (!isFormData && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    // Kiểm tra và làm mới token trước khi gửi yêu cầu
    let token = TokenManager.get();
    if (isAuth && !token) {
        return new Response(
            JSON.stringify({ error: 'No token provided for authenticated request' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    if (isAuth && TokenManager.isExpiringSoon()) {
        try {
            const refreshTokenStored = localStorage.getItem('refresh_token');
            if (!refreshTokenStored) {
                throw new Error('No refresh token available');
            }

            const refreshResponse = await fetch(getFullUrl(API_CONFIG.ENDPOINTS.REFRESH, true), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshTokenStored }),
            });

            if (refreshResponse.ok) {
                const data = await safeJsonParse(refreshResponse);
                TokenManager.set(data.access_token, data.expires_in);
                token = data.access_token;
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            throw error;
        }
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    try {
        const response = await fetch(url, { ...options, headers });
        return response;
    } catch (error) {
        console.error('API Request Error:', { url, error: error.message });
        throw error;
    }
};

export const safeJsonParse = async (response) => {
    const text = await response.clone().text();
    try {
        return JSON.parse(text);
    } catch (error) {
        console.error('Parse error:', error, 'Text:', text.substring(0, 100));
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}... (Error: ${error.message})`);
    }
};