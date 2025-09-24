import React, { useState, useMemo } from 'react';
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
  const { isAuthenticated, loading, isReady, user } = useAuth();

  // Memoize loading component để tránh re-render không cần thiết
  const LoadingScreen = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-lg">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-gray-700 font-medium">Đang khởi tạo...</span>
      </div>
    </div>
  ), []);

  // Memoize preparing data screen
  const PreparingDataScreen = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-lg">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-gray-700 font-medium">Đang chuẩn bị dữ liệu...</span>
      </div>
    </div>
  ), []);

  // Memoize main content để tránh re-render khi activeView không đổi
  const MainContent = useMemo(() => {
    switch (activeView) {
      case 'documents':
        return <DocumentsView key="documents" />;
      case 'folders':
        return <FoldersView key="folders" />;
      case 'folder-roles':
        return <FolderRolesView key="folder-roles" />;
      case 'chat':
        return <ChatView key="chat" />;
      default:
        return <DocumentsView key="documents" />;
    }
  }, [activeView]);

  // Simplify loading logic
  const isLoading = loading;
  const isPreparingData = isAuthenticated && !isReady;
  const shouldShowApp = isAuthenticated && isReady && user;

  // Early returns for loading states
  if (isLoading) {
    return LoadingScreen;
  }

  if (isPreparingData) {
    return PreparingDataScreen;
  }

  return (
    <div className="flex flex-col h-screen">
      {shouldShowApp ? (
        <>
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 overflow-y-auto">
              {MainContent}
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