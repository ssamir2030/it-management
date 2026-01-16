"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/simple-auth"
import { hasPermission } from "@/lib/rbac"
import { logEvent } from "@/lib/system-log"
import { revalidatePath } from "next/cache"
import nodemailer from "nodemailer"

// =========================================================
// SETTINGS CRUD
// =========================================================

export async function getSystemSettings(keys: string[]) {
    const session = await getSession()
    if (!session?.role || (!hasPermission(session.role as string, 'manage_settings') && !hasPermission(session.role as string, 'view_settings'))) return { success: false, error: "Unauthorized" }

    try {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: keys }
            }
        })

        // Convert to Key-Value object
        const settingsMap: Record<string, string> = {}
        settings.forEach(s => {
            settingsMap[s.key] = s.value
        })

        return { success: true, data: settingsMap }
    } catch (error) {
        return { success: false, error: "Failed to fetch settings" }
    }
}

export async function saveSystemSettings(settings: Record<string, string>) {
    const session = await getSession()
    if (!session?.role || !hasPermission(session.role as string, 'manage_settings')) return { success: false, error: "Unauthorized" }

    try {
        // Upsert all settings
        const transactions = Object.entries(settings).map(([key, value]) =>
            prisma.systemSetting.upsert({
                where: { key },
                update: { value, updatedBy: session.id },
                create: { key, value, updatedBy: session.id }
            })
        )

        await prisma.$transaction(transactions)

        await logEvent('UPDATE', 'SETTINGS', 'تم تحديث إعدادات النظام (الإشعارات/البريد)')

        revalidatePath('/admin/settings')
        return { success: true }
    } catch (error) {
        console.error("Save Settings Error:", error)
        return { success: false, error: "Failed to save settings" }
    }
}

// =========================================================
// EMAIL TESTING
// =========================================================

type SMTPConfig = {
    host: string
    port: string
    user: string
    pass: string
    secure: string // "true" or "false"
    from: string
}

export async function testSMTPConnection(config: SMTPConfig, testEmail: string) {
    const session = await getSession()
    if (!session?.role || !hasPermission(session.role as string, 'manage_settings')) return { success: false, error: "Unauthorized" }

    try {
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: parseInt(config.port),
            secure: config.secure === "true",
            auth: {
                user: config.user,
                pass: config.pass,
            },
            tls: {
                rejectUnauthorized: false // Often needed for internal servers
            }
        })

        await transporter.verify()

        // Send actual test email
        await transporter.sendMail({
            from: config.from,
            to: testEmail,
            subject: "تجربة إعدادات البريد الإلكتروني - نظام إدارة تقنية المعلومات",
            html: `
            <div dir="rtl" style="font-family: sans-serif; background-color: #f3f4f6; padding: 20px;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #1e40af; margin-top: 0;">نجاح التجربة! 🎉</h2>
                    <p style="color: #374151; font-size: 16px;">
                        هذه رسالة اختبار للتأكد من صحة إعدادات خادم البريد (SMTP) في نظام إدارة تقنية المعلومات.
                    </p>
                    <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 6px; padding: 10px; margin-top: 20px;">
                        <strong style="color: #047857;">الحالة:</strong> متصل بنجاح
                    </div>
                </div>
            </div>
            `
        })

        return { success: true }
    } catch (error) {
        console.error("SMTP Test Error:", error)
        return { success: false, error: (error as Error).message }
    }
}
