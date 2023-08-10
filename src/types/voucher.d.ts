export interface Voucher {
    flightNumber: string;
    date: Date;
    value: string;
    reason: string;
    count: number;
    issuer: { initials: string; name: string };
}