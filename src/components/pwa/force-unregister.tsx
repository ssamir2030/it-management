"use client"

import { useEffect } from "react"

export function ForceUnregisterSW() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
                for (let registration of registrations) {
                    registration.unregister()
                    console.log('🛑 Service Worker Force Unregistered:', registration)
                }
            })
        }
    }, [])

    return null
}
