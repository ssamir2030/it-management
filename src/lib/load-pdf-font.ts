import { jsPDF } from "jspdf"

// URL for a reliable Arabic font (Amiri)
const FONT_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf'

export async function loadArabicFont(doc: jsPDF) {
    try {
        const response = await fetch(FONT_URL)
        if (!response.ok) {
            throw new Error(`Failed to fetch font: ${response.statusText}`)
        }
        const buffer = await response.arrayBuffer()
        const fontBase64 = arrayBufferToBase64(buffer)

        doc.addFileToVFS('Amiri-Regular.ttf', fontBase64)
        doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal')
        doc.setFont('Amiri')
        return true
    } catch (error) {
        console.error('Error loading Arabic font:', error)
        // Fallback or notify user
        return false
    }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
}
