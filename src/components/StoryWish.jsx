import { useState, useRef, useCallback, useEffect } from 'react'
import {
    IMAGE_STYLES,
    fileToBase64,
    transformImageStyle,
    generatePersonalizedWish,
    generateStoryNarrative,
    downloadImage
} from '../services/geminiService'
import Button from './Button'
import './StoryWish.css'

// Story stages
const STAGES = {
    UPLOAD: 'upload',
    STYLE: 'style',
    GENERATING: 'generating',
    STORY: 'story'
}

function StoryWish() {
    const [stage, setStage] = useState(STAGES.UPLOAD)
    const [recipientName, setRecipientName] = useState('')
    const [selectedImage, setSelectedImage] = useState(null)
    const [selectedImageBase64, setSelectedImageBase64] = useState(null)
    const [selectedMimeType, setSelectedMimeType] = useState(null)
    const [selectedStyle, setSelectedStyle] = useState(null)
    const [transformedImage, setTransformedImage] = useState(null)
    const [aiWish, setAiWish] = useState('')
    const [storyTitle, setStoryTitle] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [loadingStep, setLoadingStep] = useState('')
    const [error, setError] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const [slideIndex, setSlideIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const fileInputRef = useRef(null)
    const storyRef = useRef(null)

    // Auto-play slideshow
    useEffect(() => {
        if (stage === STAGES.STORY && isPlaying) {
            const timer = setInterval(() => {
                setSlideIndex(prev => (prev + 1) % 3)
            }, 3000)
            return () => clearInterval(timer)
        }
    }, [stage, isPlaying])

    // Start playing when story loads
    useEffect(() => {
        if (stage === STAGES.STORY) {
            setIsPlaying(true)
        }
    }, [stage])

    const handleFileSelect = useCallback(async (file) => {
        if (!file) return
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file')
            return
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('Image size should be less than 10MB')
            return
        }

        setError(null)
        setSelectedImage(URL.createObjectURL(file))
        setSelectedMimeType(file.type)

        try {
            const base64 = await fileToBase64(file)
            setSelectedImageBase64(base64)
        } catch (err) {
            setError('Failed to process image')
        }
    }, [])

    const handleDrag = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDragIn = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(true)
    }, [])

    const handleDragOut = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        // Only set inactive if we're leaving the upload zone itself
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX
        const y = e.clientY
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const files = e.dataTransfer?.files
        if (files && files.length > 0) {
            handleFileSelect(files[0])
        }
    }, [handleFileSelect])

    const handleContinue = useCallback(() => {
        if (stage === STAGES.UPLOAD && selectedImage && recipientName.trim()) {
            setStage(STAGES.STYLE)
        }
    }, [stage, selectedImage, recipientName])

    const handleGenerateStory = useCallback(async () => {
        if (!selectedImageBase64 || !selectedStyle || !recipientName.trim()) return

        setStage(STAGES.GENERATING)
        setIsLoading(true)
        setError(null)

        try {
            // Step 1: Transform image
            setLoadingStep('🎨 Transforming your image...')
            const transformed = await transformImageStyle(selectedImageBase64, selectedStyle, selectedMimeType)
            setTransformedImage(transformed)

            // Step 2: Generate AI wish
            setLoadingStep('✨ Creating personalized wish...')
            const wish = await generatePersonalizedWish(recipientName.trim(), selectedImageBase64, selectedMimeType)
            setAiWish(wish)

            // Step 3: Generate story title
            setLoadingStep('📖 Preparing your story...')
            const title = await generateStoryNarrative(recipientName.trim())
            setStoryTitle(title)

            // Show story
            setStage(STAGES.STORY)
            setSlideIndex(0)
        } catch (err) {
            setError(err.message || 'Failed to generate story. Please try again.')
            setStage(STAGES.STYLE)
        } finally {
            setIsLoading(false)
        }
    }, [selectedImageBase64, selectedStyle, recipientName, selectedMimeType])

    const handleDownload = useCallback(() => {
        if (!transformedImage) return
        const styleName = IMAGE_STYLES[selectedStyle]?.name || 'styled'
        downloadImage(transformedImage.imageBase64, transformedImage.mimeType, `${recipientName}-${styleName}-wish.png`)
    }, [transformedImage, selectedStyle, recipientName])

    const handleReset = useCallback(() => {
        setStage(STAGES.UPLOAD)
        setSelectedImage(null)
        setSelectedImageBase64(null)
        setSelectedMimeType(null)
        setSelectedStyle(null)
        setTransformedImage(null)
        setAiWish('')
        setStoryTitle('')
        setRecipientName('')
        setError(null)
        setSlideIndex(0)
        setIsPlaying(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }, [])

    const handleShare = useCallback(async () => {
        const text = `🎉 Happy New Year 2026, ${recipientName}!\n\n${aiWish}\n\n✨ Create your own story wish!`
        if (navigator.share) {
            try {
                await navigator.share({ title: 'New Year Story Wish', text })
            } catch (err) {
                // Fallback to copy
                await navigator.clipboard.writeText(text)
                alert('Wish copied to clipboard!')
            }
        } else {
            await navigator.clipboard.writeText(text)
            alert('Wish copied to clipboard!')
        }
    }, [recipientName, aiWish])

    return (
        <div className="story-wish">
            {/* Header */}
            <div className="story-header">
                <h1 className="story-title-main">
                    <span className="title-glow">✨</span>
                    AI Story Wish Creator
                    <span className="title-glow">✨</span>
                </h1>
                <p className="story-subtitle">
                    Create magical animated New Year wishes with AI
                </p>
            </div>

            {/* Progress Steps */}
            <div className="progress-steps">
                <div className={`step ${stage === STAGES.UPLOAD ? 'active' : ''} ${stage !== STAGES.UPLOAD ? 'completed' : ''}`}>
                    <span className="step-icon">📸</span>
                    <span className="step-label">Upload</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${stage === STAGES.STYLE ? 'active' : ''} ${[STAGES.GENERATING, STAGES.STORY].includes(stage) ? 'completed' : ''}`}>
                    <span className="step-icon">🎨</span>
                    <span className="step-label">Style</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${stage === STAGES.STORY ? 'active completed' : ''}`}>
                    <span className="step-icon">🎬</span>
                    <span className="step-label">Story</span>
                </div>
            </div>

            {/* UPLOAD STAGE */}
            {stage === STAGES.UPLOAD && (
                <div className="stage-content animate-fade-in">
                    <div className="upload-section">
                        <div className="name-input-wrapper">
                            <label htmlFor="recipientName">Recipient's Name</label>
                            <input
                                id="recipientName"
                                type="text"
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                                placeholder="Enter name for the wish..."
                                className="name-input"
                            />
                        </div>

                        <div
                            className={`upload-zone ${dragActive ? 'drag-active' : ''} ${selectedImage ? 'has-image' : ''}`}
                            onDragEnter={handleDragIn}
                            onDragLeave={handleDragOut}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => !selectedImage && fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                className="file-input"
                            />

                            {selectedImage ? (
                                <div className="preview-container">
                                    <img src={selectedImage} alt="Selected" className="preview-image" />
                                    <button className="remove-btn" onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedImage(null)
                                        setSelectedImageBase64(null)
                                    }}>✕</button>
                                </div>
                            ) : (
                                <div className="upload-prompt">
                                    <div className="upload-icon">📸</div>
                                    <p className="upload-text">Drop photo here</p>
                                    <p className="upload-hint">or</p>
                                    <button
                                        type="button"
                                        className="browse-btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            fileInputRef.current?.click()
                                        }}
                                    >
                                        📁 Browse Files
                                    </button>
                                </div>
                            )}
                        </div>

                        {selectedImage && recipientName.trim() && (
                            <Button
                                variant="primary"
                                size="large"
                                onClick={handleContinue}
                                className="continue-btn"
                            >
                                Choose Style →
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* STYLE STAGE */}
            {stage === STAGES.STYLE && (
                <div className="stage-content animate-fade-in">
                    <div className="selected-preview">
                        <img src={selectedImage} alt="Your photo" />
                        <span className="preview-label">Your Photo</span>
                    </div>

                    <h3 className="section-title">Choose Your Art Style</h3>
                    <div className="style-grid">
                        {Object.values(IMAGE_STYLES).map((style) => (
                            <div
                                key={style.id}
                                className={`style-card ${selectedStyle === style.id ? 'selected' : ''}`}
                                onClick={() => setSelectedStyle(style.id)}
                            >
                                <div className="style-emoji">{style.emoji}</div>
                                <div className="style-name">{style.name}</div>
                                <div className="style-desc">{style.description}</div>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="error-message">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div className="action-buttons">
                        <Button variant="outline" onClick={() => setStage(STAGES.UPLOAD)}>
                            ← Back
                        </Button>
                        <Button
                            variant="primary"
                            size="large"
                            onClick={handleGenerateStory}
                            disabled={!selectedStyle}
                        >
                            ✨ Generate Story Wish
                        </Button>
                    </div>
                </div>
            )}

            {/* GENERATING STAGE */}
            {stage === STAGES.GENERATING && (
                <div className="stage-content animate-fade-in">
                    <div className="generating-container">
                        <div className="magic-animation">
                            <div className="magic-orb"></div>
                            <div className="magic-ring"></div>
                            <div className="magic-ring delay-1"></div>
                            <div className="magic-ring delay-2"></div>
                            <div className="sparkles">
                                {[...Array(12)].map((_, i) => (
                                    <span key={i} className="sparkle" style={{ '--delay': `${i * 0.2}s` }}>✨</span>
                                ))}
                            </div>
                        </div>
                        <p className="loading-step">{loadingStep}</p>
                        <p className="loading-hint">Creating magic for {recipientName}...</p>
                    </div>
                </div>
            )}

            {/* STORY STAGE */}
            {stage === STAGES.STORY && (
                <div className="stage-content animate-fade-in" ref={storyRef}>
                    <div className="story-container">
                        <h2 className="story-headline">{storyTitle}</h2>

                        <div className="story-slideshow">
                            {/* Slide indicators */}
                            <div className="slide-indicators">
                                {[0, 1, 2].map(i => (
                                    <button
                                        key={i}
                                        className={`indicator ${slideIndex === i ? 'active' : ''}`}
                                        onClick={() => setSlideIndex(i)}
                                    />
                                ))}
                            </div>

                            {/* Slides */}
                            <div className="slides-wrapper">
                                {/* Slide 0: Original */}
                                <div className={`slide ${slideIndex === 0 ? 'active' : ''}`}>
                                    <div className="slide-image-wrapper">
                                        <img src={selectedImage} alt="Original" />
                                        <div className="slide-overlay">
                                            <span className="slide-caption">Your Precious Moment</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Slide 1: Transformation */}
                                <div className={`slide ${slideIndex === 1 ? 'active' : ''}`}>
                                    <div className="transformation-view">
                                        <div className="transform-before">
                                            <img src={selectedImage} alt="Before" />
                                        </div>
                                        <div className="transform-arrow">✨→✨</div>
                                        <div className="transform-after">
                                            <img
                                                src={`data:${transformedImage?.mimeType};base64,${transformedImage?.imageBase64}`}
                                                alt="After"
                                            />
                                        </div>
                                    </div>
                                    <span className="slide-caption">Transformed with {IMAGE_STYLES[selectedStyle]?.name} Magic</span>
                                </div>

                                {/* Slide 2: Wish */}
                                <div className={`slide ${slideIndex === 2 ? 'active' : ''}`}>
                                    <div className="wish-slide">
                                        <div className="wish-image-bg">
                                            <img
                                                src={`data:${transformedImage?.mimeType};base64,${transformedImage?.imageBase64}`}
                                                alt="Styled"
                                            />
                                            <div className="wish-overlay"></div>
                                        </div>
                                        <div className="wish-text-container">
                                            <div className="year-badge-story">2026</div>
                                            <p className="wish-text">{aiWish}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <button className="nav-btn prev" onClick={() => setSlideIndex(prev => prev > 0 ? prev - 1 : 2)}>‹</button>
                            <button className="nav-btn next" onClick={() => setSlideIndex(prev => (prev + 1) % 3)}>›</button>
                        </div>

                        {/* Actions */}
                        <div className="story-actions">
                            <Button variant="primary" onClick={handleDownload} icon="📥">
                                Download Image
                            </Button>
                            <Button variant="secondary" onClick={handleShare} icon="📤">
                                Share Wish
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                Create New
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StoryWish
