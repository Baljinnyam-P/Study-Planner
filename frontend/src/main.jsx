// -------------------------------------------------------------
// Why: This is the entry point for the React frontend, responsible for mounting the app.
// Why?
//   - Keeps the app bootstrap logic separate from app logic for clarity.
//   - Enables integration with tools like Vite and React StrictMode.
//   - Follows React and Vite best practices for maintainable, testable code.
//   - Makes it easy to swap out or update the root component if needed.
// -------------------------------------------------------------
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
)
