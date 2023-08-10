import { app, shell, BrowserWindow, ipcMain, dialog } from "electron"
import { join } from "path"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import aurigny from "../../resources/aurigny.png?asset"
import { defaultConfig, readConfig, saveConfig } from "./lib/config/config"
import { Level, Logger } from "./lib/logger/logger"
import { Voucher } from "../types/voucher"
import { Config } from "../types/config"
import { Issuer } from "../types/issuer"
import { createPdf } from "./lib/pdf/pdf"
import { appStore } from "./lib/store/store"

function createWindow(): void {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1440,
        height: 810,
        maximizable: false,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === "linux" ? { aurigny } : {}),
        webPreferences: {
            preload: join(__dirname, "../preload/index.js"),
            sandbox: false
        }
    })

    mainWindow.on("ready-to-show", () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: "deny" }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"])
    } else {
        mainWindow.loadFile(join(__dirname, "../renderer/index.html"))
    }

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
    // Set app user model id for windows
    electronApp.setAppUserModelId("com.electron")

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on("browser-window-created", (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    createWindow()

    // create store
    // todo: write a library for the store
    // so we aren't directly accessing it here
    const store = appStore;

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
                const issuers = (store.get("issuers") || []) as Issuer[];
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
                const issuers = store.get("issuers") as Issuer[];
                const filteredIssuers = issuers.filter((issuer) => {
                    !issuersToRemove.map((issuerToRemove) => issuerToRemove.initials).includes(issuer.initials)
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
        return new Promise(async (resolve, reject) => {
            let voucher: Voucher;
            try {
                voucher = JSON.parse(rawVoucher);
                if (
                    typeof voucher.flightNumber !== "string" ||
                    typeof voucher.reason !== "string" ||
                    typeof voucher.value !== "string" ||
                    typeof voucher.issuer.initials !== "string" ||
                    !voucher.date
                ) {
                    throw Error("Malformed voucher sent.")
                }
                await createPdf(voucher);

                // update issuer voucher count
                const issuers = store.get("issuers") as Issuer[];
                const submittingIssuer = issuers.findIndex((issuer: Issuer) => issuer.initials === voucher.issuer.initials);

                // no issuer found in array
                // issuer should be in array else they
                // would not be in the selection dropdown.
                if (submittingIssuer < 0) {
                    throw Error("Issuer does not exists in storage.")
                }

                issuers[submittingIssuer].voucher_count++;
                return resolve({ status: "success", content: "voucher_location" })
            } catch (e) {
                Logger.log(JSON.stringify(e), Level.ERROR);
                return reject(JSON.stringify({ status: "error", content: `No voucher was sent or voucher data was malformed: ${JSON.stringify(e)}` }))
            }
        })
    })

    // get the app's configuration
    ipcMain.handle("config:get", () => {
        // re-read the config
        try {
            const config = readConfig();
            return config;
        } catch (e) {
            Logger.log("Unable to read config, will revert to default config.", Level.ERROR);
            Logger.log(`${e}`, Level.ERROR);
            const config = JSON.stringify(defaultConfig);
            return config;
        }
    })

    // set the app's config
    ipcMain.handle("config:set", (_, config: string) => {
        const newConfig: Config = JSON.parse(config);
        return new Promise((resolve, reject) => {
            try {
                saveConfig(newConfig);
                resolve({ status: "success", content: JSON.stringify(newConfig) });
            } catch (e) {
                reject(JSON.stringify({ status: "error", content: `${JSON.stringify(e)}` }))
            }
        })
    })

    // fetch a directory from the filesystem
    ipcMain.handle("fs:getDir", () => {
        const directory = dialog.showOpenDialogSync({ properties: ["openDirectory"] })
        return directory;
    })

    app.on("activate", function () {
        // On macOS it"s common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
