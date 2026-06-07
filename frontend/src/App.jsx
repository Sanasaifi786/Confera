import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Authentication from './pages/Authentication.jsx';
import VideoMeetComponent from './pages/VideoMeetComponent.jsx';

function App() {

  return (
    <>
      <Router>
          <Routes>
            <Route path = "/" element = {<LandingPage/>}/>
            <Route path = "/auth" element = {<Authentication/>}/>
            <Route path='/:url' element = {<VideoMeetComponent/>}/>
          </Routes>
      </Router>
    </>
  )
}

export default App
