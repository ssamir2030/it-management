export const dynamic = 'force-dynamic';

import { getDepartments } from "@/app/actions/departments"
import { DepartmentClient } from "@/components/departments/department-client"

export default async function DepartmentsPage() {
    const { data: departments } = await getDepartments()

    return <DepartmentClient departments={departments || []} />
}
