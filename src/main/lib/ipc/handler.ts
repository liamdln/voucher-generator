import { defaultConfig, getConfig, readConfig, saveConfig } from "../config"
import { Level, Logger } from "../logger"
import { Voucher, VoucherDetails } from "../../../types/voucher"
import { Config } from "../../../types/config"
import { Issuer } from "../../../types/issuer"
import { createPdf } from "../pdf"
import { appStore } from "../store"
import { ipcMain, dialog, BrowserWindow } from "electron"
import { v4 as uuidv4 } from "uuid"
import fs from "fs"
import { getPrintersFromPc, printVoucher } from "../print"

export function registerIpcHandlers(): void {
    // create store
    // todo: write a library for the store
    // so we aren't directly accessing it here
    const store = appStore

    // ipc
    // get a list of all the issuers from the database
    ipcMain.handle("issuers:get", () => {
        return new Promise((resolve, reject) => {
            try {
                const allIssuers: Issuer[] = (store.get("issuers") || []) as Issuer[]
                resolve(allIssuers)
            } catch (e) {
                Logger.log(JSON.stringify(e), Level.ERROR)
                reject(JSON.stringify(e))
            }
        })
    })

    // add an issuer to the database
    ipcMain.handle("issuers:add", (_, issuer: Issuer) => {
        // TODO: check correct data is sent
        return new Promise((resolve, reject) => {
            try {
                const issuers = (store.get("issuers") || []) as Issuer[]
                issuers.push({ name: issuer.name, initials: issuer.initials, voucher_count: 0 })
                store.set("issuers", issuers)
                resolve(issuer)
            } catch (e) {
                Logger.log(JSON.stringify(e), Level.ERROR)
                reject(JSON.stringify(e))
            }
        })
    })

    // remove an issuer from the database
    ipcMain.handle("issuers:remove", (_, issuersToRemove: Issuer[]) => {
        // TODO: check correct data is sent
        return new Promise((resolve, reject) => {
            try {
                const issuers = store.get("issuers") as Issuer[]
                const filteredIssuers = issuers.filter((issuer) => {
                    !issuersToRemove
                        .map((issuerToRemove) => issuerToRemove.initials)
                        .includes(issuer.initials)
                })
                store.set("issuers", filteredIssuers)
                resolve({ status: "success", content: "Issuers deleted." })
            } catch (e) {
                Logger.log(JSON.stringify(e), Level.ERROR)
                reject(JSON.stringify(e))
            }
        })
    })

    // create a new voucher
    ipcMain.handle("vouchers:add", async (_, rawVoucher: string) => {
        let voucher: Voucher

        // try parse the voucher
        try {
            voucher = JSON.parse(rawVoucher)
        } catch (e) {
            const error = `Could not parse voucher: ${e}`
            Logger.log(error, Level.ERROR)
            throw Error(error)
        }

        // ensure correct data sent
        if (
            typeof voucher.flightNumber !== "string" ||
            typeof voucher.reason !== "string" ||
            typeof voucher.value !== "string" ||
            typeof voucher.issuer.initials !== "string" ||
            !voucher.date
        ) {
            const error = "Voucher body malformed."
            Logger.log(error, Level.ERROR)
            throw Error(error)
        }

        // update issuer voucher count
        const issuers = (store.get("issuers") ?? []) as Issuer[]
        const submittingIssuer = issuers.findIndex(
            (issuer: Issuer) => issuer.initials === voucher.issuer.initials
        )

        // no issuer found in array
        // issuer should be in array else they
        // would not be in the selection dropdown.
        if (submittingIssuer < 0) {
            const error = "Issuer not found in store."
            Logger.log(error, Level.ERROR)
            throw Error(error)
        } else {
            issuers[submittingIssuer].voucher_count++
            store.set("issuers", issuers)
        }

        const config = getConfig()
        const voucherId = uuidv4()
        let voucherDetails: VoucherDetails

        try {
            voucherDetails = await createPdf(voucher, voucherId, config.outputDir)
        } catch (e) {
            const error = `Could not generate PDF: ${e}`
            Logger.log(error, Level.ERROR)
            throw Error(error)
        }

        const vouchers = (store.get("vouchers") ?? []) as VoucherDetails[]
        store.set("vouchers", [...vouchers, voucherDetails])
        return {
            status: "success",
            content: { location: `${config.outputDir}/${voucherId}.pdf` }
        }
    })

    ipcMain.handle("vouchers:get", () => {
        const voucherList = store.get("vouchers") as VoucherDetails[]
        return voucherList ?? []
    })

    ipcMain.handle("vouchers:delete", (_, voucherToDelete: VoucherDetails) => {
        return new Promise((resolve, reject) => {
            const voucherList = store.get("vouchers") as VoucherDetails[]

            fs.unlink(voucherToDelete.outputDir, (err) => {
                if (err) {
                    store.set(
                        "vouchers",
                        voucherList.filter((voucher) => voucher.id !== voucherToDelete.id)
                    )
                    Logger.log(err.message, Level.ERROR)
                    return reject(
                        JSON.stringify({
                            status: "error",
                            content: `Voucher could not be deleted: ${err}`
                        })
                    )
                } else {
                    store.set(
                        "vouchers",
                        voucherList.filter((voucher) => voucher.id !== voucherToDelete.id)
                    )
                    return resolve({ status: "success", content: "Voucher deleted" })
                }
            })
        })
    })

    ipcMain.handle("vouchers:show", (_, voucherDir: string) => {
        const pdfView = new BrowserWindow({
            webPreferences: {
                plugins: true
            },
            autoHideMenuBar: true
        })
        pdfView.loadURL(voucherDir)
    })

    // get the app's configuration
    ipcMain.handle("config:get", () => {
        // re-read the config
        try {
            const config = readConfig()
            return config
        } catch (e) {
            Logger.log("Unable to read config, will revert to default config.", Level.ERROR)
            Logger.log(`${e}`, Level.ERROR)
            const config = JSON.stringify(defaultConfig)
            return config
        }
    })

    // set the app's config
    ipcMain.handle("config:set", (_, config: string) => {
        const newConfig: Config = JSON.parse(config)
        return new Promise((resolve, reject) => {
            try {
                saveConfig(newConfig)
                resolve({ status: "success", content: JSON.stringify(newConfig) })
            } catch (e) {
                reject(JSON.stringify({ status: "error", content: `${JSON.stringify(e)}` }))
            }
        })
    })

    // fetch a directory from the filesystem
    ipcMain.handle("fs:getDir", () => {
        const directory = dialog.showOpenDialogSync({ properties: ["openDirectory"] })
        return directory
    })

    // printers
    ipcMain.handle("printers:get", async () => {
        const printers = await getPrintersFromPc()
        return printers
    })

    ipcMain.handle("printers:print", async (_, printerId: string, voucher: VoucherDetails) => {
        try {
            await printVoucher(printerId, voucher.outputDir)
            return true
        } catch (err) {
            Logger.log(`${JSON.stringify(err)}`, Level.ERROR)
            throw Error("Could not print voucher.")
        }
    })
}
