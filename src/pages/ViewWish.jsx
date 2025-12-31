import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getWish } from '../services/supabaseService'
import './ViewWish.css'
import '../components/SimpleWish.css' // Reuse slideshow styles

function ViewWish() {
    const { id } = useParams()
    const [searchParams] = useSearchParams()

    // State for database wishes
    const [dbWish, setDbWish] = useState(null)
    const [loading, setLoading] = useState(!!id)
    const [error, setError] = useState(null)
    const [currentSlide, setCurrentSlide] = useState(0)

    // Fallback URL params
    const urlName = searchParams.get('name')
    const urlMsg = searchParams.get('msg')

    useEffect(() => {
        async function fetchWish() {
            if (!id) return

            try {
                const wishData = await getWish(id)
                if (wishData) {
                    setDbWish(wishData)
                } else {
                    setError('Wish not found')
                }
            } catch (err) {
                setError('Could not load wish')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchWish()
    }, [id])

    // Auto-slide effect for images
    useEffect(() => {
        if (dbWish?.images?.length > 1) {
            const timer = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % dbWish.images.length)
            }, 3000)
            return () => clearInterval(timer)
        }
    }, [dbWish])

    // Determine content to show
    const displayName = dbWish ? dbWish.name : (urlName || 'Friend')
    const displayMsg = dbWish ? dbWish.message : (urlMsg || 'Wishing you a wonderful New Year filled with joy and happiness!')
    const images = dbWish?.images || []

    if (loading) {
        return (
            <div className="view-wish loading">
                <div className="spinner">✨ Loading Wish...</div>
            </div>
        )
    }

    if (error && !urlName) {
        return (
            <div className="view-wish error">
                <div className="wish-card">
                    <h1>😕 Oops!</h1>
                    <p>{error}</p>
                    <a href="/" className="create-btn">Create Your Own</a>
                </div>
            </div>
        )
    }

    return (
        <div className="view-wish">
            <div className="wish-card result-container">
                {/* Image Slideshow (Only if images exist) */}
                {images.length > 0 && (
                    <div className="slideshow" style={{ marginBottom: '2rem', height: '300px' }}>
                        <div className="slides">
                            {images.map((imgUrl, i) => (
                                <div
                                    key={i}
                                    className={`slide ${i === currentSlide ? 'active' : ''}`}
                                >
                                    <img src={imgUrl} alt={`Memory ${i + 1}`} />
                                </div>
                            ))}
                        </div>
                        {images.length > 1 && (
                            <div className="slide-dots">
                                {images.map((_, i) => (
                                    <button
                                        key={i}
                                        className={`dot ${i === currentSlide ? 'active' : ''}`}
                                        onClick={() => setCurrentSlide(i)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="year-display">2026</div>
                <h1 className="greeting">
                    Happy New Year, <span className="name">{displayName}</span>! 🎆
                </h1>
                <p className="message">{displayMsg}</p>

                <div className="decorations">
                    <span>✨</span>
                    <span>🎉</span>
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
