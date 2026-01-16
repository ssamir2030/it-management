'use server'

import prisma from "@/lib/prisma"
import { getCompanyProfile } from "./system"

export async function getEmployeeCustodyForBarcode(employeeId: string) {
    try {
        const items = await prisma.custodyItem.findMany({
            where: { employeeId },
            include: {
                asset: true,
                employee: true
            }
        })
        return { success: true, data: items }
    } catch (error) {
        console.error("Error fetching employee custody:", error)
        return { success: false, error: "فشل جلب عهد الموظف" }
    }
}

export async function getCustodyItemForPrint(id: string) {
    try {
        const item = await prisma.custodyItem.findUnique({
            where: { id },
            include: {
                asset: true,
                employee: {
                    include: {
                        department: true
                    }
                }
            }
        }) as any

        if (!item) return { success: false, error: "العنصر غير موجود" }

        const companyRes = await getCompanyProfile()
        const companyData = companyRes.data as { nameAr?: string } | undefined
        const companyName = companyRes.success && companyData ? companyData.nameAr || "IT Asset Management" : "IT Asset Management"

        const assetTypeMap: Record<string, string> = {
            'LAPTOP': 'لابتوب',
            'DESKTOP': 'كمبيوتر مكتبي',
            'SERVER': 'خادم',
            'MONITOR': 'شاشة',
            'PRINTER': 'طابعة',
            'PHONE': 'هاتف',
            'TABLET': 'جهاز لوحي',
            'NETWORK': 'جهاز شبكة',
            'OTHER': 'جهاز'
        }

        const rawType = item.asset?.type || "OTHER"
        const assetType = assetTypeMap[rawType] || rawType



        return {
            success: true,
            data: {
                companyName: companyName,
                assetName: item.asset?.name || item.name || "Unknown Asset",
                assetType: assetType,
                assetTag: item.asset?.tag || "NO-TAG",
                serialNumber: item.asset?.serialNumber || "",
                employeeName: item.employee?.name || "Unknown Employee",
                department: item.employee?.department?.name || "General",
                date: item.assignedDate
            }
        }
    } catch (error) {
        console.error("Error fetching custody item for print:", error)
        return { success: false, error: "فشل جلب بيانات الطباعة" }
    }
}
