import { PDFDocument, rgb } from "pdf-lib";
import Fontkit from "@pdf-lib/fontkit";
import fs, { existsSync } from 'fs';
import { Voucher } from "../../types/voucher";
import moment from "moment";
import { defaultConfig, readConfig } from "./config";
import { Config } from "../../types/config";
import museosans from "../../../resources/museosans.otf?asset&asarUnpack"
import aurigny from "../../../resources/aurigny.png?asset&asarUnpack"

const ELEMENT_PADDING = 4;
const TITLE_FONT_SIZE = 14;
const SECONDARY_TITLE_FONT_SIZE = 10;
const TEXT_FONT_SIZE = 6;
const LINE_HEIGHT = 7;
const DISCLAIMER_FONT_SIZE = 4;
const DISCLAIMER_LINE_HEIGHT = 5;

moment.locale("en-gb")

export async function createPdf(voucher: Voucher) {
    const voucherPdf = await PDFDocument.create();

    // add Aurigny font
    voucherPdf.registerFontkit(Fontkit);
    const fontBytes = fs.readFileSync(museosans)
    const aurignyFont = await voucherPdf.embedFont(fontBytes)

    // add a voucher
    // config
    const numPages = voucher.count || 1;
    const pageSize = { width: 226, height: 326 }

    for (let i = 0; i < numPages; i++) {
        const page = voucherPdf.addPage([pageSize.width, pageSize.height]);

        // draw logo
        const logoBuffer = await fs.readFileSync(aurigny)
        const logo = await voucherPdf.embedPng(logoBuffer);
        const logoWidth = 93;
        const logoHeight = 35;
        page.drawImage(logo, {
            height: logoHeight,
            width: logoWidth,
            x: (page.getWidth() / 2) - (logoWidth / 2), // middle of page, middle of image
            y: page.getHeight() - (logoHeight + ELEMENT_PADDING) // image height + margin
        })

        // block out space used
        // remember to add padding to this value
        // when the previous element uses ELEMENT_PADDING
        let usedSpace = logoHeight + ELEMENT_PADDING;

        // draw title
        const titleText = "Light Refreshment Voucher";
        const titleWidth = aurignyFont.widthOfTextAtSize(titleText, TITLE_FONT_SIZE);
        const titleHeight = aurignyFont.heightAtSize(TITLE_FONT_SIZE);

        // x and y take into account the logo,
        // some element padding is used to elements
        // aren't touching
        page.drawText(titleText, {
            x: (page.getWidth() / 2) - (titleWidth / 2),
            y: (page.getHeight() - usedSpace - ELEMENT_PADDING) - (titleHeight / 2),
            font: aurignyFont,
            size: TITLE_FONT_SIZE,
            color: rgb(0, 0, 0)
        })

        // update the space used
        usedSpace += ELEMENT_PADDING + titleHeight;

        // draw description
        const descriptionText = "No Alcohol is to be purchased using this voucher.\n" +
            "Please use this voucher for refreshments in the terminal building or for any " +
            "purchases of refreshments and/or duty free goods on your Aurigny flight.\n" +
            "Simply tender this voucher when placing or receiving your order."
        // const descriptionWidth = aurignyFont.widthOfTextAtSize(descriptionText, TEXT_FONT_SIZE);
        const descriptionHeight = aurignyFont.heightAtSize(TEXT_FONT_SIZE);

        // these lines will wrap, but there are also line breaks (\n)
        // in the text
        page.drawText(descriptionText, {
            x: ELEMENT_PADDING, // below the image, minus the fontsize, add padding
            y: (page.getHeight() - usedSpace) - (descriptionHeight / 2),
            font: aurignyFont,
            size: TEXT_FONT_SIZE,
            color: rgb(0, 0, 0),
            maxWidth: page.getWidth() - ELEMENT_PADDING,
            lineHeight: LINE_HEIGHT
        })

        // update the space used. As the text wraps and there are two
        // line breaks, the space used is quadrupled as there are
        // 4 lines of text.
        usedSpace += descriptionHeight * 4;

        // =================================================================================================

        // draw flight number title
        const flightNumTitleText = "Flight Number"
        // const flightNumTitleWidth = aurignyFont.widthOfTextAtSize(descriptionText, TITLE_FONT_SIZE);
        const flightNumTitleHeight = aurignyFont.heightAtSize(TITLE_FONT_SIZE);

        page.drawText(flightNumTitleText, {
            x: ELEMENT_PADDING,
            y: (page.getHeight() - usedSpace - ELEMENT_PADDING) - (flightNumTitleHeight / 2),
            font: aurignyFont,
            size: TITLE_FONT_SIZE,
            color: rgb(0, 0, 0),
            lineHeight: LINE_HEIGHT
        })

        // update the space used
        usedSpace += flightNumTitleHeight + ELEMENT_PADDING

        // draw flight number value
        const flightNumText = voucher.flightNumber
        // const flightNumTextWidth = aurignyFont.widthOfTextAtSize(descriptionText, SECONDARY_TITLE_FONT_SIZE);
        const flightNumTextHeight = aurignyFont.heightAtSize(SECONDARY_TITLE_FONT_SIZE);

        page.drawText(flightNumText, {
            x: ELEMENT_PADDING * 3,
            y: (page.getHeight() - usedSpace - (ELEMENT_PADDING / 2)) - (flightNumTextHeight / 2),
            font: aurignyFont,
            size: SECONDARY_TITLE_FONT_SIZE,
            color: rgb(0, 0, 0),
            lineHeight: LINE_HEIGHT
        })

        // update the space used
        usedSpace += flightNumTextHeight + (ELEMENT_PADDING / 2)

        // =================================================================================================

        // draw date title
        const dateTitleText = "Date"
        const dateTitleHeight = aurignyFont.heightAtSize(TITLE_FONT_SIZE);

        page.drawText(dateTitleText, {
            x: ELEMENT_PADDING,
            y: (page.getHeight() - usedSpace - ELEMENT_PADDING) - (dateTitleHeight / 2),
            font: aurignyFont,
            size: TITLE_FONT_SIZE,
            color: rgb(0, 0, 0),
            lineHeight: LINE_HEIGHT
        })

        // update the space used
        usedSpace += dateTitleHeight + ELEMENT_PADDING

        // draw date value
        const dateText = moment().format("L")
        const dateTextHeight = aurignyFont.heightAtSize(SECONDARY_TITLE_FONT_SIZE);

        page.drawText(dateText, {
            x: ELEMENT_PADDING * 3,
            y: (page.getHeight() - usedSpace - (ELEMENT_PADDING / 2)) - (dateTextHeight / 2),
            font: aurignyFont,
            size: SECONDARY_TITLE_FONT_SIZE,
            color: rgb(0, 0, 0),
            lineHeight: LINE_HEIGHT
        })

        // update the space used
        usedSpace += dateTextHeight + (ELEMENT_PADDING / 2)

        // =================================================================================================

        // draw reason title
        const reasonTitleText = "Reason"
        const reasonTitleHeight = aurignyFont.heightAtSize(TITLE_FONT_SIZE);

        page.drawText(reasonTitleText, {
            x: ELEMENT_PADDING,
            y: (page.getHeight() - usedSpace - ELEMENT_PADDING) - (reasonTitleHeight / 2),
            font: aurignyFont,
            size: TITLE_FONT_SIZE,
            color: rgb(0, 0, 0),
            lineHeight: LINE_HEIGHT
        })

        // update the space used
        usedSpace += reasonTitleHeight + ELEMENT_PADDING

        // draw reason value
        const reasonText = voucher.reason
        const reasonTextWidth = aurignyFont.widthOfTextAtSize(reasonText, SECONDARY_TITLE_FONT_SIZE);
        const reasonTextHeight = aurignyFont.heightAtSize(SECONDARY_TITLE_FONT_SIZE);

        // if the reason is long, reduce the text size
        let reasonSize = SECONDARY_TITLE_FONT_SIZE;
        if (reasonTextWidth > (page.getWidth() - ELEMENT_PADDING)) {
            reasonSize = TEXT_FONT_SIZE
        }

        page.drawText(reasonText, {
            x: ELEMENT_PADDING * 3,
            y: (page.getHeight() - usedSpace - (ELEMENT_PADDING / 2)) - (reasonTextHeight / 2),
            font: aurignyFont,
            size: reasonSize,
            color: rgb(0, 0, 0),
            lineHeight: LINE_HEIGHT,
            maxWidth: page.getWidth() - ELEMENT_PADDING
        })

        // update the space used
        usedSpace += reasonTextHeight + (ELEMENT_PADDING / 2)

        // =================================================================================================

        // draw monetary value title
        const valueTitleText = "Value"
        const valueTitleHeight = aurignyFont.heightAtSize(TITLE_FONT_SIZE);

        page.drawText(valueTitleText, {
            x: ELEMENT_PADDING,
            y: (page.getHeight() - usedSpace - ELEMENT_PADDING) - (valueTitleHeight / 2),
            font: aurignyFont,
            size: TITLE_FONT_SIZE,
            color: rgb(0, 0, 0),
            lineHeight: LINE_HEIGHT
        })

        // update the space used
        usedSpace += valueTitleHeight + ELEMENT_PADDING

        // draw monetary value number
        const valueText = voucher.value
        const valueTextHeight = aurignyFont.heightAtSize(SECONDARY_TITLE_FONT_SIZE);

        page.drawText(`£${valueText}`, {
            x: ELEMENT_PADDING * 3,
            y: (page.getHeight() - usedSpace - (ELEMENT_PADDING / 2)) - (valueTextHeight / 2),
            font: aurignyFont,
            size: SECONDARY_TITLE_FONT_SIZE,
            color: rgb(0, 0, 0),
            lineHeight: LINE_HEIGHT
        })

        // update the space used
        usedSpace += valueTextHeight + (ELEMENT_PADDING / 2)

        // =================================================================================================

        // draw issuer title
        const issuerTitleText = "Issuer"
        const issuerTitleHeight = aurignyFont.heightAtSize(TITLE_FONT_SIZE);

        page.drawText(issuerTitleText, {
            x: ELEMENT_PADDING,
            y: (page.getHeight() - usedSpace - ELEMENT_PADDING) - (issuerTitleHeight / 2),
            font: aurignyFont,
            size: TITLE_FONT_SIZE,
            color: rgb(0, 0, 0),
            lineHeight: LINE_HEIGHT
        })

        // update the space used
        usedSpace += issuerTitleHeight + ELEMENT_PADDING

        // draw flight number value
        const issuerText = voucher.issuer.initials
        const issuerTextHeight = aurignyFont.heightAtSize(SECONDARY_TITLE_FONT_SIZE);

        page.drawText(issuerText, {
            x: ELEMENT_PADDING * 3,
            y: (page.getHeight() - usedSpace - (ELEMENT_PADDING / 2)) - (issuerTextHeight / 2),
            font: aurignyFont,
            size: SECONDARY_TITLE_FONT_SIZE,
            color: rgb(0, 0, 0),
            lineHeight: LINE_HEIGHT
        })

        // update the space used
        usedSpace += issuerTextHeight + (ELEMENT_PADDING / 2)

        // =================================================================================================

        // draw disclaimer
        const disclaimer = "Aurigny T&Cs apply.\n" +
            "This voucher can only be redeemed on the date shown above. No change will be given if " +
            "expenditure is less than the voucher value.This voucher is not transferable for cash.\n" +
            `Generated on ${moment().format("L")} at ${moment().format("LT")}. Voucher #${i + 1}`

        page.drawText(disclaimer, {
            x: ELEMENT_PADDING,
            y: (page.getHeight() - usedSpace - (ELEMENT_PADDING / 2)) - (issuerTextHeight / 2),
            font: aurignyFont,
            size: DISCLAIMER_FONT_SIZE,
            color: rgb(0, 0, 0),
            lineHeight: DISCLAIMER_LINE_HEIGHT,
            maxWidth: page.getWidth() - ELEMENT_PADDING
        })

    }

    let config: Config;
    try {
        const configStr = readConfig();
        config = JSON.parse(configStr);
    } catch (e) {
        config = defaultConfig;
    }

    // make the vouchers directory if it doesn't exist
    if (!existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir);
    }

    fs.writeFileSync(`${config.outputDir}/${voucher.flightNumber}_${voucher.issuer.initials}_voucher.pdf`, await voucherPdf.save());

}

// 80 x 115
