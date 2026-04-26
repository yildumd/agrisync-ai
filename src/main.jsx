import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(React.StrictMode, null,
    React.createElement(BrowserRouter, null,
      React.createElement(AuthProvider, null,
        React.createElement(App, null),
        React.createElement(Toaster, { position: "top-right" })
      )
    )
  )
);