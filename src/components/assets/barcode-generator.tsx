'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Barcode with SSR disabled to prevent hydration mismatches
const Barcode = dynamic(() => import('react-barcode'), {
    ssr: false,
    loading: () => <div>Loading Barcode...</div>
})

interface BarcodeGeneratorProps {
    value: string
    width?: number
    height?: number
    fontSize?: number
    showValue?: boolean
}

export const BarcodeGenerator = ({
    value,
    width = 1.5,
    height = 40,
    fontSize = 14,
    showValue = true
}: BarcodeGeneratorProps) => {
    return (
        <Barcode
            value={value}
            width={width}
            height={height}
            fontSize={fontSize}
            displayValue={showValue}
            margin={0}
            background="transparent"
        />
    )
}
