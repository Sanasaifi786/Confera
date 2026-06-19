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
          <div className="sidebar-logo-mark">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
          </div>
          <h2 className="sidebar-logo-text">Confera</h2>
        </div>
        <div className="navList">
          {user ? (
            <>
              <p className='nav-link-btn' style={{ cursor: 'default', color: '#a5b4fc', fontWeight: '600' }}>Hello, {user.name}</p>
              <div className="loginBtn" role='button' onClick={logout}>
                <p>Logout</p>
              </div>
            </>
          ) : (
            <>
              <p className="nav-link-btn" onClick={() => setShowGuestModal(true)}>Join as guest</p>
              <p className="nav-link-btn" onClick={() => navigate('/auth?mode=register')}>Register</p>
              <div className="loginBtn" role='button' onClick={() => navigate('/auth?mode=login')}>
                <p>Login</p>
              </div>
            </>
          )}
        </div>
      </nav>

      <div className="landingMainContainer">
        <div className="heroLeft">
          <div className="heroBadge">
            <span className="badgeDot"></span>
            Now with instant rooms — no signup needed
          </div>
          <h1>
            Video calls that feel <span className="highlight-text">effortless</span>
          </h1>
          <p className="heroSubtext">
            Connect with anyone, anywhere. Start a meeting in seconds — no downloads, no friction.
          </p>
          <div className="heroButtons">
            <button className="primaryHeroBtn" onClick={() => setShowGuestModal(true)}>Start a meeting</button>
            <button className="secondaryHeroBtn" onClick={() => setShowGuestModal(true)}>Join with a code</button>
          </div>
          <div className="heroStats">
            <div className="statItem">
              <h3>10k+</h3>
              <p>Active users</p>
            </div>
            <div className="statDivider"></div>
            <div className="statItem">
              <h3>99.9%</h3>
              <p>Uptime</p>
            </div>
            <div className="statDivider"></div>
            <div className="statItem">
              <h3>&lt;120ms</h3>
              <p>Avg latency</p>
            </div>
          </div>
        </div>
        <div className="heroRight">
          <div className="mockMeetingApp">
            <div className="mockAppHeader">
              <div className="windowControls">
                <span className="wc-red"></span><span className="wc-yellow"></span><span className="wc-green"></span>
              </div>
              <p>Meeting — abcd-efgh-1234</p>
            </div>
            <div className="mockGrid">
              <div className="mockGridItem">
                <div className="mockAvatar s-bg">S</div>
                <p>Sana (you)</p>
              </div>
              <div className="mockGridItem">
                <div className="mockAvatar r-bg">R</div>
                <p>Rahul</p>
              </div>
              <div className="mockGridItem">
                <div className="mockAvatar p-bg">P</div>
                <p>Priya</p>
              </div>
              <div className="mockGridItem inviteItem">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M12 5v14M5 12h14"/></svg>
                <p>Invite</p>
              </div>
            </div>
            <div className="mockControls">
              <div className="mockControlBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M12 1v10M12 18a6 6 0 0 0 6-6H6a6 6 0 0 0 6 6zM9 22h6M12 18v4" /></svg>
              </div>
              <div className="mockControlBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              </div>
              <div className="mockControlBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8M12 17v4"/></svg>
              </div>
              <div className="mockControlBtn endCallBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg>
              </div>
            </div>
          </div>
          <div className="featureTags">
            <div className="fTag"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> End-to-end encrypted</div>
            <div className="fTag"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg> HD quality</div>
            <div className="fTag"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg> Browser-based</div>
          </div>
        </div>
      </div>

      <div className="landingDivider"></div>

      <div className="whyConferaSection">
        <div className='whyConferaHeading'>
          <p>WHY CONFERA</p>
          <h3>Everything you need, nothing you don't</h3>
        </div>
        <div className='whyConferaCards'>
          <div className="card">
            <div className="cardIconWrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </div>
            <h4>Instant shareable links</h4>
            <p>Create a room and share the link — your participants join in one click, no account needed.</p>
          </div>
          <div className="card">
            <div className="cardIconWrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><polyline points="12 8 12 12 14 14"></polyline><circle cx="12" cy="12" r="10"></circle></svg>
            </div>
            <h4>Meeting history</h4>
            <p>All your past calls in one place. Rejoin, review participants, or copy the link again.</p>
          </div>
          <div className="card">
            <div className="cardIconWrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h4>Secure by default</h4>
            <p>Every meeting is encrypted. No recordings without consent. Your privacy, guaranteed.</p>
          </div>
        </div>
        
        <div className="ctaBanner">
          <div className="ctaText">
            <h3>Ready to connect?</h3>
            <p>Free forever. No credit card required.</p>
          </div>
          <button className="ctaButton" onClick={() => navigate('/auth?mode=register')}>Get started free</button>
        </div>
      </div>
    </div>
  )
}

export default LandingPage;


