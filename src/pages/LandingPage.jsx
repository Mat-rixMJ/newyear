import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import './LandingPage.css'

function LandingPage() {
    const [name, setName] = useState('')
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        if (name.trim()) {
            // Encode the name and optional message for URL
            const encodedName = encodeURIComponent(name.trim())
            const searchParams = message.trim()
                ? `?message=${encodeURIComponent(message.trim())}`
                : ''
            navigate(`/wish/${encodedName}${searchParams}`)
        }
    }

    return (
        <main className="landing-page">
            <div className="container">
                <div className="hero-section">
                    <div className="hero-badge animate-fade-in">✨ New Year 2026 ✨</div>

                    <h1 className="hero-title animate-slide-up">
                        Create Your Personalized
                        <span className="text-gradient"> New Year Wish</span> 🎉
                    </h1>

                    <p className="hero-subtitle animate-slide-up stagger-1">
                        Enter your name and see a beautiful animated greeting instantly.
                        Share your personalized wish with friends and family!
                    </p>

                    <form onSubmit={handleSubmit} className="wish-form glass-card animate-slide-up stagger-2">
                        <Input
                            label="Your Name"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            required
                        />

                        <Input
                            label="Custom Message (Optional)"
                            name="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Add a personal touch to your wish..."
                            multiline
                            rows={3}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="large"
                            className="submit-btn"
                        >
                            Generate My Wish ✨
                        </Button>
                    </form>

                    <div className="features animate-fade-in stagger-3">
                        <div className="feature">
                            <span className="feature-icon">🎆</span>
                            <span>Animated Collage</span>
                        </div>
                        <div className="feature">
                            <span className="feature-icon">📱</span>
                            <span>Mobile Friendly</span>
                        </div>
                        <div className="feature">
                            <span className="feature-icon">🔗</span>
                            <span>Easy Sharing</span>
                        </div>
                    </div>

                    {/* AI Image Styler Feature */}
                    <Link to="/styler" className="ai-styler-card animate-slide-up stagger-4">
                        <div className="styler-card-content">
                            <div className="styler-card-icon">🎨</div>
                            <div className="styler-card-text">
                                <h3>AI Image Styler</h3>
                                <p>Transform your photos into Ghibli, Animated, Cyberpunk & more!</p>
                            </div>
                            <div className="styler-card-arrow">→</div>
                        </div>
                    </Link>
                </div>

                <div className="ad-placeholder animate-fade-in stagger-4">
                    📢 Advertisement Space
                </div>
            </div>
        </main>
    )
}

export default LandingPage
