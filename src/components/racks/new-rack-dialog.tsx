"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { createRack } from "@/app/actions/racks"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus, Server, X, Database } from "lucide-react"
import { toast } from "sonner"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NewRackDialogProps {
    locations: any[]
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending} size="lg" className="min-w-[150px]">
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Rack
        </Button>
    )
}

export function NewRackDialog({ locations }: NewRackDialogProps) {
    const [open, setOpen] = useState(false)

    async function clientAction(formData: FormData) {
        const res = await createRack(formData)
        if (res.success) {
            toast.success("Rack created successfully")
            setOpen(false)
        } else {
            toast.error(res.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Rack
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[100vw] w-full h-[100vh] p-0 gap-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
                <div className="w-full h-full overflow-y-auto">
                    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-6">
                        <PremiumPageHeader
                            title="Add New Rack"
                            description="Create a new server rack definition and assign it to a location."
                            icon={Server}
                            rightContent={
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    onClick={() => setOpen(false)}
                                    className="text-muted-foreground hover:bg-slate-200/50 gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    Close
                                </Button>
                            }
                        />

                        <Card className="card-elevated border-t-4 border-t-primary/20">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Database className="h-5 w-5 text-primary" />
                                    Rack Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form action={clientAction} className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-base">Rack Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="e.g., Server Room A - Rack 1"
                                                required
                                                className="h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="locationId" className="text-base">Location</Label>
                                            <Select name="locationId" required>
                                                <SelectTrigger className="h-12">
                                                    <SelectValue placeholder="Select location" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {locations.map((loc) => (
                                                        <SelectItem key={loc.id} value={loc.id}>
                                                            {loc.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="capacity" className="text-base">Capacity (U)</Label>
                                            <Input
                                                id="capacity"
                                                name="capacity"
                                                type="number"
                                                defaultValue={42}
                                                min={1}
                                                max={60}
                                                required
                                                className="h-12"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                                        <Button type="button" variant="outline" size="lg" onClick={() => setOpen(false)}>Cancel</Button>
                                        <SubmitButton />
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
