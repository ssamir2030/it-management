'use client'

import { useEffect } from 'react'

export function PwaRegistrar() {
    useEffect(() => {
        if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js').then(
                    function (registration) {
                        console.log('Service Worker registration successful with scope: ', registration.scope)
                    },
                    function (err) {
                        console.log('Service Worker registration failed: ', err)
                    }
                )
            })
        }
    }, [])

    return null
}
