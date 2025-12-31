import { useEffect, useState } from 'react'
import './Confetti.css'

function Confetti() {
    const [particles, setParticles] = useState([])

    useEffect(() => {
        const colors = ['#FFD700', '#7B2CBF', '#3B5CB8', '#FF6B9D', '#00D9FF', '#FF8C42']
        const newParticles = []

        // Reduced from 50 to 20 for better performance
        for (let i = 0; i < 20; i++) {
            newParticles.push({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * 5,
                duration: 3 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 4 + Math.random() * 8,
                type: Math.random() > 0.5 ? 'circle' : 'rect'
            })
        }

        setParticles(newParticles)
    }, [])

    return (
        <div className="confetti-container" aria-hidden="true">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className={`confetti-particle confetti-${particle.type}`}
                    style={{
                        left: `${particle.left}%`,
                        animationDelay: `${particle.delay}s`,
                        animationDuration: `${particle.duration}s`,
                        backgroundColor: particle.color,
                        width: particle.size,
                        height: particle.type === 'rect' ? particle.size * 0.4 : particle.size,
                    }}
                />
            ))}

            {/* Reduced sparkles for performance */}
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={`sparkle-${i}`}
                    className="sparkle"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                    }}
                />
            ))}
        </div>
    )
}

export default Confetti
