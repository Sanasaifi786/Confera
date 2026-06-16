import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import './Authentication.css';

function Authentication() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const mode = searchParams.get('mode') || 'login';
  
  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // UI states
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear messages and reset forms when mode changes
  useEffect(() => {
    setError('');
    setMessage('');
    setName('');
    setUsername('');
    setPassword('');
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await register(name, username, password);
        setMessage('Registration successful! You can now log in.');
        ssetTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        await login(username, password);
        setMessage('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setMessage('Google authentication is currently simulated.');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="authContainer">
      {/* Left Pane - Visual */}
      <div className="authLeftPane">
        <div className="authOverlay"></div>
        <div className="authLeftContent">
          <div className="authWelcomeText">
            <h1>Welcome<br />Back,</h1>
          </div>
          <div className="authBrandContainer">
            <div className="authLogoIcon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <h2>Confera</h2>
          </div>
          <p className="authLeftDesc">
            Enter your personal details and start journey with us
          </p>
        </div>
      </div>

      {/* Right Pane - Forms */}
      <div className="authRightPane">
        <div className="authFormWrapper">
          <h2 className="authFormTitle">
            {mode === 'register' ? 'Register' : 'Login'}
          </h2>
          <p className="authFormSubtitle">
            {mode === 'register' 
              ? 'Create an account to start video conferencing today!' 
              : 'Measure the performance of cryptos,get big profits!'}
          </p>

          <button className="googleBtn" onClick={handleGoogleSignIn}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" />
            <span>Sign in with Google</span>
          </button>

          <div className="divider">
            <div className="line"></div>
            <span>{mode === 'register' ? 'Or Sign up with Email' : 'Or Sign in with Email'}</span>
            <div className="line"></div>
          </div>

          <form onSubmit={handleSubmit} className="authForm">
            {error && <div className="authAlert errorAlert">{error}</div>}
            {message && <div className="authAlert successAlert">{message}</div>}

            {mode === 'register' && (
              <div className="inputGroup">
                <label>Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your Name" 
                  required 
                />
              </div>
            )}

            <div className="inputGroup">
              <label>Email / Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="mail@website.com or username" 
                required 
              />
            </div>

            <div className="inputGroup">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Min. 8 characters" 
                required 
              />
            </div>

            {mode === 'login' && (
              <div className="formOptions">
                <label className="checkboxContainer">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <a href="#forgot" className="forgotLink">Forget password?</a>
              </div>
            )}

            <button type="submit" className="submitBtn" disabled={loading}>
              {loading ? 'Processing...' : (mode === 'register' ? 'Register' : 'Login')}
            </button>
          </form>

          <div className="authFooter">
            {mode === 'register' ? (
              <p>Already registered? <span onClick={() => setSearchParams({ mode: 'login' })}>Login</span></p>
            ) : (
              <p>Not registered yet? <span onClick={() => setSearchParams({ mode: 'register' })}>Create an Account</span></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Authentication;
