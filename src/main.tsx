import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactFlowProvider } from "reactflow";
import App from './App';
import './index.css';
//Built by Olimov Komil 23.10.1999 Frontend React dev
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  </React.StrictMode>
);
