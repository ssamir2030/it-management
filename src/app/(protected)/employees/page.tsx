export const dynamic = 'force-dynamic';

import { getEmployees } from "@/app/actions/employees"
import { EmployeeClient } from "@/components/employees/employee-client"

export default async function EmployeesPage() {
    const { data: employees } = await getEmployees()

    return <EmployeeClient employees={employees || []} />
}
