import React from 'react';
import { Layout } from './components/layout/Layout';
import ChatContainer from './components/chat/ChatContainer';

function App() {
  return (
    <div className="h-screen bg-gray-50">
      <Layout>
        <ChatContainer />
      </Layout>
    </div>
  );
}

export default App; 