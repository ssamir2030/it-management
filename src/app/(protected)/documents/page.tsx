export const dynamic = 'force-dynamic';

import { DocumentClient } from "@/components/documents/document-client"
import { getAllDocuments } from "@/app/actions/documents"

export default async function DocumentsPage() {
    const result = await getAllDocuments()
    const documents = (result.success && result.data) ? result.data.map((doc: any) => ({
        ...doc,
        date: doc.documentDate ? new Date(doc.documentDate).toLocaleDateString('ar-EG') : new Date(doc.createdAt).toLocaleDateString('ar-EG')
    })) : []

    return <DocumentClient initialDocuments={documents} />
}
