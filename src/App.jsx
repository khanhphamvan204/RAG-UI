// Trong file App.js
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import DocumentsView from './DocumentsView';
import FoldersView from './FoldersView';
import FolderRolesView from './FolderRolesView';
import ChatView from './ChatView';
import LoginForm from './LoginForm';
import { RefreshCw } from 'lucide-react';

const App = () => {
  const [activeView, setActiveView] = useState('documents');
  // Lấy thêm isReady từ context
  const { isAuthenticated, loading, isReady } = useAuth();

  // Vẫn giữ màn hình loading ban đầu
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-lg">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-700 font-medium">Đang khởi tạo...</span>
        </div>
      </div>
    );
  }

  // Nếu đã xác thực nhưng context chưa sẵn sàng -> vẫn hiển thị loading
  // Đây chính là mấu chốt để sửa lỗi
  if (isAuthenticated && !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-lg">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-700 font-medium">Đang chuẩn bị dữ liệu...</span>
        </div>
      </div>
    );
  }

  const renderMainContent = () => {
    switch (activeView) {
      case 'documents':
        return <DocumentsView />;
      case 'folders':
        return <FoldersView />;
      case 'folder-roles':
        return <FolderRolesView />;
      case 'chat':
        return <ChatView />;
      default:
        return <DocumentsView />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chỉ render khi đã xác thực VÀ sẵn sàng */}
      {isAuthenticated && isReady ? (
        <>
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 overflow-y-auto">
              {renderMainContent()}
            </main>
          </div>
        </>
      ) : (
        <LoginForm />
      )}
    </div>
  );
};

export default App;