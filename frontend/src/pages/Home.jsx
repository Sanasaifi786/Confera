import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate a random meeting ID like "abc-xyz-123"
  const generateMeetingId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const seg = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${seg(4)}-${seg(4)}-${seg(4)}`;
  };

  const handleNewMeeting = () => {
    const meetingId = generateMeetingId();
    navigate(`/${meetingId}`);
  };

  const handleJoinMeeting = () => {
    if (!joinCode.trim()) {
      setJoinError('Please enter a meeting code.');
      return;
    }
    const code = joinCode.trim().split('/').pop();
    setJoinError('');
    navigate(`/${code}`);
  };

  const handleCopyLink = () => {
    const meetingId = generateMeetingId();
    const link = `${window.location.origin}/${meetingId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      // Navigate to the meeting we just copied
      navigate(`/${meetingId}`);
    });
  };

  return (
    <div className="home-container">
      {/* Sidebar */}
      <aside className="home-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </div>
          <span>Confera</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-item active">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span>Home</span>
          </div>
          <div className="sidebar-nav-item">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
            </svg>
            <span>History</span>
          </div>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name}</p>
            <p className="sidebar-user-username">@{user?.username}</p>
          </div>
          <button className="sidebar-logout-btn" onClick={logout} title="Logout">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="home-main">
        {/* Header */}
        <header className="home-header">
          <div>
            <h1>Good day, {user?.name?.split(' ')[0]} 👋</h1>
            <p>Ready to connect? Start or join a meeting below.</p>
          </div>
        </header>

        {/* Action Cards */}
        <section className="home-actions">
          {/* New Meeting Card */}
          <div className="action-card new-meeting-card" onClick={handleNewMeeting}>
            <div className="action-card-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
            </div>
            <div className="action-card-text">
              <h3>New Meeting</h3>
              <p>Start an instant meeting</p>
            </div>
            <div className="action-card-arrow">→</div>
          </div>

          {/* Copy Link Card */}
          <div className="action-card copy-link-card" onClick={handleCopyLink}>
            <div className="action-card-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
              </svg>
            </div>
            <div className="action-card-text">
              <h3>{copied ? 'Link Copied! Opening...' : 'Create & Copy Link'}</h3>
              <p>Share the meeting link with others</p>
            </div>
            <div className="action-card-arrow">→</div>
          </div>
        </section>

        {/* Join Meeting Section */}
        <section className="home-join-section">
          <h2>Join a Meeting</h2>
          <p>Enter a meeting code or paste a full meeting link below</p>
          <div className="join-input-row">
            <input
              type="text"
              placeholder="e.g. abcd-efgh-1234 or full link"
              value={joinCode}
              onChange={(e) => { setJoinCode(e.target.value); setJoinError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinMeeting()}
              className="join-code-input"
            />
            <button className="join-meeting-btn" onClick={handleJoinMeeting}>
              Join
            </button>
          </div>
          {joinError && <p className="join-error">{joinError}</p>}
        </section>

        {/* Meeting History Placeholder */}
        <section className="home-history-section">
          <h2>Recent Meetings</h2>
          <div className="history-empty-state">
            <div className="history-empty-icon">📅</div>
            <p>Your meeting history will appear here once the backend is set up.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
