import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Authentication from './pages/Authentication.jsx';
import VideoMeetComponent from './pages/VideoMeetComponent.jsx';
import Home from './pages/Home.jsx';
import { useAuth } from './contexts/AuthContext.jsx';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#0f0f13', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Inter, sans-serif' }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <Router>
          <Routes>
            <Route path="/" element={<LandingPage/>}/>
            {/* Redirect logged-in users away from /auth to /home */}
            <Route path="/auth" element={user ? <Navigate to="/home" replace /> : <Authentication/>}/>
            {/* Protected Home Dashboard */}
            <Route path="/home" element={user ? <Home/> : <Navigate to="/auth?mode=login" replace />}/>
            <Route path='/:url' element={<VideoMeetComponent/>}/>
          </Routes>
      </Router>
    </>
  )
}

export default App

