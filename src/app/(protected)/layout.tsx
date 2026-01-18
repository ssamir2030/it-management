import { Shell } from "@/components/layout/shell"
import { getSession } from "@/lib/simple-auth"
import { redirect } from "next/navigation"
import { TrialWarningBanner } from "@/components/trial/trial-warning-banner"

// Force dynamic rendering for all protected pages
export const dynamic = 'force-dynamic'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession('ADMIN')

    if (!session) {
        redirect('/login')
    }

    return (
        <>
            <TrialWarningBanner />
            <Shell adminUser={session}>
                {children}
            </Shell>
        </>
    )
}
