import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className='landingPageContainer'>
      <nav>
        <div className="navHeader">
            <h2>Confera</h2>
        </div>
        <div className="navList">
            <p onClick={() => navigate('/auth?mode=guest')}>Join as Guest</p>
            <p onClick={() => navigate('/auth?mode=register')}>Register</p>
            <div className="loginBtn" role='button' onClick={() => navigate('/auth?mode=login')}>
                <p>Login</p>
            </div>
        </div>
      </nav>
      <div className="landingMainContainer">
          <div >
            <h1>
              Connect with your loved ones
            </h1>
            <p>Cover a distance by Confera</p>
            <div role='button'>
              <Link to={"/auth?mode=register"}>Get Started</Link>
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
