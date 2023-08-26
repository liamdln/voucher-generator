import { Config } from "../../types/config"
import path from "path"
import { appStore } from "./store"
import fs, { existsSync } from "fs"

export const defaultConfig: Config = {
    outputDir: path.join(process.cwd(), "vouchers")
}

export function saveConfig(config: Config): void {
    appStore.set("config", config)
}

export function readConfig(): string {
    const config = appStore.get("config") as Config | undefined
    if (!config) {
        return JSON.stringify(defaultConfig)
    }
    return JSON.stringify(config)
}

export function getConfig(): Config {
    let config: Config
    try {
        const configStr = readConfig()
        config = JSON.parse(configStr)
    } catch (e) {
        config = defaultConfig
    }

    // make the vouchers directory if it doesn't exist
    if (!existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir)
    }
    return config
}
