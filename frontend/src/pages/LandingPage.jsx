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
            <div role = 'button'>
                <p>Login</p>
            </div>
        </div>
      </nav>
    </div>
  )
}

export default LandingPage;
