import { Printer, getPrinters, print } from "pdf-to-printer"

export async function getPrintersFromPc(): Promise<Printer[]> {
    const printers: Printer[] = await getPrinters()
    return printers
}

export async function printVoucher(printer: string, voucherDir: string): Promise<void> {
    const options = {
        printer,
        scale: "fit"
    }
    return print(voucherDir, options)
}
