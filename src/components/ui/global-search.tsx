"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, Monitor, Users, UserCog, Loader2, FileText } from "lucide-react"
import { useDebounce } from "use-debounce"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { searchGlobal, SearchResult } from "@/app/actions/search"

export function GlobalSearch() {
    const router = useRouter()
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [debouncedQuery] = useDebounce(query, 300)
    const [data, setData] = React.useState<SearchResult[]>([])
    const [loading, setLoading] = React.useState(false)

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
        if (debouncedQuery.length < 2) {
            setData([])
            return
        }

        const fetchResults = async () => {
            setLoading(true)
            const res = await searchGlobal(debouncedQuery) as any
            if (res.success && res.data) {
                setData(res.data)
            }
            setLoading(false)
        }

        fetchResults()
    }, [debouncedQuery])

    const handleSelect = (url: string) => {
        setOpen(false)
        router.push(url)
    }

    const assets = data.filter(item => item.type.toLowerCase() === 'asset')
    const employees = data.filter(item => item.type.toLowerCase() === 'employee')
    const custody = data.filter(item => item.type.toLowerCase() === 'custody')

    return (
        <>
            <Button
                variant="outline"
                className="relative h-10 w-full justify-start text-sm text-muted-foreground sm:w-64 lg:w-80 shadow-sm bg-background/50 hover:bg-background/80 transition-all"
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4" />
                <span>بحث شامل...</span>
                <kbd className="pointer-events-none absolute left-2 top-2.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">Ctrl K</span>
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="ابحث عن أصل، موظف، أو عهدة..."
                    value={query}
                    onValueChange={setQuery}
                    className="text-right"
                />
                <CommandList className="max-h-[500px]">
                    {loading && (
                        <div className="flex items-center justify-center p-4 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin gap-2" />
                            <span className="mr-2">جاري البحث...</span>
                        </div>
                    )}

                    {!loading && query.length > 0 && data.length === 0 && (
                        <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                    )}

                    {!loading && assets.length > 0 && (
                        <CommandGroup heading="الأصول">
                            {assets.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    onSelect={() => handleSelect(item.url)}
                                    className="gap-2 cursor-pointer"
                                >
                                    <Monitor className="h-4 w-4 text-blue-500" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{item.title}</span>
                                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {!loading && assets.length > 0 && employees.length > 0 && <CommandSeparator />}

                    {!loading && employees.length > 0 && (
                        <CommandGroup heading="الموظفين">
                            {employees.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    onSelect={() => handleSelect(item.url)}
                                    className="gap-2 cursor-pointer"
                                >
                                    <Users className="h-4 w-4 text-purple-500" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{item.title}</span>
                                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {!loading && (assets.length > 0 || employees.length > 0) && custody.length > 0 && <CommandSeparator />}

                    {!loading && custody.length > 0 && (
                        <CommandGroup heading="العهد">
                            {custody.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    onSelect={() => handleSelect(item.url)}
                                    className="gap-2 cursor-pointer"
                                >
                                    <UserCog className="h-4 w-4 text-orange-500" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{item.title}</span>
                                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    )
}
