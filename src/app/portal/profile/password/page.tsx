export const dynamic = 'force-dynamic';

import { getCurrentEmployee } from "@/app/actions/employee-portal"
import { redirect } from "next/navigation"
import { ChangePasswordForm } from "./change-password-form"

export default async function ChangePasswordPage() {
    const employee = await getCurrentEmployee()

    if (!employee) {
        redirect("/portal/login")
    }

    return <ChangePasswordForm employee={employee} />
}
