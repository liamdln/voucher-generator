import {  dialog, ipcMain } from "electron";
import { Issuer } from "../../../types/issuer";
import { Voucher } from "../../../types/voucher";
import { readConfig, defaultConfig, saveConfig } from "../config";
import { Level, Logger } from "../logger";
import { appStore } from "../store";
import { Config } from "../../../types/config";
import { v4 as uuidv4 } from 'uuid';
import { addJob, getAllJobs } from "../jobs";
import { spawnGeneratorWorker } from "../pdf";

export function registerIpcHandlers() {
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

                // update issuer voucher count
                const issuers = store.get("issuers") as Issuer[];
                const submittingIssuer = issuers.findIndex((issuer: Issuer) => issuer.initials === voucher.issuer.initials);

                // no issuer found in array
                // issuer should be in array else they
                // would not be in the selection dropdown.
                if (submittingIssuer < 0) {
                    throw Error("Issuer does not exists in storage.")
                } else {
                    issuers[submittingIssuer].voucher_count++;
                }

                // create the job
                const jobId = uuidv4();
                addJob(jobId, voucher.count)

                spawnGeneratorWorker(voucher, jobId);

                return resolve({ jobId })

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

    // fetch all active jobs
    ipcMain.handle("jobs:getAll", () => {
        const allJobs = getAllJobs();
        return allJobs
    })

}
