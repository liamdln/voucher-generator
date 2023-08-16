import Store from "electron-store";

export const appStore = new Store({
    schema: {
        issuers: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    initials: { type: "string" },
                    voucher_count: { type: "number", default: 0 }
                },
                required: ["name", "initials", "voucher_count"]
            }
        },
        config: {
            type: "object",
            properties: {
                outputDir: { type: "string" }
            },
            required: ["outputDir"]
        }
    }
})

