import { Routes, Route } from 'react-router-dom'
import ImageStylerPage from './pages/ImageStylerPage'
import ViewWish from './pages/ViewWish'
import Confetti from './components/Confetti'
import './App.css'

function App() {
  return (
    <div className="app">
      <Confetti />
      <Routes>
        <Route path="/" element={<ImageStylerPage />} />
        <Route path="/styler" element={<ImageStylerPage />} />
        <Route path="/wish" element={<ViewWish />} />
      </Routes>
    </div>
  )
}

export default App
