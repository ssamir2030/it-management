"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, User, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { getEmployees } from "@/app/actions/employees"

interface EmployeeSelectorProps {
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
    placeholder?: string
}

export function EmployeeSelector({ value, onChange, disabled, placeholder = "اختر الموظف..." }: EmployeeSelectorProps) {
    const [open, setOpen] = React.useState(false)
    const [employees, setEmployees] = React.useState<{ id: string; name: string; identityNumber?: string }[]>([])
    const [loading, setLoading] = React.useState(false)
    const [query, setQuery] = React.useState("")

    React.useEffect(() => {
        let mounted = true
        setLoading(true)
        getEmployees().then((res) => {
            if (mounted && res.success && res.data) {
                setEmployees(res.data)
            }
            if (mounted) setLoading(false)
        })
        return () => { mounted = false }
    }, [])

    const filteredEmployees = employees.filter(employee => {
        if (!query) return true
        const search = query.toLowerCase()
        return (
            employee.name.toLowerCase().includes(search) ||
            employee.identityNumber?.includes(search)
        )
    })

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-12"
                    disabled={disabled || loading}
                >
                    {value ? (
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 opacity-50" />
                            {value}
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-start">{loading ? "جاري التحميل..." : placeholder}</span>
                    )}
                    {loading ? (
                        <Loader2 className="ml-2 h-4 w-4 shrink-0 opacity-50 animate-spin" />
                    ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-2 z-[99999]" align="start">
                <div className="flex items-center border-b pb-2 mb-2 px-1">
                    <Search className="h-4 w-4 text-muted-foreground mr-2" />
                    <Input
                        placeholder="بحث عن موظف..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="border-none shadow-none focus-visible:ring-0 h-8 p-0 placeholder:text-muted-foreground"
                    />
                    {query && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setQuery("")}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-1 custom-scrollbar">
                    {filteredEmployees.length === 0 ? (
                        <div className="text-sm text-center py-6 text-muted-foreground">
                            لم يتم العثور على موظفين.
                        </div>
                    ) : (
                        filteredEmployees.map((employee) => (
                            <div
                                key={employee.id}
                                onClick={() => {
                                    onChange(employee.name)
                                    setOpen(false)
                                }}
                                className={cn(
                                    "flex items-center w-full px-2 py-2 text-sm rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                                    value === employee.name ? "bg-accent text-accent-foreground" : ""
                                )}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4 shrink-0",
                                        value === employee.name ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <div className="flex flex-col">
                                    <span className="font-medium">{employee.name}</span>
                                    {employee.identityNumber && <span className="text-xs text-muted-foreground">{employee.identityNumber}</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
