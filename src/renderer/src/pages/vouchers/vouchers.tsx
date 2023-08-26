import Navbar from "@renderer/components/Navbar/Navbar"
import "./vouchers.css"
import { useEffect, useState } from "react"
import { VoucherDetails } from "../../../../types/voucher"
import Button from "@renderer/components/Buttons/Button"
import Modal from "@renderer/components/Modal/Modal"
import Select from "react-select"

function Vouchers() {
    const [vouchers, setVouchers] = useState<VoucherDetails[]>([])

    const [showErrorModal, setShowErrorModal] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showPrintModal, setShowPrintModal] = useState(false)

    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const [printers, setPrinters] = useState<{ label: string; value: string }[]>([])
    const [selectedPrinterId, setSelectedPrinterId] = useState<string>()
    const [selectedVoucher, setSelectedVoucher] = useState<VoucherDetails>()

    // get vouchers
    useEffect(() => {
        let isVouchersGetSubscribed = true;
        window.api
            .getVouchers()
            .then((res: VoucherDetails[]) => {
                if (isVouchersGetSubscribed) {
                    setVouchers(res)
                }
            })
            .catch((err) => {
                console.error(err)
                setError("Could not get the list of vouchers.")
                setShowErrorModal(true)
            })
        return () => {
            // cleanup
            isVouchersGetSubscribed = false;
        }
    }, [])

    const deleteVoucher = (voucherToDelete: VoucherDetails) => {
        window.api
            .deleteVoucher(voucherToDelete)
            .then(() => {
                setVouchers(vouchers.filter((voucher) => voucher.id !== voucherToDelete.id))
                setSuccessMessage("The voucher was deleted.")
                setShowSuccessModal(true)
            })
            .catch((err) => {
                setVouchers(vouchers.filter((voucher) => voucher.id !== voucherToDelete.id))
                console.error(err)
                setError("The selected voucher does not exist, it will be removed from the list.")
                setShowErrorModal(true)
            })
    }

    const getPrinters = async () => {
        try {
            const printers = await window.api.getPrinters()
            setPrinters(
                printers.map((printer) => ({ label: printer.name, value: printer.deviceId }))
            )
        } catch (err) {
            console.error(err)
            setShowPrintModal(false)
            setError("Could not get printers.")
            setShowErrorModal(true)
        }
    }

    const openPrintMenu = async (voucher: VoucherDetails) => {
        setShowPrintModal(true)
        setSelectedVoucher(voucher)
        await getPrinters()
    }

    const printVoucher = () => {
        if (!selectedPrinterId || !selectedVoucher) {
            return
        }
        window.api
            .print(selectedPrinterId, selectedVoucher)
            .then(() => {
                setSuccessMessage("The voucher was sent to the printer.")
            })
            .catch((err) => {
                console.error(err)
                setShowPrintModal(false)
                setError("Could not print voucher. This could be because the job was cancelled.")
                setShowErrorModal(true)
            })
    }

    const showVoucher = (voucherDir: string) => {
        window.api.showVoucher(voucherDir)
    }

    return (
        <>
            <Navbar />
            <div className="container">
                <h1 style={{ margin: "0 0 0.5rem 0" }}>Vouchers</h1>
                <div className="vouchers">
                    {vouchers.length < 1 ? (
                        <em>No vouchers.</em>
                    ) : (
                        vouchers.map((voucher: VoucherDetails, index: number) => {
                            return (
                                <div
                                    className="card voucher-card"
                                    style={{ width: "100%" }}
                                    key={index}
                                >
                                    <div className="voucher-details">
                                        <h2>Voucher #{voucher.id}</h2>
                                        <span className="voucher-subtitle">
                                            Generated on {voucher.generatedTime.date} at{" "}
                                            {voucher.generatedTime.time}
                                            &nbsp;by {voucher.issuer} for {voucher.flightNumber}.
                                        </span>
                                    </div>
                                    <div className="btn-group">
                                        <Button
                                            className="primary-button"
                                            onClick={() => showVoucher(voucher.outputDir)}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            className="primary-button"
                                            onClick={() => openPrintMenu(voucher)}
                                        >
                                            Print
                                        </Button>
                                        <Button
                                            className="secondary-button"
                                            onClick={() => deleteVoucher(voucher)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
            <Modal show={showErrorModal} type={"error"}>
                <div>
                    <div>
                        <h1 style={{ margin: "0 0 0.5rem 0" }}>An Error Occurred!</h1>
                    </div>
                    <div>
                        {error ||
                            "The selected voucher could not be found. It will be removed from the list."}
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                        <div
                            style={{
                                display: "flex",
                                gap: "0.5rem",
                                justifyContent: "end",
                                width: "100%"
                            }}
                        >
                            <Button
                                className="ghost-button"
                                onClick={() => {
                                    setShowErrorModal(false)
                                    setError("")
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal show={showSuccessModal} type={"success"}>
                <div>
                    <div>
                        <h1 style={{ margin: "0 0 0.5rem 0" }}>Success!</h1>
                    </div>
                    <div>{successMessage || "Success!"}</div>
                    <div style={{ marginTop: "0.5rem" }}>
                        <div
                            style={{
                                display: "flex",
                                gap: "0.5rem",
                                justifyContent: "end",
                                width: "100%"
                            }}
                        >
                            <Button
                                className="ghost-button"
                                onClick={() => {
                                    setShowSuccessModal(false)
                                    setSuccessMessage("")
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal show={showPrintModal}>
                <div>
                    <div>
                        <h1 style={{ margin: "0 0 0.5rem 0" }}>Print</h1>
                    </div>
                    <div>
                        <Select
                            options={printers}
                            placeholder={printers.length < 1 ? "Loading..." : "Select a printer"}
                            isDisabled={printers.length < 1}
                            onChange={(e) => setSelectedPrinterId(e?.value)}
                        />
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                        <div
                            style={{
                                display: "flex",
                                gap: "0.5rem",
                                justifyContent: "end",
                                width: "100%"
                            }}
                        >
                            <Button
                                className="primary-button"
                                onClick={() => {
                                    printVoucher()
                                }}
                            >
                                Print
                            </Button>
                            <Button
                                className="ghost-button"
                                onClick={() => setShowPrintModal(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default Vouchers
