import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import WishPage from './pages/WishPage'
import ImageStylerPage from './pages/ImageStylerPage'
import Confetti from './components/Confetti'
import './App.css'

function App() {
  return (
    <div className="app">
      <Confetti />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/wish/:name" element={<WishPage />} />
        <Route path="/styler" element={<ImageStylerPage />} />
      </Routes>
      <footer className="footer">
        <p>✨ <a href="/">Create your own personalized New Year wish</a> ✨</p>
      </footer>
    </div>
  )
}

export default App
