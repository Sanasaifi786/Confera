import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import '../App.css'

function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className='landingPageContainer'>
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
                <p onClick={() => navigate('/auth?mode=guest')}>Join as Guest</p>
                <p onClick={() => navigate('/auth?mode=register')}>Register</p>
                <div className="loginBtn" role='button' onClick={() => navigate('/auth?mode=login')}>
                    <p>Login</p>
                </div>
              </>
            )}
        </div>
      </nav>
      <div className="landingMainContainer">
          <div >
            <h1>
              Connect with your loved ones
            </h1>
            <p>Cover a distance by Confera</p>
            <div role='button'>
              {user ? (
                <Link to={"/"}>Welcome Back</Link>
              ) : (
                <Link to={"/auth?mode=register"}>Get Started</Link>
              )}
            </div>
          </div>
          <div>
            <img src="/public/mobile.png" alt="" />
          </div>
      </div>
    </div>
  )
}

export default LandingPage;
