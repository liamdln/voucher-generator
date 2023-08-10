import { Config } from "../../../types/config";
import path from "path";
import { appStore } from "../store/store";

export const defaultConfig: Config = {
    outputDir: path.join(process.cwd(), "vouchers")
}

export function saveConfig(config: Config): boolean {
    try {
        appStore.set("config", config)
        return true;
    } catch (e) {
        throw e;
    }
}

export function readConfig(): string {
    try {
        const config = appStore.get("config") as Config | undefined;
        if (!config) {
            return JSON.stringify(defaultConfig);
        }
        return JSON.stringify(config);
    } catch (e) {
        throw e;
    }
}
