export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma'
import { EditVisitForm } from '@/components/visitors/edit-visit-form'
import { notFound } from 'next/navigation'

export default async function EditVisitPage({ params }: { params: { id: string } }) {
    const visit = await prisma.visit.findUnique({
        where: { id: params.id },
        include: { visitor: true }
    })

    if (!visit) notFound()

    return <EditVisitForm visit={visit} />
}
