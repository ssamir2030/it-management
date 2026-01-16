'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // تسجيل Service Worker
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('✅ Service Worker registered:', registration.scope)

                    // التحقق من التحديثات
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // يوجد تحديث جديد
                                    console.log('🔄 New version available!')
                                    // يمكن إضافة إشعار للمستخدم هنا
                                }
                            })
                        }
                    })
                })
                .catch((error) => {
                    console.error('❌ Service Worker registration failed:', error)
                })

            // الاستماع لرسائل من Service Worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                console.log('📩 Message from SW:', event.data)
            })
        }
    }, [])

    return null
}

// دالة لطلب إذن الإشعارات
export async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications')
        return false
    }

    if (Notification.permission === 'granted') {
        return true
    }

    if (Notification.permission === 'denied') {
        return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
}

// دالة للاشتراك في Push Notifications
export async function subscribeToPush(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push messaging is not supported')
        return null
    }

    try {
        const registration = await navigator.serviceWorker.ready

        // استخدام VAPID key (يجب إنشاؤه في الـ backend)
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
            ),
        })

        console.log('✅ Push subscription:', subscription)
        return subscription
    } catch (error) {
        console.error('❌ Failed to subscribe to push:', error)
        return null
    }
}

// تحويل VAPID key
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray.buffer as ArrayBuffer
}
