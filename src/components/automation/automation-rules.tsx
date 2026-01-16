"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Mail, Bell, Plus, Activity } from "lucide-react"
import { AutomationRule, MOCK_RULES } from "@/lib/automation/event-bus"

export function AutomationRulesList() {
    const [rules, setRules] = useState<AutomationRule[]>(MOCK_RULES)

    const toggleRule = (id: string) => {
        setRules(rules.map(r =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
        ))
    }

    const getIcon = (action: string) => {
        switch (action) {
            case 'SEND_EMAIL': return <Mail className="h-4 w-4" />
            case 'SEND_NOTIFICATION': return <Bell className="h-4 w-4" />
            default: return <Activity className="h-4 w-4" />
        }
    }

    return (
        <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        محرك الأتمتة (Automation Engine)
                    </CardTitle>
                    <CardDescription>
                        إدارة القواعد التلقائية التي يعمل بها النظام
                    </CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    قاعدة جديدة
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                {getIcon(rule.action)}
                            </div>
                            <div>
                                <h4 className="font-semibold">{rule.name}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Badge variant="outline" className="text-xs">{rule.event}</Badge>
                                    <span>➔</span>
                                    <Badge variant="secondary" className="text-xs">{rule.action}</Badge>
                                </div>
                            </div>
                        </div>
                        <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => toggleRule(rule.id)}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
