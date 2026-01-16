import nodemailer from 'nodemailer'

interface SendEmailOptions {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    // 1. Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn('⚠️ SMTP not configured. Email not sent:', { to, subject })
        return { success: false, error: 'SMTP Configuration Missing' }
    }

    try {
        // 2. Create Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        })

        // 3. Send Email
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'IT Asset System'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        })

        console.log('✅ Email sent:', info.messageId)
        return { success: true, messageId: info.messageId }

    } catch (error) {
        console.error('❌ Failed to send email:', error)
        return { success: false, error: 'Failed to send email' }
    }
}
