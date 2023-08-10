import { ElectronAPI } from '@electron-toolkit/preload'
import { Issuer } from "../types/issuer";
import { Voucher } from "../types/voucher";
import { Config } from "../types/config";

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getAllIssuers: () => Promise<Issuer[]>,
      addIssuer: (issuer: Issuer) => Promise<Issuer>,
      removeIssuer: (issuers: Issuer[]) => Promise<{ status: "success" | "error", content: string }>,
      addVoucher: (voucher: string) => Promise<{ status: "success" | "error", content: string }>,
      getConfig: () => Promise<string>,
      setConfig: (config: string) => Promise<{ status: "success" | "error", content: string }>,
      getNewDir: () => Promise<string>,
    }
  }
}
