import { useEffect, useState } from "react";
import './home.css'
import Navbar from "./components/Navbar/Navbar"
import Select from "react-select"
import Modal from "./components/Modal/Modal";
import Button from "./components/Buttons/Button";
import { Voucher } from "../../types/voucher";
import { Issuer } from "../../types/issuer";
import { Config } from "../../types/config";

const emptyVoucher = {
    flightNumber: "",
    date: new Date(),
    value: "",
    reason: "",
    count: 1,
    issuer: { initials: "", name: "" }
}

function Home() {

    const [issuers, setIssuers] = useState<{ label: string; value: string }[]>([]);
    const [voucher, setVoucher] = useState<Voucher>(structuredClone(emptyVoucher));
    const [error, setError] = useState("");

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showLoadingModal, setShowLoadingModal] = useState(false)
    const [showErrorModal, setShowErrorModal] = useState(false);

    const [config, setConfig] = useState<Config>()

    // get the list of issuers
    useEffect(() => {
        window.api.getAllIssuers().then((res: Issuer[]) => {
            const selectItems: { label: string; value: string }[] = [];
            for (const issuer of res) {
                if (!issuer.initials || !issuer.name) {
                    throw Error("Invalid issuer.")
                }
                selectItems.push({ label: `${issuer.name} (${issuer.initials})`, value: issuer.initials })
            }
            setIssuers(selectItems);
        }).catch((err) => {
            console.error(err);
            setError("Could not get the list of issuers.")
            setShowErrorModal(true);
        });
    }, [])

    useEffect(() => {
        window.api.getConfig().then((res) => {
            const parsedConfig: Config = JSON.parse(res);
            setConfig(parsedConfig)
        })
    }, [])

    // create a new voucher
    const postVoucher = () => {
        setShowLoadingModal(true);
        window.api.addVoucher(JSON.stringify(voucher)).then((_) => {
            window.location.href = "#/jobs"
        }).catch((err) => {
            console.error(err);
            setShowLoadingModal(false);
            setError("Could not create the vouchers. Ensure all fields are completed correctly.")
            setShowErrorModal(true);
        })
    }

    return (
        <>
            <Navbar activePage="home" />
            <div className="container">
                <h1 style={{ margin: "0 0 0.5rem 0" }}>Issue Vouchers</h1>
                <form>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                        <label>
                            <span>Flight Number</span>
                            <input type="text" value={voucher.flightNumber} onChange={((e) => setVoucher({ ...voucher, flightNumber: e.target.value }))} />
                            <span className="input-hint">Required</span>
                        </label>
                        <label>
                            <span>Date</span>
                            <input type="date" value={voucher.date.toISOString().substring(0, 10)} onChange={((e) => setVoucher({ ...voucher, date: new Date(e.target.value) }))} />
                            <span className="input-hint">Required</span>
                        </label>
                        <label>
                            <span>Value</span>
                            <div className="show-pound">
                                <input type="number" step="0.01" value={voucher.value} onChange={((e) => setVoucher({ ...voucher, value: e.target.value }))} />
                            </div>
                            <span className="input-hint">Required</span>
                        </label>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                        <label style={{ width: "50%" }}>
                            <span>Reason for Issue</span>
                            <textarea value={voucher.reason} onChange={((e) => setVoucher({ ...voucher, reason: e.target.value }))} />
                            <span className="input-hint">Required</span>
                        </label>
                        <label style={{ width: "20%" }}>
                            <span>Number of Vouchers</span>
                            <input type="number" step="1" value={voucher.count} onChange={((e) => setVoucher({ ...voucher, count: +e.target.value }))} />
                            <span className="input-hint">Required</span>
                        </label>
                    </div>
                    <div>
                        <label style={{ width: "40%" }}>
                            <span>Issuer</span>
                            <Select options={issuers} value={{ label: voucher.issuer.name, value: voucher.issuer.initials }} onChange={((e) => setVoucher({ ...voucher, issuer: { name: e?.label || "", initials: e?.value || "" } }))} />
                            <span className="input-hint">Required</span>
                        </label>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                        <Button className="primary-button"
                            disabled={
                                !voucher.flightNumber ||
                                !voucher.date ||
                                !voucher.reason ||
                                !voucher.value ||
                                !voucher.issuer.initials ||
                                !voucher.count
                            }
                            onClick={() => postVoucher()}
                        >Generate Vouchers</Button>
                        <Button type={"button"} className="secondary-button" disabled={false} onClick={() => setVoucher(structuredClone(emptyVoucher))}>Reset</Button>
                    </div>
                </form>
            </div>
            <Modal show={showErrorModal} type={"error"}>
                <div>
                    <div>
                        <h1 style={{ margin: "0 0 0.5rem 0" }}>An Error Occurred!</h1>
                    </div>
                    <div>
                        {error || "An error occurred. Review the console for details."}
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "end", width: "100%" }}>
                            <Button className="ghost-button" onClick={() => {
                                setShowErrorModal(false);
                                setError("");
                            }}>Close</Button>
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal show={showLoadingModal}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}><span className="loader"></span></div>
                    <div>Generating vouchers, this could take a while.</div>
                </div>
            </Modal>
            <Modal show={showSuccessModal} type={"success"}>
                <div>
                    <div>
                        <h1 style={{ margin: "0 0 0.5rem 0" }}>Success!</h1>
                    </div>
                    <div>
                        {config?.outputDir ? `Your vouchers have been generated and are stored in ${config.outputDir}.` : "Your PDFs have been generated." }
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "end", width: "100%" }}>
                            <Button className="ghost-button" onClick={() => setShowSuccessModal(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default Home
