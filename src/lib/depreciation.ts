
export interface AssetDepreciationValues {
    initialPrice: number
    salvageValue: number
    lifespanMonths: number
    purchaseDate: Date | null
    currentValue: number
    monthlyRate: number
    ageMonths: number
    isFullyDepreciated: boolean
}

export function calculateStraightLineDepreciation(
    price: number,
    salvageValue: number,
    lifespanMonths: number,
    purchaseDate: Date | null
): AssetDepreciationValues {
    if (!purchaseDate || price <= 0 || lifespanMonths <= 0) {
        return {
            initialPrice: price || 0,
            salvageValue: salvageValue || 0,
            lifespanMonths: lifespanMonths || 36,
            purchaseDate,
            currentValue: price || 0,
            monthlyRate: 0,
            ageMonths: 0,
            isFullyDepreciated: false
        }
    }

    const now = new Date()
    // Calculate age in months
    const ageMonths = (now.getFullYear() - purchaseDate.getFullYear()) * 12 + (now.getMonth() - purchaseDate.getMonth())

    const depreciableAmount = price - salvageValue
    const monthlyRate = depreciableAmount / lifespanMonths

    let currentValue = price - (monthlyRate * ageMonths)

    // Clamp value
    if (currentValue < salvageValue) currentValue = salvageValue
    if (currentValue > price) currentValue = price // Should not happen with positive age

    return {
        initialPrice: price,
        salvageValue,
        lifespanMonths,
        purchaseDate,
        currentValue: Math.round(currentValue * 100) / 100, // Round to 2 decimals
        monthlyRate: Math.round(monthlyRate * 100) / 100,
        ageMonths,
        isFullyDepreciated: ageMonths >= lifespanMonths
    }
}
