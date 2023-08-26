import { ElectronAPI } from "@electron-toolkit/preload"
import { Issuer } from "../types/issuer"
import { VoucherDetails } from "../types/voucher"
import { Printer } from "pdf-to-printer"

interface StandardResponse {
    status: "success" | "error"
    content: string
}

declare global {
    interface Window {
        electron: ElectronAPI
        api: {
            getAllIssuers: () => Promise<Issuer[]>
            addIssuer: (issuer: Issuer) => Promise<Issuer>
            removeIssuer: (issuers: Issuer[]) => Promise<StandardResponse>
            addVoucher: (voucher: string) => Promise<StandardResponse>
            getConfig: () => Promise<string>
            setConfig: (config: string) => Promise<StandardResponse>
            getNewDir: () => Promise<string>
            getVouchers: () => Promise<VoucherDetails[]>
            deleteVoucher: (voucher: VoucherDetails) => Promise<StandardResponse>
            showVoucher: (voucherDir: string) => Promise<void>
            getPrinters: () => Promise<Printer[]>
            print: (printerId: string, voucher: VoucherDetails) => Promise<boole>
        }
    }
}
