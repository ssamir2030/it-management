export type EventType =
    | 'TICKET_CREATED'
    | 'TICKET_UPDATED'
    | 'ASSET_CREATED'
    | 'ASSET_ASSIGNED'

export interface SystemEvent {
    type: EventType
    payload: any
    timestamp: Date
}

export type ActionType =
    | 'SEND_EMAIL'
    | 'SEND_NOTIFICATION'
    | 'LOG_ACTIVITY'

export interface AutomationRule {
    id: string
    name: string
    event: EventType
    condition?: (payload: any) => boolean
    action: ActionType
    isActive: boolean
}

// Simple in-memory storage for rules (in a real app, this would be DB)
export const MOCK_RULES: AutomationRule[] = [
    {
        id: '1',
        name: 'إشعار عند فتح تذكرة جديدة',
        event: 'TICKET_CREATED',
        action: 'SEND_NOTIFICATION',
        isActive: true,
    },
    {
        id: '2',
        name: 'إرسال بريد عند تعيين أصل',
        event: 'ASSET_ASSIGNED',
        action: 'SEND_EMAIL',
        isActive: true,
    }
]

class AutomationEngine {
    private rules: AutomationRule[] = MOCK_RULES

    public async processEvent(event: SystemEvent) {
        console.log(`[Automation] Processing event: ${event.type}`)

        const matchingRules = this.rules.filter(r => r.isActive && r.event === event.type)

        for (const rule of matchingRules) {
            if (!rule.condition || rule.condition(event.payload)) {
                await this.executeAction(rule.action, event.payload)
            }
        }
    }

    private async executeAction(action: ActionType, payload: any) {
        console.log(`[Automation] Executing action: ${action}`, payload)
        // In a real implementation, this would call email service, notification service, etc.
    }
}

export const automationEngine = new AutomationEngine()
