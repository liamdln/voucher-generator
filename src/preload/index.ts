import { contextBridge, ipcRenderer } from "electron"
import { electronAPI } from "@electron-toolkit/preload"
import { Issuer } from "../types/issuer"
import { VoucherDetails } from "../types/voucher"

// Custom APIs for renderer
const api = {
    getAllIssuers: () => ipcRenderer.invoke("issuers:get"),
    addIssuer: (issuer: Issuer) => ipcRenderer.invoke("issuers:add", issuer),
    removeIssuer: (issuers: Issuer[]) => ipcRenderer.invoke("issuers:remove", issuers),
    addVoucher: (voucher: string) => ipcRenderer.invoke("vouchers:add", voucher),
    getConfig: () => ipcRenderer.invoke("config:get"),
    setConfig: (config: string) => ipcRenderer.invoke("config:set", config),
    getNewDir: () => ipcRenderer.invoke("fs:getDir"),
    getVouchers: () => ipcRenderer.invoke("vouchers:get"),
    deleteVoucher: (voucher: VoucherDetails) => ipcRenderer.invoke("vouchers:delete", voucher),
    showVoucher: (voucherDir: string) => ipcRenderer.invoke("vouchers:show", voucherDir),
    getPrinters: () => ipcRenderer.invoke("printers:get"),
    print: (printerId: string, voucher: VoucherDetails) =>
        ipcRenderer.invoke("printers:print", printerId, voucher)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld("electron", electronAPI)
        contextBridge.exposeInMainWorld("api", api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
}
