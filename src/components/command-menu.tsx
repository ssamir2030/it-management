"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import {
    LayoutDashboard,
    Box,
    Users,
    Headset,
    Building2,
    MapPin,
    FileText,
    CreditCard,
    Plus,
    Monitor,
    Moon,
    Sun,
    Laptop,
    Settings,
    LogOut,
    Search,
    Activity
} from "lucide-react"
import { useTheme } from "next-themes"

import { searchAssets } from "@/app/actions/assets"
import { HealthCheckDialog } from "@/components/admin/HealthCheckDialog"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [assets, setAssets] = React.useState<any[]>([])
    const router = useRouter()
    const { setTheme } = useTheme()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    React.useEffect(() => {
        const search = async () => {
            if (query.length >= 2) {
                const result = await searchAssets(query)
                if (result.success) {
                    setAssets(result.data)
                }
            } else {
                setAssets([])
            }
        }
        const timer = setTimeout(search, 300)
        return () => clearTimeout(timer)
    }, [query])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="ابحث عن أصل (Tag/S/N)، أو صفحة، أو إجراء..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList className="text-right" dir="rtl">
                <CommandEmpty>لا توجد نتائج.</CommandEmpty>

                {assets.length > 0 && (
                    <CommandGroup heading="نتائج البحث في الأصول">
                        {assets.map((asset) => (
                            <CommandItem
                                key={asset.id}
                                onSelect={() => runCommand(() => router.push(`/assets/${asset.id}`))}
                            >
                                <Monitor className="ml-2 h-4 w-4" />
                                <div className="flex flex-col">
                                    <span>{asset.name}</span>
                                    <span className="text-[10px] text-muted-foreground">{asset.tag} - {asset.type}</span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                <CommandGroup heading="الصفحات الرئيسية">
                    <CommandItem onSelect={() => runCommand(() => router.push("/admin/dashboard"))}>
                        <LayoutDashboard className="ml-2 h-4 w-4" />
                        <span>لوحة التحكم</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/assets"))}>
                        <Box className="ml-2 h-4 w-4" />
                        <span>الأصول</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/employees"))}>
                        <Users className="ml-2 h-4 w-4" />
                        <span>الموظفين</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/support"))}>
                        <Headset className="ml-2 h-4 w-4" />
                        <span>الدعم الفني</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="إجراءات سريعة">
                    <CommandItem onSelect={() => runCommand(() => router.push("/assets/new"))}>
                        <Plus className="ml-2 h-4 w-4" />
                        <span>إضافة أصل جديد</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/admin/dashboard"))}>
                        <Activity className="ml-2 h-4 w-4" />
                        <span>بدء فحص النظام</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push("/support/new"))}>
                        <Plus className="ml-2 h-4 w-4" />
                        <span>فتح تذكرة جديدة</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="المظهر">
                    <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                        <Sun className="ml-2 h-4 w-4" />
                        <span>الوضع الفاتح</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                        <Moon className="ml-2 h-4 w-4" />
                        <span>الوضع الداكن</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="أخرى">
                    <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
                        <Settings className="ml-2 h-4 w-4" />
                        <span>الإعدادات</span>
                    </CommandItem>
                </CommandGroup>

            </CommandList>
        </CommandDialog>
    )
}

