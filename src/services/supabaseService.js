import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://unkturcghwltfhgozafq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVua3R1cmNnaHdsdGZoZ296YWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyMDAyOTIsImV4cCI6MjA4Mjc3NjI5Mn0.PxSRkhhC_tc3DSUwSZgtbZxHEQ5Jjndo8JjT48_rexk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 10)

// Upload images to Supabase Storage
export async function uploadImages(files) {
    const imageUrls = []

    for (const file of files) {
        const fileName = `${generateId()}_${file.name}`
        const { data, error } = await supabase.storage
            .from('wishes')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            console.error('Upload error:', error)
            continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('wishes')
            .getPublicUrl(fileName)

        if (urlData) {
            imageUrls.push(urlData.publicUrl)
        }
    }

    return imageUrls
}

// Save wish to database
export async function saveWish(name, message, imageUrls) {
    const wishId = generateId()

    const { data, error } = await supabase
        .from('wishes')
        .insert([{
            id: wishId,
            name: name,
            message: message,
            images: imageUrls,
            created_at: new Date().toISOString()
        }])
        .select()

    if (error) {
        console.error('Save error:', error)
        throw error
    }

    return wishId
}

// Get wish by ID
export async function getWish(wishId) {
    const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .eq('id', wishId)
        .single()

    if (error) {
        console.error('Fetch error:', error)
        return null
    }

    return data
}
