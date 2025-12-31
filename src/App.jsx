import { Routes, Route } from 'react-router-dom'
import ImageStylerPage from './pages/ImageStylerPage'
import Confetti from './components/Confetti'
import './App.css'

function App() {
  return (
    <div className="app">
      <Confetti />
      <Routes>
        <Route path="/" element={<ImageStylerPage />} />
      </Routes>
    </div>
  )
}

export default App
