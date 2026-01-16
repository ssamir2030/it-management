"use client"

import * as React from "react"
import { toast } from "sonner"

export type Notification = {
    id: string
    title: string
    message: string
    timestamp: Date
    read: boolean
    type: 'info' | 'warning' | 'success' | 'error'
}

type NotificationContextType = {
    notifications: Notification[]
    unreadCount: number
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    clearNotifications: () => void
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = React.useState<Notification[]>([])

    const unreadCount = React.useMemo(() => notifications.filter(n => !n.read).length, [notifications])

    const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
        const newNotification = {
            ...notification,
            id: Math.random().toString(36).substring(7),
            timestamp: new Date(),
            read: false
        }
        setNotifications(prev => [newNotification, ...prev])

        // Also trigger a toast
        toast(newNotification.title, {
            description: newNotification.message,
            position: 'top-left', // Arabic UI usually prefers top-left for toasts if RTL, or system default
        })
    }

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const clearNotifications = () => {
        setNotifications([])
    }

    // SIMULATION: Simulate incoming events
    // SIMULATION: Simulate incoming events
    React.useEffect(() => {
        // Simulation disabled to prevent header flickering
        /*
        const timer = setInterval(() => {
            // ...
        }, 20000)
        return () => clearInterval(timer)
        */
        return () => { }
    }, [])

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications }}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = React.useContext(NotificationContext)
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider")
    }
    return context
}
