// Gemini AI Image Style Transformation Service
const GEMINI_API_KEY = 'AIzaSyCChg7ZGsgahu7MFxRav0q2923SoVgu28Y';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent';

// Style prompts for different artistic transformations
export const IMAGE_STYLES = {
    animated: {
        id: 'animated',
        name: 'Animated',
        emoji: '🎬',
        description: 'Disney/Pixar 3D Animation',
        prompt: 'Transform this image into a high-quality Disney Pixar style 3D animated character. Make it colorful, expressive, with smooth rendering and cartoon-like features while maintaining the person\'s likeness and key features.'
    },
    ghibli: {
        id: 'ghibli',
        name: 'Ghibli',
        emoji: '🏯',
        description: 'Studio Ghibli Anime',
        prompt: 'Transform this image into Studio Ghibli anime art style. Use soft watercolor textures, warm and dreamy colors, gentle lighting, and that distinctive Miyazaki aesthetic. Maintain the subject\'s key features while giving it that magical Ghibli feel.'
    },
    cyberpunk: {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        emoji: '🤖',
        description: 'Futuristic Neon Sci-Fi',
        prompt: 'Transform this image into cyberpunk art style. Add neon lights in pink, blue, and purple, futuristic elements, holographic effects, rain-soaked reflections, and a dark urban sci-fi atmosphere. Make it look like a scene from Blade Runner or Cyberpunk 2077.'
    },
    vintage: {
        id: 'vintage',
        name: 'Vintage',
        emoji: '📷',
        description: 'Retro Film Photography',
        prompt: 'Transform this image into a vintage retro photograph style. Add film grain, slightly faded colors, warm sepia tones, light leaks, and that nostalgic 1970s-80s film photography aesthetic. Make it look like an old Polaroid or vintage film photo.'
    },
    fantasy: {
        id: 'fantasy',
        name: 'Fantasy',
        emoji: '✨',
        description: 'Magical Fantasy Art',
        prompt: 'Transform this image into epic fantasy art style. Add magical elements like glowing particles, ethereal lighting, mystical aura, and enchanted atmosphere. Make it look like artwork from a fantasy novel cover or magical game art.'
    },
    watercolor: {
        id: 'watercolor',
        name: 'Watercolor',
        emoji: '🎨',
        description: 'Artistic Watercolor Painting',
        prompt: 'Transform this image into a beautiful watercolor painting. Use soft brush strokes, flowing color blends, subtle paper texture, and that characteristic watercolor transparency and wetness. Make it look like a hand-painted watercolor artwork.'
    }
};

/**
 * Convert a File object to base64 string
 */
export async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Transform an image using Gemini AI with the specified style
 */
export async function transformImageStyle(imageBase64, styleId, mimeType = 'image/jpeg') {
    const style = IMAGE_STYLES[styleId];
    if (!style) {
        throw new Error(`Unknown style: ${styleId}`);
    }

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: style.prompt
                    },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: imageBase64
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            responseModalities: ["image", "text"],
            responseMimeType: "image/png"
        }
    };

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();

        // Extract the generated image from response
        const candidates = data.candidates;
        if (!candidates || candidates.length === 0) {
            throw new Error('No image generated');
        }

        const parts = candidates[0].content?.parts;
        if (!parts) {
            throw new Error('Invalid response format');
        }

        // Find the image part in the response
        const imagePart = parts.find(part => part.inline_data);
        if (!imagePart) {
            throw new Error('No image in response');
        }

        return {
            imageBase64: imagePart.inline_data.data,
            mimeType: imagePart.inline_data.mime_type || 'image/png'
        };
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

/**
 * Download a base64 image
 */
export function downloadImage(base64Data, mimeType, filename) {
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${base64Data}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Text generation API for wishes
const GEMINI_TEXT_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Generate a personalized New Year wish using AI
 */
export async function generatePersonalizedWish(recipientName, imageBase64 = null, mimeType = 'image/jpeg') {
    const prompt = `You are creating a heartfelt, personalized New Year 2026 wish for ${recipientName}. 
    
Create a beautiful, emotional, and inspiring New Year message that:
- Is warm and personal (use their name naturally)
- Mentions hope, dreams, success, and happiness for 2026
- Has a storytelling quality - paint a picture of the wonderful year ahead
- Is 3-4 sentences, poetic but not too formal
- Ends with an encouraging and uplifting note

Return ONLY the wish text, nothing else.`;

    const parts = [{ text: prompt }];

    // If image provided, analyze it for personalization
    if (imageBase64) {
        parts.push({
            inline_data: {
                mime_type: mimeType,
                data: imageBase64
            }
        });
    }

    const requestBody = {
        contents: [{ parts }],
        generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 200
        }
    };

    try {
        const response = await fetch(`${GEMINI_TEXT_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No wish generated');
        }

        return text.trim();
    } catch (error) {
        console.error('Wish generation error:', error);
        // Fallback wish
        return `Dear ${recipientName}, as 2026 dawns with endless possibilities, may your journey be filled with extraordinary moments of joy, success, and love. Here's to a year where every dream you hold dear finds its way to you. Wishing you a magical and prosperous New Year! ✨`;
    }
}

/**
 * Generate a story narrative for the image
 */
export async function generateStoryNarrative(recipientName) {
    const narratives = [
        `✨ A New Chapter Begins for ${recipientName} ✨`,
        `🌟 ${recipientName}'s Journey into 2026 🌟`,
        `🎆 Celebrating ${recipientName}'s New Year Magic 🎆`,
        `💫 ${recipientName}'s Story of Hope & Dreams 💫`
    ];
    return narratives[Math.floor(Math.random() * narratives.length)];
}
