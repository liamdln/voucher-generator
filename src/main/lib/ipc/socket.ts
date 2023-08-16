import { BrowserWindow } from "electron";

let _mainWindowRef: BrowserWindow;

export function registerSockets(mainWindowRef: BrowserWindow) {
    _mainWindowRef = mainWindowRef;
}

export function updateVoucherGenProgress(currentPage: number, totalPages: number, jobId: string) {
    if (!_mainWindowRef) {
        throw Error("Main window has not been registered.")
    }

    _mainWindowRef.webContents.send("update-voucher-progress", { currentPage, totalPages, jobId })

}
