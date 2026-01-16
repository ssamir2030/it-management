'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createTechnicalDetails(formData: FormData) {
    try {
        const data = {
            assetId: formData.get('assetId') as string,
            // employeeId is now optional, we can skip it or set it if needed
            computerName: formData.get('computerName') as string,
            domainName: formData.get('domainName') as string,
            brand: formData.get('brand') as string,
            processor: formData.get('processor') as string,
            ram: formData.get('ram') as string,
            storage: formData.get('storage') as string,
            serialNumber: formData.get('serialNumber') as string,
            macAddress: formData.get('macAddress') as string,
            pcUserName: formData.get('pcUserName') as string,
            management: formData.get('management') as string,
            supportId: formData.get('supportId') as string,
            os: formData.get('os') as string,
            osKey: formData.get('osKey') as string,
            office: formData.get('office') as string,
            officeKey: formData.get('officeKey') as string,
            installationDate: new Date(formData.get('installationDate') as string),
        }

        await prisma.assetTechnicalDetails.create({
            data
        })

        revalidatePath('/technical-details')
        return { success: true }
    } catch (error: any) {
        console.error("Error creating technical details:", error)
        // Check for unique constraint violation on assetId
        if (error.code === 'P2002') {
            return { success: false, error: "يوجد بالفعل تفاصيل فنية لهذا الجهاز" }
        }
        return { success: false, error: "فشل حفظ التفاصيل الفنية" }
    }
}

export async function getTechnicalDetailsList() {
    try {
        const items = await prisma.assetTechnicalDetails.findMany({
            include: {
                asset: {
                    select: {
                        name: true,
                        tag: true
                    }
                },
                employee: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { installationDate: 'desc' }
        })
        return { success: true, data: items }
    } catch (error) {
        console.error("Error fetching technical details:", error)
        return { success: false, error: "فشل جلب القائمة" }
    }
}

export async function deleteTechnicalDetails(id: string) {
    try {
        await prisma.assetTechnicalDetails.delete({
            where: { id }
        })
        revalidatePath('/technical-details')
        return { success: true }
    } catch (error) {
        return { success: false, error: "فشل الحذف" }
    }
}
