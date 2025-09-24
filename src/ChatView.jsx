import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { MessageCircle, Send, Bot, RefreshCw } from 'lucide-react';
import { apiRequest, safeJsonParse, API_CONFIG } from './api';

// Danh sách fileTypes mặc định nếu API thất bại
const DEFAULT_FILE_TYPES = ['admin', 'teacher', 'student', 'public'];

const ChatView = () => {
    const { token, isReady, refreshToken } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFileType, setSelectedFileType] = useState('public');
    const [fileTypes, setFileTypes] = useState(DEFAULT_FILE_TYPES);
    const [error, setError] = useState('');

    // Token validation helper
    const validateToken = useCallback(async () => {
        if (!isReady || !token) {
            setError('Vui lòng đăng nhập lại để tiếp tục');
            return false;
        }

        // Kiểm tra xem token có sắp hết hạn không và làm mới nếu cần
        if (token && (typeof token.isExpiringSoon === 'function' && token.isExpiringSoon())) {
            try {
                await refreshToken();
                return true;
            } catch (error) {
                setError('Không thể làm mới token, vui lòng đăng nhập lại');
                return false;
            }
        }

        return true;
    }, [isReady, token, refreshToken]);

    // Fetch file types từ API
    const fetchFileTypes = useCallback(async () => {
        if (!isReady) return;
        const isValid = await validateToken();
        if (!isValid) return;

        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.DOCUMENTS_TYPES, {}, true, false, token);
            if (response.ok) {
                const data = await safeJsonParse(response);
                if (data?.folders?.length > 0) {
                    setFileTypes(data.folders);
                    setError('');
                } else {
                    setFileTypes(DEFAULT_FILE_TYPES);
                    setError('Dữ liệu loại tài liệu trống, sử dụng danh sách mặc định');
                }
            } else {
                setFileTypes(DEFAULT_FILE_TYPES);
                setError('Không thể tải danh sách loại tài liệu, sử dụng danh sách mặc định');
            }
        } catch (error) {
            setFileTypes(DEFAULT_FILE_TYPES);
            setError('Lỗi khi tải danh sách loại tài liệu: ' + error.message);
        }
    }, [isReady, validateToken, token]);

    // Gọi fetchFileTypes khi component được mount
    useEffect(() => {
        if (isReady) {
            fetchFileTypes();
        }
    }, [isReady, fetchFileTypes]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = { id: Date.now(), type: 'user', content: inputMessage, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const isValid = await validateToken();
            if (!isValid) {
                throw new Error('Phiên đăng nhập không hợp lệ');
            }

            const response = await apiRequest(API_CONFIG.ENDPOINTS.SEARCH_WITH_LLM, {
                method: 'POST',
                body: JSON.stringify({
                    query: inputMessage,
                    file_type: selectedFileType,
                    k: 5,
                    similarity_threshold: 0.5
                })
            }, false, false, token);

            if (response.ok) {
                const data = await safeJsonParse(response);
                const aiMessage = {
                    id: Date.now() + 1,
                    type: 'ai',
                    content: data.llm_response,
                    contexts: data.contexts,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                throw new Error(`Server error: ${response.status}`);
            }
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: `Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn: ${error.message}. Vui lòng thử lại sau.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="border-b border-gray-200 p-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">Trò chuyện với AI</h3>
                    <select
                        value={selectedFileType}
                        onChange={(e) => setSelectedFileType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {fileTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                {error && (
                    <div className="mt-2 text-red-600 text-sm">{error}</div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-12">
                        <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Bắt đầu cuộc trò chuyện</h3>
                        <p className="text-gray-600">Hỏi tôi bất cứ điều gì về tài liệu trong hệ thống</p>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-3xl px-4 py-3 rounded-lg ${message.type === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-200 shadow-sm'
                                }`}
                        >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            {message.contexts && message.contexts.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 mb-2">Nguồn tham khảo:</p>
                                    <div className="space-y-2">
                                        {message.contexts.slice(0, 2).map((context, index) => (
                                            <div key={index} className="text-xs bg-gray-50 p-2 rounded border">
                                                <p className="text-gray-700 line-clamp-3">{context.content}</p>
                                                <p className="text-gray-500 mt-1">
                                                    Độ tương đồng: {(context.metadata.similarity_score * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="text-xs opacity-70 mt-2">
                                {message.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 shadow-sm px-4 py-3 rounded-lg">
                            <div className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span className="text-gray-600">AI đang suy nghĩ...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-200 p-4">
                <div className="flex gap-3">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập câu hỏi của bạn..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="2"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatView;