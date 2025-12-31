import { useEffect, useState } from 'react'
import './ImageCollage.css'

// Using high-quality Unsplash images for festive theme
const COLLAGE_IMAGES = [
    {
        id: 1,
        src: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=600&h=400&fit=crop',
        alt: 'Fireworks celebration'
    },
    {
        id: 2,
        src: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=600&h=400&fit=crop',
        alt: 'Golden sparkles and lights'
    },
    {
        id: 3,
        src: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop',
        alt: 'New Year party celebration'
    },
    {
        id: 4,
        src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop',
        alt: 'Festive bokeh lights'
    }
]

function ImageCollage() {
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        // Trigger animation after component mounts
        const timer = setTimeout(() => setLoaded(true), 100)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className={`image-collage ${loaded ? 'loaded' : ''}`}>
            {COLLAGE_IMAGES.map((image, index) => (
                <div
                    key={image.id}
                    className={`collage-item collage-item-${index + 1} animate-slide-up stagger-${index + 1}`}
                >
                    <img
                        src={image.src}
                        alt={image.alt}
                        loading="eager"
                    />
                    <div className="collage-overlay" />
                </div>
            ))}
        </div>
    )
}

export default ImageCollage
