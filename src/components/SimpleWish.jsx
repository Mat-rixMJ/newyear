import { useState, useRef, useCallback, useEffect } from 'react'
import { fileToBase64, generatePersonalizedWish } from '../services/geminiService'
import Button from './Button'
import './SimpleWish.css'

function SimpleWish() {
    const [name, setName] = useState('')
    const [images, setImages] = useState([])
    const [currentSlide, setCurrentSlide] = useState(0)
    const [wish, setWish] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const fileInputRef = useRef(null)

    // Auto-slide effect
    useEffect(() => {
        if (showResult && images.length > 1) {
            const timer = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % images.length)
            }, 3000)
            return () => clearInterval(timer)
        }
    }, [showResult, images.length])

    const handleImageUpload = useCallback((e) => {
        const files = Array.from(e.target.files || [])
        const validFiles = files.filter(f => f.type.startsWith('image/'))

        validFiles.forEach(file => {
            const url = URL.createObjectURL(file)
            setImages(prev => [...prev, { url, file }])
        })
    }, [])

    const removeImage = useCallback((index) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }, [])

    const handleGenerate = useCallback(async () => {
        if (!name.trim() || images.length === 0) return

        setIsGenerating(true)
        try {
            // Get base64 of first image for AI context
            const base64 = await fileToBase64(images[0].file)
            const generatedWish = await generatePersonalizedWish(name.trim(), base64, images[0].file.type)
            setWish(generatedWish)
            setShowResult(true)
        } catch (err) {
            console.error(err)
            setWish(`Dear ${name}, may 2026 bring you endless joy, success, and beautiful moments. Here's to new adventures and dreams coming true! Happy New Year! ✨`)
            setShowResult(true)
        } finally {
            setIsGenerating(false)
        }
    }, [name, images])

    const handleReset = useCallback(() => {
        setName('')
        setImages([])
        setWish('')
        setShowResult(false)
        setCurrentSlide(0)
    }, [])

    const handleShare = useCallback(() => {
        // Create shareable URL with name and wish
        const shareUrl = `${window.location.origin}/wish?name=${encodeURIComponent(name)}&msg=${encodeURIComponent(wish)}`
        const text = `🎉 Happy New Year 2026! Here's a special wish for you:\n\n${shareUrl}`
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
        window.open(whatsappUrl, '_blank')
    }, [name, wish])

    // RESULT VIEW
    if (showResult) {
        return (
            <div className="simple-wish result-view">
                <div className="result-container">
                    {/* Image Slideshow */}
                    <div className="slideshow">
                        <div className="slides">
                            {images.map((img, i) => (
                                <div
                                    key={i}
                                    className={`slide ${i === currentSlide ? 'active' : ''}`}
                                >
                                    <img src={img.url} alt={`Memory ${i + 1}`} />
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

                    {/* Wish Content */}
                    <div className="wish-content">
                        <div className="year-badge">2026</div>
                        <h1 className="wish-title">
                            Happy New Year, <span className="name-highlight">{name}</span>! 🎆
                        </h1>
                        <p className="wish-message">{wish}</p>
                    </div>

                    {/* Actions */}
                    <div className="result-actions">
                        <Button variant="whatsapp" onClick={handleShare} icon="📱">
                            Share on WhatsApp
                        </Button>
                        <Button variant="outline" onClick={handleReset}>
                            Create New
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // INPUT VIEW
    return (
        <div className="simple-wish">
            <div className="wish-header">
                <h1>🎉 New Year Wish Creator</h1>
                <p>Create a beautiful personalized wish with your photos</p>
            </div>

            <div className="input-form">
                {/* Name Input */}
                <div className="form-group">
                    <label>Who is this wish for?</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name..."
                        className="name-field"
                    />
                </div>

                {/* Image Upload */}
                <div className="form-group">
                    <label>Upload Photos</label>
                    <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            hidden
                        />
                        <span className="upload-icon">📷</span>
                        <span>Click to add photos</span>
                    </div>

                    {/* Image Preview Grid */}
                    {images.length > 0 && (
                        <div className="image-grid">
                            {images.map((img, i) => (
                                <div key={i} className="image-thumb">
                                    <img src={img.url} alt={`Upload ${i + 1}`} />
                                    <button
                                        className="remove-btn"
                                        onClick={() => removeImage(i)}
                                    >×</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Generate Button */}
                <Button
                    variant="primary"
                    size="large"
                    onClick={handleGenerate}
                    disabled={!name.trim() || images.length === 0 || isGenerating}
                    className="generate-btn"
                >
                    {isGenerating ? '✨ Creating Magic...' : '✨ Generate Wish'}
                </Button>
            </div>
        </div>
    )
}

export default SimpleWish
