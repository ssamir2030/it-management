'use server'

export async function translateArabicToEnglish(text: string) {
    if (!text) return { success: false, error: 'النص فارغ' }

    try {
        const response = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`
        )

        if (!response.ok) {
            throw new Error('Translation failed')
        }

        const data = await response.json()
        const translatedText = data[0][0][0]

        return { success: true, data: translatedText }
    } catch (error) {
        console.error('Translation error:', error)
        return { success: false, error: 'فشلت الترجمة' }
    }
}
