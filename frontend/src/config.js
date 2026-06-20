// Centralized configuration for connecting frontend with backend
// In Vercel or other production environments, define VITE_BACKEND_URL env variable.
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://confera-backend-production.up.railway.app'); // Fallback placeholder URL

export const API_BASE_URL = `${BACKEND_URL}/api/v1/user`;
