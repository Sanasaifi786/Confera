import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import './Home.css';

const API = 'http://localhost:8000/api/v1/user';

function Home() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [createdMeetingId, setCreatedMeetingId] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Fetch meeting history on page load
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/get_all_activities?token=${token}`)
      .then(res => res.json())
      .then(data => {
        setMeetings(data.meetings || []);
        setLoadingHistory(false);
      })
      .catch(() => setLoadingHistory(false));
  }, [token]);

  const generateMeetingId = () => {
    const seg = () => Math.random().toString(36).substring(2, 6);
    return `${seg()}-${seg()}-${seg()}`;
  };

  // Step 1: Generate ID & save to history, then show the share panel
  const handleNewMeeting = () => {
    const id = generateMeetingId();
    setCreatedMeetingId(id);
    setLinkCopied(false);
    // Save to backend activity history
    if (token) {
      fetch(`${API}/add_to_activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, meeting_id: id })
      }).then(() => {
        // Refresh history
        fetch(`${API}/get_all_activities?token=${token}`)
          .then(res => res.json())
          .then(data => setMeetings(data.meetings || []));
      });
    }
  };

  // Step 2: Copy the link to clipboard
  const handleCopyLink = () => {
    const link = `${window.location.origin}/${createdMeetingId}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
  };

  // Step 3: Actually start the meeting
  const handleStartMeeting = () => {
    navigate(`/${createdMeetingId}`);
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

          {/* ---- Meeting Ready Panel ---- */}
          {createdMeetingId && (
            <div className="meeting-ready-panel">
              <p className="meeting-ready-title">✅ Your meeting is ready</p>
              <p className="meeting-ready-subtitle">
                Share this link with your friends so they can join:
              </p>

              {/* Link display box */}
              <div className="meeting-link-box">
                <span className="meeting-link-text">
                  {window.location.origin}/{createdMeetingId}
                </span>
                <button className="btn-copy-link" onClick={handleCopyLink}>
                  {linkCopied ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              <p className="meeting-ready-note">
                Share the link, then click Start Meeting when ready.
              </p>

              <button className="btn-start-meeting" onClick={handleStartMeeting}>
                Start Meeting →
              </button>
            </div>
          )}

          <hr className="home-divider" />
          <p className="home-hint">
            Click{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); handleNewMeeting(); }}>
              New Meeting
            </a>{' '}
            to get a shareable link, or join with a code above.
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
        {loadingHistory ? (
          <div className="home-recent-empty"><p>Loading...</p></div>
        ) : meetings.length === 0 ? (
          <div className="home-recent-empty">
            <p>No recent meetings yet.</p>
            <p>Your past meetings will appear here.</p>
          </div>
        ) : (
          <div className="home-meetings-list">
            {meetings.map((m, i) => (
              <div key={i} className="home-meeting-row">
                <div className="meeting-row-icon">📹</div>
                <div className="meeting-row-info">
                  <p className="meeting-row-id">{m.meeting_id}</p>
                  <p className="meeting-row-date">{new Date(m.date).toLocaleString()}</p>
                </div>
                <button
                  className="meeting-row-rejoin"
                  onClick={() => navigate(`/${m.meeting_id}`)}
                >
                  Rejoin
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Home;
