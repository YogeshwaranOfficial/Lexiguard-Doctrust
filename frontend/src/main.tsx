import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }}
>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0e0e22',
            color: '#e8e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: '"DM Sans", sans-serif',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#0e0e22' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0e0e22' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
