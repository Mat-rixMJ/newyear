import { useSearchParams } from 'react-router-dom'
import './ViewWish.css'

function ViewWish() {
    const [searchParams] = useSearchParams()
    const name = searchParams.get('name') || 'Friend'
    const message = searchParams.get('msg') || 'Wishing you a wonderful New Year filled with joy and happiness!'

    return (
        <div className="view-wish">
            <div className="wish-card">
                <div className="year-display">2026</div>
                <h1 className="greeting">
                    Happy New Year, <span className="name">{name}</span>! 🎆
                </h1>
                <p className="message">{message}</p>
                <div className="decorations">
                    <span>✨</span>
                    <span>🎉</span>
                    <span>🥳</span>
                    <span>✨</span>
                </div>
                <a href="/" className="create-btn">
                    ✨ Create Your Own Wish
                </a>
            </div>
        </div>
    )
}

export default ViewWish
