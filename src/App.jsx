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

  const LoadingScreen = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-lg">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-gray-700 font-medium">Đang khởi tạo...</span>
      </div>
    </div>
  ), []);

  const PreparingDataScreen = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-lg">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-gray-700 font-medium">Đang chuẩn bị dữ liệu...</span>
      </div>
    </div>
  ), []);

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

  console.log('App render state:', {
    loading,
    isAuthenticated,
    isReady,
    hasUser: !!user,
  });

  if (loading && !isAuthenticated) {
    console.log('Showing initial loading screen');
    return LoadingScreen;
  }

  if (isAuthenticated && !isReady) {
    console.log('Showing preparing data screen');
    return PreparingDataScreen;
  }

  if (isAuthenticated && isReady && user) {
    console.log('Showing main app');
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar activeView={activeView} setActiveView={setActiveView} />
          <main className="flex-1 overflow-y-auto w-full">{MainContent}</main>
        </div>
      </div>
    );
  }

  console.log('Showing login form');
  return <LoginForm />;
};

export default App;