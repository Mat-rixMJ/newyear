import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useRef, useCallback } from 'react'
import html2canvas from 'html2canvas'
import Button from '../components/Button'
import ImageCollage from '../components/ImageCollage'
import './WishPage.css'

const DEFAULT_MESSAGES = [
    "May this year bring you endless joy, success, and happiness!",
    "Wishing you a spectacular year filled with amazing moments!",
    "Here's to new beginnings and wonderful adventures ahead!",
    "May all your dreams come true in this new year!"
]

function WishPage() {
    const { name } = useParams()
    const [searchParams] = useSearchParams()
    const customMessage = searchParams.get('message')
    const wishRef = useRef(null)

    const decodedName = decodeURIComponent(name || 'Friend')
    const displayMessage = customMessage
        ? decodeURIComponent(customMessage)
        : DEFAULT_MESSAGES[Math.floor(Math.random() * DEFAULT_MESSAGES.length)]

    const currentUrl = window.location.href

    const handleWhatsAppShare = useCallback(() => {
        const text = `🎉 Happy New Year 2026, ${decodedName}! ${displayMessage}\n\nCheck out your personalized wish: ${currentUrl}`
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
        window.open(whatsappUrl, '_blank')
    }, [decodedName, displayMessage, currentUrl])

    const handleCopyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(currentUrl)
            alert('Link copied to clipboard! 🎉')
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = currentUrl
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            alert('Link copied to clipboard! 🎉')
        }
    }, [currentUrl])

    const handleDownload = useCallback(async () => {
        if (!wishRef.current) return

        try {
            const canvas = await html2canvas(wishRef.current, {
                backgroundColor: '#1a1a2e',
                scale: 2,
                useCORS: true,
                allowTaint: true
            })

            const link = document.createElement('a')
            link.download = `new-year-wish-${decodedName}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()
        } catch (err) {
            console.error('Download failed:', err)
            alert('Download failed. Please try taking a screenshot instead.')
        }
    }, [decodedName])

    return (
        <main className="wish-page">
            <div className="container">
                <Link to="/" className="back-link animate-fade-in">
                    ← Create Another Wish
                </Link>

                <div className="wish-content" ref={wishRef}>
                    <div className="wish-header animate-slide-up">
                        <div className="year-badge">2026</div>
                        <h1 className="wish-title">
                            Happy New Year,
                            <span className="name-highlight"> {decodedName}</span> 🎆
                        </h1>
                        <p className="wish-message">{displayMessage}</p>
                    </div>

                    <ImageCollage />
                </div>

                <div className="share-section animate-slide-up stagger-4">
                    <h3 className="share-title">Share Your Wish</h3>
                    <div className="share-buttons">
                        <Button
                            variant="whatsapp"
                            size="medium"
                            onClick={handleWhatsAppShare}
                            icon="📱"
                        >
                            WhatsApp
                        </Button>

                        <Button
                            variant="secondary"
                            size="medium"
                            onClick={handleCopyLink}
                            icon="🔗"
                        >
                            Copy Link
                        </Button>

                        <Button
                            variant="outline"
                            size="medium"
                            onClick={handleDownload}
                            icon="📥"
                        >
                            Download
                        </Button>
                    </div>
                </div>

                <div className="ad-placeholder animate-fade-in">
                    📢 Advertisement Space
                </div>
            </div>
        </main>
    )
}

export default WishPage
