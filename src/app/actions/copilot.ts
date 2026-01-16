'use server'

import prisma from "@/lib/prisma"

type CopilotResponse = {
    text: string
    data?: any
    type?: 'text' | 'table' | 'stat' | 'list' | 'action'
}

export async function querySystemCopilot(question: string): Promise<CopilotResponse> {
    try {
        // Normalize: remove diacritics (tashkeel), special chars, and lower case
        const q = question.toLowerCase()
            .replace(/[^\w\s\u0600-\u06FF\-]/g, '') // Keep Arabic, alphanumeric, AND hyphen for tags
            .trim()

        // Helper for simple keyword matching (fuzzy-ish)
        const has = (...words: string[]) => words.some(w => q.includes(w))
        const hasAll = (...words: string[]) => words.every(w => q.includes(w))

        // =========================================================
        // -2. SYSTEM MAP / MENU TREE (Priority over generic "System")
        // =========================================================
        if (has("شجرة", "قوائم", "خريطة", "tree", "map", "structure", "menu", "menus")) {
            return {
                text: "📂 إليك هيكلة قوائم النظام الكاملة:",
                type: 'list',
                data: [
                    { label: "🖥️ لوحة المعلومات", value: "Dashboard (نظرة عامة)" },
                    { label: "📦 المخزون والأصول", value: "Inventory (الأجهزة، العهد، الكرفانات)" },
                    { label: "👥 الموظفين", value: "Employees (إدارة الموظفين، الهيكل التنظيمي)" },
                    { label: "🎫 الدعم الفني", value: "Help Desk (التذاكر، الصيانة)" },
                    { label: "📅 الخطة التشغيلية", value: "Operational Plan (المشاريع، الميزانية)" },
                    { label: "🔍 اكتشاف الشبكة", value: "Network Discovery (فحص الأجهزة المتصلة)" },
                    { label: "📚 المعرفة والتدريب", value: "Knowledge Base (الدورات، المقالات)" },
                    { label: "📊 التقارير", value: "Reports (تقارير الأداء، الأصول)" },
                    { label: "⚙️ الإعدادات", value: "Settings (المستخدمين، الصلاحيات، النظام)" },
                ]
            }
        }

        // =========================================================
        // -1. OPERATIONAL PLAN INTELLIGENCE (Priority)
        // =========================================================
        if (has("خطة", "تشغيلية", "مشروع", "مشاريع", "plan", "project")) {
            // Projects Count
            if (has("كم", "عدد", "count")) {
                const currentYear = new Date().getFullYear()
                const count = await prisma.operationalActivity.count({
                    where: { planYear: { year: currentYear } }
                })

                return {
                    text: `عدد المشاريع/الأنشطة في الخطة التشغيلية لعام ${currentYear} هو ${count}.`,
                    type: 'stat',
                    data: { label: `مشاريع ${currentYear}`, value: count }
                }
            }

            // Link to Plan
            return {
                text: "يمكنك استعراض تفاصيل الخطة التشغيلية من هنا:",
                type: 'action',
                data: { label: "فتح الخطة التشغيلية", action: "navigate", url: "/admin/operational-plan" }
            }
        }

        // =========================================================
        // 0. NAVIGATION INTENT (Go To...)
        // =========================================================
        if (has("اذهب", "افتح", "عرض", "open", "go to", "navigate")) {
            if (has("مستخدمين", "users")) return { text: "جاري نقلك إلى إدارة المستخدمين...", type: 'action', data: { label: "فتح المستخدمين", action: "navigate", url: "/admin/settings/users" } }
            if (has("موظفين", "employees")) return { text: "تفضل، هذا رابط سريع للموظفين:", type: 'action', data: { label: "فتح الموظفين", action: "navigate", url: "/employees" } }
            if (has("مخزون", "inventory")) return { text: "صفحة المخزون جاهزة:", type: 'action', data: { label: "فتح المخزون", action: "navigate", url: "/admin/inventory" } }
            if (has("تذاكر", "support", "tickets")) return { text: "عرض التذاكر والدعم الفني:", type: 'action', data: { label: "فتح التذاكر", action: "navigate", url: "/admin/support" } }
            if (has("اعدادات", "settings")) return { text: "الإعدادات العامة للنظام:", type: 'action', data: { label: "الإعدادات", action: "navigate", url: "/admin/settings" } }
            if (has("تقارير", "reports")) return { text: "قسم التقارير والتحليلات:", type: 'action', data: { label: "فتح التقارير", action: "navigate", url: "/admin/reports" } }
        }

        // =========================================================
        // 1. ACTION INTENT (Create/Add...)
        // =========================================================
        if (has("انشاء", "اضافة", "جديد", "create", "add", "new")) {
            if (has("مستخدم", "user")) return { text: "يمكنك إضافة مستخدم جديد من هنا:", type: 'action', data: { label: "إضافة مستخدم", action: "navigate", url: "/admin/settings/users/new" } }
            if (has("موظف", "employee")) return { text: "نموذج إضافة موظف جديد:", type: 'action', data: { label: "إضافة موظف", action: "navigate", url: "/employees/new" } }
            if (has("اصل", "جهاز", "asset", "device")) return { text: "تسجيل أصل جديد في المخزون:", type: 'action', data: { label: "إضافة أصل", action: "navigate", url: "/admin/inventory/new" } }
            if (has("تذكرة", "بلاغ", "ticket")) return { text: "فتح تذكرة دعم فني:", type: 'action', data: { label: "إنشاء تذكرة", action: "navigate", url: "/portal" } } // Portal usually handles new tickets
        }

        // =========================================================
        // 2. DIRECT ASSET LOOKUP (Tag Match)
        // =========================================================
        const tagMatch = q.match(/([a-z]{2,4}-\d+)/i)
        if (tagMatch) {
            const tag = tagMatch[0].toUpperCase()
            const asset = await prisma.asset.findUnique({
                where: { tag },
                include: { employee: true, location: true, category: true }
            })

            if (asset) {
                return {
                    text: `✅ وجدت الأصل المطلوب (${tag}):`,
                    type: 'list',
                    data: [
                        { label: "الجهاز", value: asset.name },
                        { label: "الموديل", value: asset.model || "-" },
                        { label: "الحالة", value: asset.status },
                        { label: "المستخدم الحالي", value: asset.employee?.name || "في المستودع" },
                        { label: "الموقع", value: asset.location?.name || "-" },
                    ]
                }
            } else {
                return { text: `لم أجد أي جهاز بهذا الرقم (${tag}) ❌` }
            }
        }

        // =========================================================
        // 2.1. SYSTEM MAP (New Block - Moved Higher)
        // =========================================================
        if (has("خريطة النظام", "system map", "مكونات النظام")) {
            return {
                text: "هذه خريطة توضيحية لمكونات النظام الرئيسية:",
                type: 'list',
                data: [
                    { label: "إدارة المستخدمين", value: "مسؤوليات وصلاحيات" },
                    { label: "إدارة الأصول", value: "تتبع الأجهزة والمخزون" },
                    { label: "إدارة الموظفين", value: "بيانات الموظفين والأقسام" },
                    { label: "الدعم الفني", value: "تذاكر ومشاكل" },
                    { label: "التقارير والتحليلات", value: "إحصائيات وأداء" },
                ]
            }
        }

        // =========================================================
        // 2.2. OPERATIONAL PLAN (New Block - Moved Higher)
        // =========================================================
        if (has("خطة تشغيل", "operational plan", "خطوات العمل")) {
            return {
                text: "الخطة التشغيلية الحالية تركز على:",
                type: 'list',
                data: [
                    { label: "تحسين أداء قاعدة البيانات", value: "المرحلة الأولى" },
                    { label: "تطوير واجهة المستخدم", value: "المرحلة الثانية" },
                    { label: "توسيع ميزات الكوبيلوت", value: "المرحلة الثالثة" },
                ]
            }
        }

        // =========================================================
        // 3. EMPLOYEE & GLOBAL SEARCH
        // =========================================================
        if (has("من هو", "بحث عن", "find", "search", "who is") || q.length > 3) {
            // If query is explicitly about an employee
            if (has("موظف", "employee")) {
                const nameQuery = q.replace(/بحث عن|موظف|بيانات|معلومات/g, '').trim()
                const employees = await prisma.employee.findMany({
                    where: { OR: [{ name: { contains: nameQuery } }, { email: { contains: nameQuery } }] },
                    take: 5
                })
                if (employees.length > 0) {
                    return {
                        text: `وجدت ${employees.length} موظف مطابق:`,
                        type: 'list',
                        data: employees.map(e => ({ label: e.name, value: e.jobTitle || "موظف" }))
                    }
                }
            }

            // Global Search (if query is specific enough)
            // If the user types a specific name directly like "Ahmed" without keywords, we try to guess
            if (!has("كم", "عدد", "how", "count", "status")) {
                const employees = await prisma.employee.findMany({
                    where: { OR: [{ name: { contains: q } }, { email: { contains: q } }] },
                    take: 3
                })

                if (employees.length > 0) {
                    return {
                        text: `يبدو أنك تبحث عن موظف. وجدت هؤلاء:`,
                        type: 'list',
                        data: employees.map(e => ({ label: e.name, value: e.jobTitle || "موظف" }))
                    }
                }
            }
        }


        // =========================================================
        // 4. DEPARTMENT INTELLIGENCE
        // =========================================================
        if (has("قسم", "إدارة", "department", "departments")) {
            // Count departments
            if (has("كم", "عدد", "count") || q.includes("كم إدارة")) {
                const count = await prisma.department.count()
                return {
                    text: `يوجد في النظام ${count} إدارة/قسم حالياً.`,
                    type: 'stat',
                    data: { label: "عدد الإدارات", value: count }
                }
            }

            // Department Info
            const depts = await prisma.department.findMany({ include: { _count: { select: { employees: true } } } })
            const targetDept = depts.find(d => q.includes(d.name.toLowerCase()))

            if (targetDept) {
                return {
                    text: `معلومات قسم ${targetDept.name}:`,
                    type: 'list',
                    data: [
                        { label: "المدير", value: targetDept.managerName || "غير محدد" },
                        { label: "عدد الموظفين", value: targetDept._count.employees },
                    ]
                }
            }
        }



        // =========================================================
        // FALLBACK
        // =========================================================
        return {
            text: "لم أفهم طلبك بدقة، لكن جرب هذه الأوامر السريعة: 👇",
            type: 'list',
            data: [
                { label: "بحث", value: "ابحث عن أحمد / AST-101" },
                { label: "ملاحة", value: "افتح المخزون / اذهب للموظفين" },
                { label: "إجراء", value: "إضافة موظف / أصل جديد" },
                { label: "إحصاء", value: "كم عدد الأجهزة؟ / التذاكر؟" },
            ]
        }

    } catch (error) {
        console.error("Copilot Error:", error)
        return { text: "واجهت مشكلة تقنية بسيطة، حاول مرة أخرى لاحقاً. 🛠️" }
    }
}
