'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import * as XLSX from 'xlsx'

export async function bulkImportAssets(formData: FormData) {
    try {
        const file = formData.get('file') as File
        if (!file) {
            return { success: false, error: "No file uploaded" }
        }

        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer)
        const worksheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[worksheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
            return { success: false, error: "Empty file" }
        }

        let successCount = 0
        let errors: string[] = []

        // Expected Columns: tag, name, type, serialNumber, model, manufacturer
        // Optional: location, notes

        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i]
            const index = i
            const rowData = row as any

            // Basic Validation
            if (!rowData.tag || !rowData.name) {
                errors.push(`Row ${index + 2}: Missing required fields (Tag/Name)`)
                continue
            }

            try {
                // Check if exists
                const existing = await prisma.asset.findUnique({ where: { tag: String(rowData.tag) } })
                if (existing) {
                    errors.push(`Row ${index + 2}: Asset Tag ${rowData.tag} already exists`)
                    continue
                }

                await prisma.asset.create({
                    data: {
                        tag: String(rowData.tag),
                        name: String(rowData.name),
                        type: rowData.type ? String(rowData.type).toUpperCase() : 'OTHER',
                        serialNumber: rowData.serialNumber ? String(rowData.serialNumber) : null,
                        model: rowData.model ? String(rowData.model) : null,
                        manufacturer: rowData.manufacturer ? String(rowData.manufacturer) : null,
                        notes: rowData.notes ? String(rowData.notes) : "Imported via Bulk Import",
                        status: "AVAILABLE",
                    }
                })
                successCount++
            } catch (err) {
                console.error(`Error importing row ${index}:`, err)
                errors.push(`Row ${index + 2}: Database error`)
            }
        }

        revalidatePath("/assets")

        return {
            success: true,
            count: successCount,
            total: jsonData.length,
            errors: errors.slice(0, 10) // Return first 10 errors to avoid huge payload
        }

    } catch (error) {
        console.error("Bulk import error:", error)
        return { success: false, error: "Failed to process file" }
    }
}
