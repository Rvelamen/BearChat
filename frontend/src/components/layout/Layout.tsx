import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import SettingsDialog from '../settings/SettingsDialog';
import { useChatStore } from '../../store/chatStore';
import { Bars3Icon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showSettings, setShowSettings] = useState(false);
  const { addChat } = useChatStore();

  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize a chat if none exists
  useEffect(() => {
    const { chatHistory } = useChatStore.getState();
    if (chatHistory.length === 0) {
      addChat();
    }
  }, [addChat]);

  return (
    <div className="flex h-screen bg-gray-50">
      {!isMobile && (
        <Sidebar onSettingsClick={() => setShowSettings(true)} />
      )}

      {isMobile && (
        <>
          {!mobileSidebarOpen && (
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
            >
              <Bars3Icon className="w-6 h-6 text-gray-700" />
            </button>
          )}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-40 flex">
              <div className="w-64 bg-white border-r border-gray-200">
                <Sidebar onSettingsClick={() => setShowSettings(true)} />
              </div>
              <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
            </div>
          )}
        </>
      )}

      {isMobile && (
        <style>{`
          .mobile-main * {
            font-size: 12px !important;
          }
        `}</style>
      )}

      <main className={`flex-1 flex flex-col bg-white overflow-hidden ${isMobile ? 'mobile-main' : ''}`}>
        {children}
      </main>
      
      <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}; 