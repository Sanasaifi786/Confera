import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import '../App.css'

function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [meetingCode, setMeetingCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestError, setGuestError] = useState('');

  const handleGuestJoin = () => {
    if (!guestName.trim()) {
      setGuestError('Please enter your name.');
      return;
    }
    if (!meetingCode.trim()) {
      setGuestError('Please enter a meeting code or link.');
      return;
    }
    // Extract just the code if a full URL is pasted
    const code = meetingCode.trim().split('/').pop();
    setGuestError('');
    setShowGuestModal(false);
    navigate(`/${code}`);
  };

  return (
    <div className='landingPageContainer'>
      {/* Guest Join Modal */}
      {showGuestModal && (
        <div className="guestModalOverlay" onClick={() => setShowGuestModal(false)}>
          <div className="guestModal" onClick={e => e.stopPropagation()}>
            <h3>Join as Guest</h3>
            <p>No account needed. Just enter your name and meeting code.</p>
            <input
              type="text"
              placeholder="Your name"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              className="guestInput"
            />
            <input
              type="text"
              placeholder="Meeting code or link"
              value={meetingCode}
              onChange={e => setMeetingCode(e.target.value)}
              className="guestInput"
            />
            {guestError && <p className="guestError">{guestError}</p>}
            <div className="guestModalActions">
              <button className="guestCancelBtn" onClick={() => setShowGuestModal(false)}>Cancel</button>
              <button className="guestJoinBtn" onClick={handleGuestJoin}>Join Now</button>
            </div>
          </div>
        </div>
      )}

      <nav>
        <div className="navHeader">
            <h2>Confera</h2>
        </div>
        <div className="navList">
            {user ? (
              <>
                <p style={{ cursor: 'default', color: '#a5b4fc', fontWeight: '600' }}>Hello, {user.name}</p>
                <div className="loginBtn" role='button' onClick={logout}>
                    <p>Logout</p>
                </div>
              </>
            ) : (
              <>
                <p onClick={() => setShowGuestModal(true)}>Join as Guest</p>
                <p onClick={() => navigate('/auth?mode=register')}>Register</p>
                <div className="loginBtn" role='button' onClick={() => navigate('/auth?mode=login')}>
                    <p>Login</p>
                </div>
              </>
            )}
        </div>
      </nav>

      <div className="landingMainContainer">
          <div>
            <h1>
              Connect with your loved ones
            </h1>
            <p>Cover a distance by Confera</p>
            <div role='button'>
              {user ? (
                <Link to={"/home"}>Go to Dashboard</Link>
              ) : (
                <Link to={"/auth?mode=register"}>Get Started</Link>
              )}
            </div>
          </div>
          <div>
            <img src="/mobile.png" alt="Confera mobile preview" />
          </div>
      </div>
    </div>
  )
}

export default LandingPage;


