export interface Voucher {
    flightNumber: string
    date: Date
    value: string
    reason: string
    count: number
    issuer: { initials: string; name: string }
}

export interface VoucherDetails {
    generatedTime: {
        date: string
        time: string
    }
    issuer: string
    flightNumber: string
    outputDir: string
    id: string
}
