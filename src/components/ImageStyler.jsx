import { useState, useRef, useCallback } from 'react'
import { IMAGE_STYLES, fileToBase64, transformImageStyle, downloadImage } from '../services/geminiService'
import Button from './Button'
import './ImageStyler.css'

function ImageStyler() {
    const [selectedImage, setSelectedImage] = useState(null)
    const [selectedImageBase64, setSelectedImageBase64] = useState(null)
    const [selectedMimeType, setSelectedMimeType] = useState(null)
    const [selectedStyle, setSelectedStyle] = useState(null)
    const [transformedImage, setTransformedImage] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef(null)

    const handleFileSelect = useCallback(async (file) => {
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file')
            return
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Image size should be less than 10MB')
            return
        }

        setError(null)
        setTransformedImage(null)
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
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0])
        }
    }, [handleFileSelect])

    const handleInputChange = useCallback((e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0])
        }
    }, [handleFileSelect])

    const handleTransform = useCallback(async () => {
        if (!selectedImageBase64 || !selectedStyle) return

        setIsLoading(true)
        setError(null)

        try {
            const result = await transformImageStyle(selectedImageBase64, selectedStyle, selectedMimeType)
            setTransformedImage(result)
        } catch (err) {
            setError(err.message || 'Failed to transform image. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }, [selectedImageBase64, selectedStyle, selectedMimeType])

    const handleDownload = useCallback(() => {
        if (!transformedImage) return
        const styleName = IMAGE_STYLES[selectedStyle]?.name || 'styled'
        downloadImage(transformedImage.imageBase64, transformedImage.mimeType, `${styleName.toLowerCase()}-image.png`)
    }, [transformedImage, selectedStyle])

    const handleReset = useCallback(() => {
        setSelectedImage(null)
        setSelectedImageBase64(null)
        setSelectedMimeType(null)
        setSelectedStyle(null)
        setTransformedImage(null)
        setError(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [])

    return (
        <div className="image-styler">
            <div className="styler-header">
                <h2 className="styler-title">
                    <span className="title-icon">🎨</span>
                    AI Image Styler
                </h2>
                <p className="styler-subtitle">
                    Transform your photos into stunning artistic styles using AI magic
                </p>
            </div>

            {/* Upload Section */}
            <div
                className={`upload-zone ${dragActive ? 'drag-active' : ''} ${selectedImage ? 'has-image' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !selectedImage && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="file-input"
                />

                {selectedImage ? (
                    <div className="preview-container">
                        <img src={selectedImage} alt="Selected" className="preview-image" />
                        <button className="remove-btn" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
                            ✕
                        </button>
                    </div>
                ) : (
                    <div className="upload-prompt">
                        <div className="upload-icon">📸</div>
                        <p className="upload-text">Drop your image here or click to upload</p>
                        <p className="upload-hint">Supports JPG, PNG, WebP (max 10MB)</p>
                    </div>
                )}
            </div>

            {/* Style Selection */}
            {selectedImage && (
                <div className="style-section animate-slide-up">
                    <h3 className="section-title">Choose Your Style</h3>
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
                </div>
            )}

            {/* Transform Button */}
            {selectedImage && selectedStyle && !transformedImage && (
                <div className="action-section animate-fade-in">
                    <Button
                        variant="primary"
                        size="large"
                        onClick={handleTransform}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Transforming...
                            </>
                        ) : (
                            <>✨ Transform Image</>
                        )}
                    </Button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="loading-section">
                    <div className="loading-animation">
                        <div className="magic-circle"></div>
                        <div className="magic-sparkles">✨</div>
                    </div>
                    <p className="loading-text">AI is working its magic...</p>
                    <p className="loading-hint">This may take 10-30 seconds</p>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="error-message animate-shake">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {/* Result Section */}
            {transformedImage && (
                <div className="result-section animate-scale-in">
                    <h3 className="section-title">🎉 Your Transformed Image</h3>
                    <div className="result-container">
                        <div className="comparison-view">
                            <div className="image-box original">
                                <span className="image-label">Original</span>
                                <img src={selectedImage} alt="Original" />
                            </div>
                            <div className="arrow">→</div>
                            <div className="image-box transformed">
                                <span className="image-label">{IMAGE_STYLES[selectedStyle]?.name}</span>
                                <img
                                    src={`data:${transformedImage.mimeType};base64,${transformedImage.imageBase64}`}
                                    alt="Transformed"
                                />
                            </div>
                        </div>
                        <div className="result-actions">
                            <Button variant="primary" size="medium" onClick={handleDownload} icon="📥">
                                Download
                            </Button>
                            <Button variant="secondary" size="medium" onClick={() => setTransformedImage(null)}>
                                Try Another Style
                            </Button>
                            <Button variant="outline" size="medium" onClick={handleReset}>
                                New Image
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ImageStyler
