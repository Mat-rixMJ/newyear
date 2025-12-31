import { Link } from 'react-router-dom'
import SimpleWish from '../components/SimpleWish'
import './ImageStylerPage.css'

function ImageStylerPage() {
    return (
        <main className="styler-page">
            <div className="container">
                <Link to="/" className="back-link animate-fade-in">
                    ← Back to Home
                </Link>

                <SimpleWish />
            </div>
        </main>
    )
}

export default ImageStylerPage
