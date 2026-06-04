import React from 'react'
import '../App.css'
function LandingPage() {
  return (
    <div className='landingPageContainer'>
      <nav>
        <div className="navHeader">
            <h2>Confera</h2>
        </div>
        <div className="navList">
            <p>Join as Guest</p>
            <p>Register</p>
            <div className="loginBtn" role='button'>
                <p>Login</p>
            </div>
        </div>
      </nav>
      <div className="landingMainContainer">
          <div >
            <h1>
              Connect with your loved oned
            </h1>
            <p>Cover a distance by Confera</p>
            <div role='button'>
              <Link>Get Started</Link>
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
