import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const generateMeetingId = () => {
    const seg = () => Math.random().toString(36).substring(2, 6);
    return `${seg()}-${seg()}-${seg()}`;
  };

  const handleNewMeeting = () => {
    const id = generateMeetingId();
    navigate(`/${id}`);
  };

  const handleJoinMeeting = () => {
    if (!joinCode.trim()) {
      setJoinError('Please enter a meeting code.');
      return;
    }
    const code = joinCode.trim().split('/').pop();
    navigate(`/${code}`);
  };

  return (
    <div className="home-wrapper">

      {/* Top Navbar */}
      <nav className="home-nav">
        <div className="home-nav-logo">
          <span className="home-logo-icon">📹</span>
          <span className="home-logo-text">Confera</span>
        </div>
        <div className="home-nav-right">
          <span className="home-nav-username">{user?.name}</span>
          <button className="home-logout-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* Main Body */}
      <div className="home-body">

        {/* Left Column */}
        <div className="home-left">
          <h1 className="home-greeting">Video calls and meetings for everyone</h1>
          <p className="home-subtext">Connect, collaborate and celebrate from anywhere with Confera</p>

          <div className="home-actions">
            <button className="btn-new-meeting" onClick={handleNewMeeting}>
              📹 New Meeting
            </button>

            <div className="join-box">
              <input
                type="text"
                className="join-input"
                placeholder="Enter a code or link"
                value={joinCode}
                onChange={(e) => { setJoinCode(e.target.value); setJoinError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinMeeting()}
              />
              <button
                className="btn-join"
                onClick={handleJoinMeeting}
                disabled={!joinCode.trim()}
              >
                Join
              </button>
            </div>
            {joinError && <p className="join-error">{joinError}</p>}
          </div>

          <hr className="home-divider" />
          <p className="home-hint">
            <a href="#" onClick={(e) => { e.preventDefault(); handleNewMeeting(); }}>
              Start a new meeting
            </a>{' '}
            or join with a meeting code above.
          </p>
        </div>

        {/* Right Column */}
        <div className="home-right">
          <img
            src="/mobile.png"
            alt="Video conferencing illustration"
            className="home-illustration"
          />
        </div>

      </div>

      {/* Recent Meetings */}
      <div className="home-recent">
        <h2 className="home-recent-title">Recent Meetings</h2>
        <div className="home-recent-empty">
          <p>No recent meetings yet.</p>
          <p>Your past meetings will appear here.</p>
        </div>
      </div>

    </div>
  );
}

export default Home;
