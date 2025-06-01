import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import "github-markdown-css"
import "highlight.js/styles/tokyo-night-dark.css";
import "./highlight-overrides.css";
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 