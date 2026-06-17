import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import './Home.css';

const API = 'http://localhost:8000/api/v1/user';

function Home() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('meetings');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [createdMeetingId, setCreatedMeetingId] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/get_all_activities?token=${token}`)
      .then(res => res.json())
      .then(data => { setMeetings(data.meetings || []); setLoadingHistory(false); })
      .catch(() => setLoadingHistory(false));
  }, [token]);

  const generateMeetingId = () => {
    const seg = () => Math.random().toString(36).substring(2, 6);
    return `${seg()}-${seg()}-${seg()}`;
  };

  const handleNewMeeting = () => {
    const id = generateMeetingId();
    setCreatedMeetingId(id);
    setLinkCopied(false);
    if (token) {
      fetch(`${API}/add_to_activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, meeting_id: id })
      }).then(() => {
        fetch(`${API}/get_all_activities?token=${token}`)
          .then(res => res.json())
          .then(data => setMeetings(data.meetings || []));
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${createdMeetingId}`);
    setLinkCopied(true);
  };

  const handleStartMeeting = () => navigate(`/${createdMeetingId}`);

  const handleJoinMeeting = () => {
    if (!joinCode.trim()) { setJoinError('Please enter a meeting code.'); return; }
    const code = joinCode.trim().split('/').pop();
    navigate(`/${code}`);
  };

  return (
    <div className="home-wrapper">

      {/* ---- SIDEBAR ---- */}
      <aside className="home-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </div>
          <span className="sidebar-logo-text">Confera</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeTab === 'meetings' ? 'active' : ''}`}
            onClick={() => setActiveTab('meetings')}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
            Meetings
          </button>
          <button
            className={`sidebar-nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
            </svg>
            History
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name}</p>
              <p className="sidebar-user-handle">@{user?.username}</p>
            </div>
          </div>
          <button className="sidebar-logout" onClick={logout} title="Logout">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ---- MAIN CONTENT ---- */}
      <main className="home-main">

        {/* MEETINGS TAB */}
        {activeTab === 'meetings' && (
          <div className="home-content">
            <div className="home-header">
              <h1>Welcome back, <span className="home-header-name">{user?.name?.split(' ')[0]}</span> 👋</h1>
              <p>Start a new meeting or join one with a code.</p>
            </div>

            <div className="home-cards">
              {/* New Meeting Card */}
              <div className="action-card action-card-primary">
                <div className="action-card-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                </div>
                <div className="action-card-body">
                  <h3>New Meeting</h3>
                  <p>Create an instant meeting and share the link</p>
                </div>
                <button className="btn-primary" onClick={handleNewMeeting}>
                  Start →
                </button>
              </div>

              {/* Join Meeting Card */}
              <div className="action-card action-card-secondary">
                <div className="action-card-icon-wrap secondary">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                    <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
                  </svg>
                </div>
                <div className="action-card-body">
                  <h3>Join a Meeting</h3>
                  <p>Enter a code or paste a meeting link</p>
                </div>
              </div>
            </div>

            {/* Join Input Row */}
            <div className="join-section">
              <div className="join-input-row">
                <input
                  className="join-code-input"
                  type="text"
                  placeholder="Enter meeting code  e.g. abcd-efgh-1234"
                  value={joinCode}
                  onChange={e => { setJoinCode(e.target.value); setJoinError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleJoinMeeting()}
                />
                <button className="btn-primary" onClick={handleJoinMeeting}>
                  Join
                </button>
              </div>
              {joinError && <p className="join-error">{joinError}</p>}
            </div>

            {/* Meeting Ready Panel */}
            {createdMeetingId && (
              <div className="ready-panel">
                <div className="ready-panel-header">
                  <span className="ready-dot"></span>
                  <p>Your meeting is ready — share the link below</p>
                </div>
                <div className="ready-link-row">
                  <code className="ready-link-text">
                    {window.location.origin}/{createdMeetingId}
                  </code>
                  <button className="btn-copy" onClick={handleCopyLink}>
                    {linkCopied ? '✓ Copied' : 'Copy Link'}
                  </button>
                </div>
                <button className="btn-start-meeting" onClick={handleStartMeeting}>
                  Start Meeting →
                </button>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="home-content">
            <div className="home-header">
              <h1>Meeting History</h1>
              <p>All your past meetings in one place.</p>
            </div>

            {loadingHistory ? (
              <div className="history-empty"><p>Loading...</p></div>
            ) : meetings.length === 0 ? (
              <div className="history-empty">
                <div className="history-empty-icon">📅</div>
                <p>No meetings yet</p>
                <span>Your past meetings will appear here once you start one.</span>
              </div>
            ) : (
              <div className="history-list">
                <div className="history-list-header">
                  <span>Meeting ID</span>
                  <span>Date & Time</span>
                  <span></span>
                </div>
                {meetings.map((m, i) => (
                  <div key={i} className="history-row">
                    <div className="history-row-left">
                      <div className="history-row-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                        </svg>
                      </div>
                      <code className="history-meeting-id">{m.meeting_id}</code>
                    </div>
                    <span className="history-date">{new Date(m.date).toLocaleString()}</span>
                    <button className="btn-rejoin" onClick={() => navigate(`/${m.meeting_id}`)}>
                      Rejoin
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default Home;
