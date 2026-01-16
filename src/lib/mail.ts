import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
})

export async function sendMail({
    to,
    subject,
    html,
}: {
    to: string
    subject: string
    html: string
}) {
    try {
        // التحقق من وجود إعدادات البريد
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.warn('SMTP credentials not found. Email sending skipped.')
            return { success: false, error: 'SMTP credentials missing' }
        }

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"IT Support System" <noreply@company.com>',
            to,
            subject,
            html,
        })


        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error('Error sending email:', error)
        return { success: false, error }
    }
}
