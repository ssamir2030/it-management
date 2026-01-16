'use server'

import { revalidatePath } from "next/cache"
import fs from 'fs'
import path from 'path'

export async function restoreBackup(formData: FormData) {
    try {
        const file = formData.get('backupFile') as File

        if (!file) {
            return { success: false, error: "No file provided" }
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')

        // Create a backup of the current db before overwriting
        if (fs.existsSync(dbPath)) {
            fs.copyFileSync(dbPath, `${dbPath}.old`)
        }

        fs.writeFileSync(dbPath, buffer)

        revalidatePath('/')
        return { success: true, message: "Database restored successfully" }
    } catch (error) {
        console.error(error)
        return { success: false, error: "Failed to restore database" }
    }
}
