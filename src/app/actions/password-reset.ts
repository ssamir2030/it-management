'use server'

import prisma from '@/lib/prisma'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

// توليد كود عشوائي من 6 أرقام
function generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// توليد توكن آمن
function generateToken(): string {
    return crypto.randomBytes(32).toString('hex')
}

// إرسال طلب استعادة كلمة المرور
export async function requestPasswordReset(email: string) {
    try {
        // التحقق من وجود المستخدم
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            // لا نكشف إذا كان البريد موجود أم لا (للأمان)
            return {
                success: true,
                message: 'إذا كان البريد مسجلاً، ستصلك رسالة بكود الاستعادة'
            }
        }

        // حذف أي توكنات سابقة لهذا البريد
        await prisma.passwordResetToken.deleteMany({
            where: { email }
        })

        // توليد كود جديد
        const resetCode = generateResetCode()
        const token = generateToken()
        const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 دقيقة

        // حفظ في قاعدة البيانات
        await prisma.passwordResetToken.create({
            data: {
                email,
                token: `${token}:${resetCode}`,
                expires
            }
        })

        // إعداد البريد
        const smtpHost = process.env.SMTP_HOST
        const smtpPort = process.env.SMTP_PORT
        const smtpUser = process.env.SMTP_USER
        const smtpPass = process.env.SMTP_PASS
        const smtpFrom = process.env.SMTP_FROM

        if (!smtpHost || !smtpUser || !smtpPass) {
            console.error('SMTP not configured')
            return { success: false, error: 'إعدادات البريد غير مكتملة' }
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort || '587'),
            secure: smtpPort === '465',
            auth: {
                user: smtpUser,
                pass: smtpPass
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        // إرسال البريد
        await transporter.sendMail({
            from: smtpFrom || smtpUser,
            to: email,
            subject: 'استعادة كلمة المرور - نظام إدارة تقنية المعلومات',
            html: `
            <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); border-radius: 16px; overflow: hidden;">
                <div style="padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0 0 10px; font-size: 24px;">🔐 استعادة كلمة المرور</h1>
                    <p style="color: #94a3b8; margin: 0; font-size: 14px;">نظام إدارة تقنية المعلومات</p>
                </div>
                
                <div style="background: #ffffff; padding: 40px 30px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
                        مرحباً <strong>${user.name}</strong>،<br/>
                        لقد تلقينا طلباً لاستعادة كلمة المرور الخاصة بحسابك.
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
                        <p style="color: #bfdbfe; margin: 0 0 10px; font-size: 14px;">كود الاستعادة</p>
                        <h2 style="color: #ffffff; margin: 0; font-size: 36px; letter-spacing: 8px; font-family: monospace;">${resetCode}</h2>
                    </div>
                    
                    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                        <p style="color: #92400e; margin: 0; font-size: 14px;">
                            ⏰ <strong>ينتهي الكود خلال 15 دقيقة</strong>
                        </p>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
                        إذا لم تطلب استعادة كلمة المرور، يمكنك تجاهل هذه الرسالة.
                    </p>
                </div>
                
                <div style="padding: 20px 30px; text-align: center; background: #f1f5f9;">
                    <p style="color: #64748b; margin: 0; font-size: 12px;">
                        نظام إدارة تقنية المعلومات © ${new Date().getFullYear()}
                    </p>
                </div>
            </div>
            `
        })

        return {
            success: true,
            message: 'تم إرسال كود الاستعادة إلى بريدك الإلكتروني',
            token // نحتاج التوكن للتحقق لاحقاً
        }

    } catch (error) {
        console.error('Password reset error:', error)
        return { success: false, error: 'حدث خطأ أثناء إرسال البريد' }
    }
}

// التحقق من الكود وإعادة ضبط كلمة المرور
export async function resetPassword(email: string, code: string, newPassword: string) {
    try {
        // التحقق من طول كلمة المرور
        if (newPassword.length < 6) {
            return { success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
        }

        // البحث عن التوكن
        const resetToken = await prisma.passwordResetToken.findFirst({
            where: {
                email,
                used: false,
                expires: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        })

        if (!resetToken) {
            return { success: false, error: 'الكود غير صحيح أو منتهي الصلاحية' }
        }

        // التحقق من الكود
        const [, storedCode] = resetToken.token.split(':')
        if (storedCode !== code) {
            return { success: false, error: 'الكود غير صحيح' }
        }

        // تحديث كلمة المرور
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        })

        // تعليم التوكن كمستخدم
        await prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { used: true }
        })

        return { success: true, message: 'تم تغيير كلمة المرور بنجاح' }

    } catch (error) {
        console.error('Reset password error:', error)
        return { success: false, error: 'حدث خطأ أثناء تغيير كلمة المرور' }
    }
}
