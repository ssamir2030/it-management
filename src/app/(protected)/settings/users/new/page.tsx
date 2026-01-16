"use client"

export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { UserForm } from "@/components/admin/user-form"
import { UserPlus } from "lucide-react"

export default function NewUserPage() {
    return (
        <div className="space-y-8">
            <PremiumPageHeader
                title="إضافة مستخدم جديد"
                description="إضافة حساب مستخدم جديد وتحديد الصلاحيات"
                icon={UserPlus}
                backLink="/settings/users"
                backText="العودة للمستخدمين"
            />

            <div className="pb-20">
                <div className="bg-card rounded-xl border shadow-sm p-8">
                    <div className="mb-8 border-b pb-6">
                        <h2 className="text-2xl font-bold text-primary">بيانات المستخدم</h2>
                        <p className="text-muted-foreground mt-2">
                            أدخل البيانات الشخصية للموظف وحدد مستوى الصلاحيات المناسب له.
                        </p>
                    </div>

                    <UserForm />
                </div>
            </div>
        </div>
    )
}
