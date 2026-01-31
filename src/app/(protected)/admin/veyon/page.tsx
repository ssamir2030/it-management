
import { VeyonController } from '@/components/veyon/VeyonController'

export const metadata = {
    title: 'Veyon Remote Control | IT Asset Manager',
    description: 'Manage lab computers and power states',
}

export default function VeyonPage() {
    return (
        <div className="container mx-auto py-6">
            <VeyonController />
        </div>
    )
}
