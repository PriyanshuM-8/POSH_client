import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PoshProvider } from '@/context/PoshContext'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PoshProvider>
        <App />
      </PoshProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

